import React, { useState, useEffect } from 'react';
import { Users } from "lucide-react";

interface InstagramFollowerCounterProps {
  initialCount: number;
}

export function InstagramFollowerCounter({ initialCount }: InstagramFollowerCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [displayCount, setDisplayCount] = useState(initialCount);
  
  useEffect(() => {
    // Simulated real-time update: increment by 1 every 30-120 seconds
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, Math.random() * 90000 + 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate display count if it changes
    if (displayCount < count) {
      const timer = setTimeout(() => {
        setDisplayCount(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount]);

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
          <span>ATUALIZANDO EM TEMPO REAL</span>
        </div>
      </div>
    </div>
  );
}
