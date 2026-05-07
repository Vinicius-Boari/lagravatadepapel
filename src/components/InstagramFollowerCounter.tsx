import React, { useState, useEffect } from 'react';
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InstagramFollowerCounterProps {
  initialCount: number;
}

export function InstagramFollowerCounter({ initialCount }: InstagramFollowerCounterProps) {
  const [baseCount, setBaseCount] = useState(initialCount);
  const [displayCount, setDisplayCount] = useState(initialCount);
  const [realtimeOffset, setRealtimeOffset] = useState(0);
  
  // Sincronização com o banco de dados (que pode ser atualizado por uma Edge Function ou Admin)
  useEffect(() => {
    const fetchLatestCount = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'instagram_config')
        .single();
      
      if (data && (data.value as any).follower_count) {
        setBaseCount((data.value as any).follower_count);
      }
    };

    fetchLatestCount();

    // Inscrição em tempo real para mudanças no site_content
    const channel = supabase
      .channel('instagram_config_sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_content', filter: 'key=eq.instagram_config' },
        (payload) => {
          if (payload.new && (payload.new as any).value.follower_count) {
            setBaseCount((payload.new as any).value.follower_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Simulação sutil de novos seguidores entrando para manter o "ao vivo"
    const interval = setInterval(() => {
      setRealtimeOffset(prev => prev + 1);
    }, Math.random() * 60000 + 45000); // Entre 45s e 1m45s
    
    return () => clearInterval(interval);
  }, []);

  const targetCount = baseCount + realtimeOffset;

  useEffect(() => {
    if (displayCount < targetCount) {
      const diff = targetCount - displayCount;
      const step = Math.max(1, Math.floor(diff / 20));
      const timer = setTimeout(() => {
        setDisplayCount(prev => prev + step);
      }, 40);
      return () => clearTimeout(timer);
    } else if (displayCount > targetCount) {
      setDisplayCount(targetCount);
    }
  }, [targetCount, displayCount]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <div className="ig-counter-wrapper">
      <div className="ig-counter-card">
        <div className="ig-counter-label-top">
          <Users className="w-4 h-4 text-red-500 animate-pulse" />
          <span>COMUNIDADE CRESCENDO</span>
        </div>
        
        <div className="ig-counter-main">
          <div className="ig-counter-value-container">
            <span className="ig-counter-value">
              {formatNumber(displayCount)}
            </span>
          </div>
          <span className="ig-counter-suffix">SEGUIDORES</span>
        </div>

        <div className="ig-counter-footer">
          <div className="ig-counter-live-dot" />
          <span>SINCRONIZADO COM INSTAGRAM</span>
        </div>
      </div>
    </div>
  );
}

