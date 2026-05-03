import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Video, ImageIcon, Upload, Loader2, Search, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";

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

  const { status, setSaveStatus } = useSaveStatus();

  const handleManualSave = async () => {
    if (!selectedPostId) return;
    setSaveStatus('saving');
    
    try {
      console.log("[PostsManager] Saving post:", { id: selectedPostId, titulo, conteudo, midiaUrl });
      const { error } = await supabase
        .from("posts")
        .upsert({
          id: selectedPostId,
          titulo,
          conteudo,
          midia_url: midiaUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setSaveStatus('saved');
      toast.success("Post salvo com sucesso!");
      await fetchPosts(); // Refresh list to ensure UI is in sync
    } catch (err: any) {
      console.error("[PostsManager] Error saving post:", err);
      setSaveStatus('error');
      toast.error(`Erro ao salvar post: ${err.message || "Erro desconhecido"}`);
    }
  };

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
      const fileExt = file.name.split('.').pop()?.toLowerCase();
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

  if (loading) return <div className="p-8 flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 md:top-16 bg-zinc-950/80 backdrop-blur-sm z-[60] py-4 -mt-4 border-b border-zinc-800/50 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Gestão de Posts / Feed</h2>
          <p className="text-red-500/70">Crie e edite conteúdos dinâmicos para o site.</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedPostId && (
            <Button 
              onClick={handleManualSave}
              className={cn("transition-all duration-300 w-32", getSaveButtonStyles(status))}
            >
              {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {status === 'saved' ? 'Salvo!' : status === 'error' ? 'Erro!' : 'Salvar'}
            </Button>
          )}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-red-500 uppercase text-[10px] font-bold tracking-widest">Conteúdo</Label>
                  <Textarea 
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-red-500 min-h-[200px] focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <Label className="text-red-500 uppercase text-[10px] font-bold tracking-widest flex items-center">
                    <ImageIcon className="w-3 h-3 mr-2" /> Mídia
                  </Label>
                  <div className="flex gap-4">
                    <Input 
                      value={midiaUrl}
                      onChange={(e) => setMidiaUrl(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-red-500 flex-1"
                    />
                    <input type="file" id="post-upload" className="hidden" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime" onChange={handleUpload} />
                    <Button onClick={() => document.getElementById('post-upload')?.click()} variant="outline" className="border-red-900 text-red-500">
                      {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
                  <Button 
                    variant="ghost" 
                    className="text-red-900 hover:text-red-500 hover:bg-red-900/10"
                    onClick={() => handleDeletePost(selectedPostId)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Post
                  </Button>
                  <Button 
                    onClick={handleManualSave}
                    className={cn("transition-all duration-300 w-full md:w-48 text-lg font-bold h-12 shadow-lg", getSaveButtonStyles(status))}
                  >
                    {status === 'saving' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {status === 'saved' ? 'Post Salvo!' : status === 'error' ? 'Erro!' : 'Salvar Post Agora'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl p-20">
              <FileText className="w-16 h-16 opacity-10" />
              <p className="italic">Selecione um post para editar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
