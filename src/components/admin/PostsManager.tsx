import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAutosave } from "@/hooks/useAutosave";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Video, ImageIcon, Upload, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export function PostsManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Form state for selected post
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [midiaUrl, setMidiaUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Erro ao carregar posts");
    } else {
      setPosts(data || []);
      if (data && data.length > 0 && selectedPostId === null) {
        setSelectedPostId(data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    // Realtime sync
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update form state when selection changes
  useEffect(() => {
    if (selectedPostId) {
      const post = posts.find(p => p.id === selectedPostId);
      if (post) {
        setTitulo(post.titulo || "");
        setConteudo(post.conteudo || "");
        setMidiaUrl(post.midia_url || "");
      }
    }
  }, [selectedPostId, posts]);

  const handleSave = async (data: any) => {
    if (!selectedPostId) return;
    
    const { error } = await supabase
      .from("posts")
      .upsert({
        id: selectedPostId,
        titulo: data.titulo,
        conteudo: data.conteudo,
        midia_url: data.midia_url,
      });

    if (error) {
      throw error;
    }
  };

  const { status } = useAutosave(
    { titulo, conteudo, midia_url: midiaUrl },
    handleSave,
    1000,
    selectedPostId ? `post_backup_${selectedPostId}` : undefined
  );

  const handleCreatePost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .insert([{ titulo: "Novo Post", conteudo: "" }])
      .select();

    if (error) {
      toast.error("Erro ao criar post");
    } else if (data) {
      setPosts([data[0], ...posts]);
      setSelectedPostId(data[0].id);
      toast.success("Post criado com sucesso!");
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir post");
    } else {
      const newPosts = posts.filter(p => p.id !== id);
      setPosts(newPosts);
      if (selectedPostId === id) {
        setSelectedPostId(newPosts.length > 0 ? newPosts[0].id : null);
      }
      toast.success("Post excluído");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPostId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `post-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('midias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('midias')
        .getPublicUrl(filePath);

      setMidiaUrl(publicUrl);
      toast.success("Mídia enviada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.titulo.toLowerCase().includes(search.toLowerCase()) || 
    p.conteudo?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 md:top-16 bg-zinc-950/80 backdrop-blur-sm z-[60] py-4 -mt-4 border-b border-zinc-800/50 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Gestão de Posts / Feed</h2>
          <p className="text-red-500/70">Crie e edite conteúdos dinâmicos para o site.</p>
        </div>
        <div className="flex items-center gap-4">
          <AutosaveIndicator status={status} />
          <Button onClick={handleCreatePost} className="bg-red-600 hover:bg-red-700 text-white border-none">
            <Plus className="mr-2 w-4 h-4" />
            Novo Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar / List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              className="pl-10 bg-zinc-900 border-zinc-800 text-red-500" 
              placeholder="Buscar posts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {filteredPosts.map(post => (
              <div 
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer group flex justify-between items-center ${
                  selectedPostId === post.id 
                    ? "bg-red-900/20 border-red-500 text-red-400" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-red-900/50 hover:text-red-500/70"
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-bold truncate">{post.titulo || "Sem título"}</span>
                  <span className="text-[10px] uppercase tracking-tighter opacity-50">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePost(post.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {filteredPosts.length === 0 && (
              <div className="text-center py-10 text-zinc-600 italic text-sm">Nenhum post encontrado.</div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selectedPostId ? (
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl border-t-2 border-t-red-600">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-red-500 uppercase text-[10px] font-bold tracking-widest">Título do Post</Label>
                  <Input 
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-red-500 text-lg font-bold h-12 focus:border-red-500 transition-colors"
                    placeholder="Ex: Invasão no Casamento de Maria & João"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-red-500 uppercase text-[10px] font-bold tracking-widest">Conteúdo / Descrição</Label>
                  <Textarea 
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-red-500 min-h-[200px] focus:border-red-500 transition-colors"
                    placeholder="Conte como foi essa invasão..."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <Label className="text-red-500 uppercase text-[10px] font-bold tracking-widest flex items-center">
                    <ImageIcon className="w-3 h-3 mr-2" /> Mídia (Foto ou Vídeo)
                  </Label>
                  
                  <div className="flex gap-4">
                    <Input 
                      value={midiaUrl}
                      onChange={(e) => setMidiaUrl(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-red-500 flex-1"
                      placeholder="URL da imagem ou vídeo..."
                    />
                    <input 
                      type="file" 
                      id="post-media-upload"
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={handleUpload}
                    />
                    <Button 
                      onClick={() => document.getElementById('post-media-upload')?.click()}
                      disabled={uploading}
                      className="border-red-900 text-red-500 hover:bg-red-900/10 variant-outline"
                      variant="outline"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload
                    </Button>
                  </div>

                  {midiaUrl && (
                    <div className="mt-4 relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group">
                      {midiaUrl.match(/\.(mp4|webm|ogg)$/i) || midiaUrl.includes('video') ? (
                        <video src={midiaUrl} className="w-full h-full object-contain" controls />
                      ) : (
                        <img src={midiaUrl} className="w-full h-full object-contain" />
                      )}
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setMidiaUrl("")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 border-2 border-dashed border-zinc-800 rounded-2xl p-20">
              <FileText className="w-16 h-16 opacity-10" />
              <p className="italic">Selecione um post ao lado ou crie um novo para começar a editar.</p>
              <Button onClick={handleCreatePost} variant="outline" className="border-zinc-800 text-zinc-400">
                Criar primeiro post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { FileText } from "lucide-react";
