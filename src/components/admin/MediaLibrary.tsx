import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Video, ImageIcon, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export function MediaLibrary() {
  const { content, loading } = useSiteContent();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [mediaItems, setMediaItems] = useState<any[]>([]);

  useEffect(() => {
    if (!loading) {
      // Gather all media from different sections
      const hero = content.hero || {};
      const services = content.services?.items || [];
      const videos = content.videos?.items || [];
      const about = content.about || {};

      const items: any[] = [];

      if (hero.video_url) items.push({ type: 'video', src: hero.video_url, source: 'Hero Background' });
      if (hero.image1) items.push({ type: 'image', src: hero.image1, source: 'Hero Card 1' });
      if (hero.image2) items.push({ type: 'image', src: hero.image2, source: 'Hero Card 2' });
      if (hero.image3) items.push({ type: 'image', src: hero.image3, source: 'Hero Card 3' });

      services.forEach((s: any, i: number) => {
        if (s.image) items.push({ type: 'image', src: s.image, source: `Serviço: ${s.title || i+1}` });
      });

      videos.forEach((v: any, i: number) => {
        if (v.src) items.push({ type: 'video', src: v.src, source: `Galeria: ${v.title || i+1}`, poster: v.poster });
        if (v.poster) items.push({ type: 'image', src: v.poster, source: `Capa: ${v.title || i+1}` });
      });

      if (about.image) items.push({ type: 'image', src: about.image, source: 'Sobre Nós' });

      setMediaItems(items);
    }
  }, [loading, content]);

  const filteredItems = mediaItems.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch = item.source.toLowerCase().includes(search.toLowerCase()) || 
                          item.src.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Biblioteca de Mídia</h2>
          <p className="text-red-500/70">Visualize e gerencie todos os arquivos de imagem e vídeo do site.</p>
        </div>
        <Button onClick={() => toast.info("Funcionalidade de upload direto em breve. Use as seções de conteúdo para trocar links.")}>
          <Plus className="mr-2 w-4 h-4" />
          Fazer Upload
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              className="pl-10 bg-zinc-800 border-red-900 text-red-500" 
              placeholder="Buscar por fonte ou URL..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "" : "border-red-900 text-red-500"}
            >
              Todos
            </Button>
            <Button 
              variant={filter === "image" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("image")}
              className={filter === "image" ? "" : "border-red-900 text-red-500"}
            >
              Imagens
            </Button>
            <Button 
              variant={filter === "video" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("video")}
              className={filter === "video" ? "" : "border-red-900 text-red-500"}
            >
              Vídeos
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredItems.map((item, i) => (
          <div key={i} className="group relative bg-zinc-900 rounded-lg border border-red-900/20 overflow-hidden hover:border-red-500 transition-all shadow-lg">
            <div className="aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
              {item.type === 'image' ? (
                <img src={item.src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="relative w-full h-full">
                   <video src={item.src} className="w-full h-full object-cover" muted />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                     <Video className="w-8 h-8 text-white" />
                   </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] text-red-500/50 uppercase font-bold tracking-wider mb-1">{item.source}</p>
              <p className="text-xs text-zinc-400 truncate font-mono">{item.src.split('/').pop()}</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => toast.error("Remova o link na seção de conteúdo correspondente.")}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-zinc-500 italic">
            Nenhum arquivo encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
