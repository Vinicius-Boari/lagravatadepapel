import { useState, useEffect, useRef, useCallback } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Plus, Trash2, Video, ImageIcon, Upload, Loader2, Search, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";

const showToast = (message: string, type: 'success' | 'error') => {
  if (type === 'success') {
    toast.success(message, { position: "top-center", duration: 4000 });
  } else {
    toast.error(message, { position: "top-center", duration: 5000 });
  }
};

const ImageUpload = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `site_content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Upload realizado com sucesso!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao fazer upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-red-500">{label}</Label>
      <div className="flex gap-2">
        <Input 
          className="bg-zinc-800 border-red-900 text-red-500 flex-1" 
          value={value} 
          placeholder="URL da imagem..."
          onChange={(e) => onChange(e.target.value)}
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*"
          onChange={handleUpload}
        />
        <Button 
          type="button"
          size="icon" 
          variant="outline" 
          className="border-red-900 text-red-500 hover:bg-red-900/20"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
      </div>
      {value && (
        <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-red-900/30 bg-zinc-950">
          {value.match(/\.(mp4|webm|ogg)$/i) || value.includes('video') ? (
            <video src={value} className="w-full h-full object-contain" muted />
          ) : (
            <img src={value} className="w-full h-full object-contain" />
          )}
        </div>
      )}
    </div>
  );
};

export function SiteContentEditor() {
  const { content, updateSection, loading: contentLoading } = useSiteContent();
  const [activeSection, setActiveSection] = useState("hero");

  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [plan, setPlan] = useState<any>({});
  const [services, setServices] = useState<any>({ items: [] });
  const [videos, setVideos] = useState<any>({ items: [] });
  const [places, setPlaces] = useState<any>({ items: [] });
  const [footer, setFooter] = useState<any>({});
  const [seo, setSeo] = useState<any>({});
  const [languages, setLanguages] = useState<any>({});

  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (!contentLoading && isInitialLoad.current && Object.keys(content).length > 0) {
      setHero(content.hero || {});
      setAbout(content.about || {});
      setPlan(content.plan || {});
      setServices(content.services || { items: [] });
      setVideos(content.videos || { items: [] });
      setPlaces(content.places || { items: [] });
      setFooter(content.footer || {});
      setSeo(content.seo || {});
      setLanguages(content.languages || {});
      isInitialLoad.current = false;
    }
  }, [contentLoading, content]);

  const handleSave = useCallback(async (section: string, data: any) => {
    if (!data || Object.keys(data).length === 0) {
      console.warn(`[SiteContentEditor] Tentativa de salvar seção ${section} vazia.`);
      return;
    }
    console.log(`[SiteContentEditor] Calling updateSection for: ${section}`, data);
    const success = await updateSection(section, data, false);
    return success;
  }, [updateSection]);

  const { status: heroStatus, setSaveStatus: setHeroStatus } = useSaveStatus();
  const { status: aboutStatus, setSaveStatus: setAboutStatus } = useSaveStatus();
  const { status: planStatus, setSaveStatus: setPlanStatus } = useSaveStatus();
  const { status: servicesStatus, setSaveStatus: setServicesStatus } = useSaveStatus();
  const { status: videosStatus, setSaveStatus: setVideosStatus } = useSaveStatus();
  const { status: placesStatus, setSaveStatus: setPlacesStatus } = useSaveStatus();
  const { status: footerStatus, setSaveStatus: setFooterStatus } = useSaveStatus();
  const { status: seoStatus, setSaveStatus: setSeoStatus } = useSaveStatus();
  const { status: langStatus, setSaveStatus: setLangStatus } = useSaveStatus();

  const SaveBtn = ({ section, data, status, setStatus }: any) => (
    <Button 
      onClick={async () => {
        setStatus('saving');
        try {
          await handleSave(section, data);
          setStatus('saved');
          showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} salvo com sucesso!`, 'success');
        } catch {
          setStatus('error');
          showToast(`Erro ao salvar ${section}.`, 'error');
        }
      }}
      className={cn("transition-all duration-300 w-32", getSaveButtonStyles(status))}
    >
      {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
      {status === 'saved' ? 'Salvo!' : status === 'error' ? 'Erro!' : 'Salvar'}
    </Button>
  );

  if (contentLoading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 md:top-16 bg-zinc-950/80 backdrop-blur-sm z-[60] py-4 -mt-4 border-b border-zinc-800/50 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Conteúdo do Site</h2>
          
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { id: "hero", label: "Home / Hero" },
          { id: "services", label: "Serviços" },
          { id: "videos", label: "Vídeos" },
          { id: "places", label: "Nossas Invasões" },
          { id: "plan", label: "O Plano" },
          { id: "about", label: "Sobre" },
          { id: "footer", label: "Rodapé" },
          { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
          { id: "languages", label: "Idiomas", icon: <Globe className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all text-sm font-medium",
              activeSection === tab.id
                ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20"
                : "bg-zinc-900 border-zinc-800 text-red-500/70 hover:border-red-900/50 hover:bg-zinc-800"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === "hero" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500">Cabeçalho (Hero)</CardTitle>
              <CardDescription className="text-red-500/60">Primeira seção visível do site.</CardDescription>
            </div>
            <SaveBtn section="hero" data={hero} status={heroStatus} setStatus={setHeroStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-red-500">Linhas do Título</Label>
                <Textarea 
                  rows={4} 
                  className="bg-zinc-800 border-red-900 text-red-500" 
                  value={hero.title_lines?.join("\n") || ""}
                  onChange={(e) => setHero({...hero, title_lines: e.target.value.split("\n")})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Subtítulo</Label>
                <Textarea 
                  className="bg-zinc-800 border-red-900 text-red-500" 
                  value={hero.subtitle || ""}
                  onChange={(e) => setHero({...hero, subtitle: e.target.value})}
                />
              </div>
            </div>
            <ImageUpload label="URL do Vídeo de Fundo" value={hero.video_url || ""} onChange={val => setHero({...hero, video_url: val})} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <ImageUpload label="Imagem Card 1" value={hero.image1 || ""} onChange={val => setHero({...hero, image1: val})} />
              <ImageUpload label="Imagem Card 2" value={hero.image2 || ""} onChange={val => setHero({...hero, image2: val})} />
              <ImageUpload label="Imagem Card 3" value={hero.image3 || ""} onChange={val => setHero({...hero, image3: val})} />
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "services" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500">Serviços</CardTitle>
            </div>
            <SaveBtn section="services" data={services} status={servicesStatus} setStatus={setServicesStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Título</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={services.heading || ""} onChange={e => setServices({...services, heading: e.target.value})} />
              </div>
            </div>
            <div className="space-y-4 pt-4">
               <Button size="sm" variant="outline" className="border-red-900 text-red-500" onClick={() => setServices({...services, items: [...(services.items || []), {title: "Novo", desc: "", img: ""}]})}><Plus className="w-4 h-4 mr-1"/> Adicionar</Button>
               {services.items?.map((item: any, idx: number) => (
                 <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 space-y-4">
                   <Input value={item.title} onChange={e => { const newI = [...services.items]; newI[idx].title = e.target.value; setServices({...services, items: newI}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                   <ImageUpload label="Imagem" value={item.img} onChange={val => { const newI = [...services.items]; newI[idx].img = val; setServices({...services, items: newI}); }} />
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "videos" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">Vídeos</CardTitle></div>
            <SaveBtn section="videos" data={videos} status={videosStatus} setStatus={setVideosStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <Input value={videos.heading || ""} onChange={e => setVideos({...videos, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            <Button size="sm" variant="outline" className="border-red-900 text-red-500 mt-4" onClick={() => setVideos({...videos, items: [...(videos.items || []), {title: "Novo", src: ""}]})}><Plus className="w-4 h-4 mr-1"/> Adicionar</Button>
            {videos.items?.map((v: any, idx: number) => (
              <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 space-y-4 mt-2">
                <Input value={v.title} onChange={e => { const newV = [...videos.items]; newV[idx].title = e.target.value; setVideos({...videos, items: newV}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                <ImageUpload label="URL Vídeo" value={v.src} onChange={val => { const newV = [...videos.items]; newV[idx].src = val; setVideos({...videos, items: newV}); }} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === "places" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">Invasões</CardTitle></div>
            <SaveBtn section="places" data={places} status={placesStatus} setStatus={setPlacesStatus} />
          </CardHeader>
          <CardContent>
            <Input value={places.heading || ""} onChange={e => setPlaces({...places, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "plan" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">O Plano</CardTitle></div>
            <SaveBtn section="plan" data={plan} status={planStatus} setStatus={setPlanStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={plan.heading || ""} onChange={e => setPlan({...plan, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            <Textarea value={plan.text || ""} onChange={e => setPlan({...plan, text: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "about" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">Sobre</CardTitle></div>
            <SaveBtn section="about" data={about} status={aboutStatus} setStatus={setAboutStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={about.heading || ""} onChange={e => setAbout({...about, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            <ImageUpload label="Imagem" value={about.image || ""} onChange={val => setAbout({...about, image: val})} />
          </CardContent>
        </Card>
      )}

      {activeSection === "footer" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">Rodapé</CardTitle></div>
            <SaveBtn section="footer" data={footer} status={footerStatus} setStatus={setFooterStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={footer.copyright || ""} onChange={e => setFooter({...footer, copyright: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            <Input value={footer.hashtag || ""} onChange={e => setFooter({...footer, hashtag: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "seo" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">SEO</CardTitle></div>
            <SaveBtn section="seo" data={seo} status={seoStatus} setStatus={setSeoStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={seo.title || ""} onChange={e => setSeo({...seo, title: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            <Textarea value={seo.description || ""} onChange={e => setSeo({...seo, description: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "languages" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">Idiomas</CardTitle></div>
            <SaveBtn section="languages" data={languages} status={langStatus} setStatus={setLangStatus} />
          </CardHeader>
          <CardContent>
            <p className="text-red-500 italic">Idiomas ativos do site.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
