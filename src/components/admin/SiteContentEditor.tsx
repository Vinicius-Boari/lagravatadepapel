import { useState, useEffect, useRef, useCallback } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Plus, Trash2, Video, Upload, Loader2, Search, Globe } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const [hero, setHero] = useState<any>(content.hero || {});
  const [about, setAbout] = useState<any>(content.about || {});
  const [plan, setPlan] = useState<any>(content.plan || {});
  const [services, setServices] = useState<any>(content.services || { items: [] });
  const [videos, setVideos] = useState<any>(content.videos || { items: [] });
  const [places, setPlaces] = useState<any>(content.places || { items: [] });
  const [footer, setFooter] = useState<any>(content.footer || {});
  const [seo, setSeo] = useState<any>(content.seo || {});
  const [languages, setLanguages] = useState<any>(content.languages || {});

  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (!loading && isInitialLoad.current) {
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
  }, [loading, content]);

  const handleSave = useCallback(async (section: string, data: any) => {
    if (!data) return;
    setLoading(true);
    try {
      await updateSection(section, data, false);
      showToast("Salvo com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao salvar.", "error");
      throw err;
    } finally {
      setLoading(false);
    }
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
        } catch {
          setStatus('error');
        }
      }}
      className={cn("transition-all duration-300", getSaveButtonStyles(status))}
    >
      {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
      {status === 'saved' ? 'Salvo!' : status === 'error' ? 'Erro!' : 'Salvar'}
    </Button>
  );

  if (contentLoading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center sticky top-16 bg-zinc-950/80 backdrop-blur-sm z-50 py-4 -mt-4 border-b border-zinc-800/50">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Conteúdo do Site</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { id: "hero", label: "Home" },
          { id: "services", label: "Serviços" },
          { id: "videos", label: "Vídeos" },
          { id: "places", label: "Invasões" },
          { id: "plan", label: "O Plano" },
          { id: "about", label: "Sobre" },
          { id: "footer", label: "Rodapé" },
          { id: "seo", label: "SEO" },
          { id: "languages", label: "Idiomas" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              "flex items-center justify-center p-3 rounded-lg border transition-all text-sm font-medium",
              activeSection === tab.id ? "bg-red-600 text-white" : "bg-zinc-900 border-zinc-800 text-red-500"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === "hero" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Cabeçalho (Hero)</CardTitle>
            <SaveBtn section="hero" data={hero} status={heroStatus} setStatus={setHeroStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="text-red-500">Subtítulo</Label>
            <Textarea value={hero.subtitle} onChange={e => setHero({...hero, subtitle: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "services" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Serviços</CardTitle>
            <SaveBtn section="services" data={services} status={servicesStatus} setStatus={setServicesStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={services.heading} onChange={e => setServices({...services, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "videos" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Vídeos</CardTitle>
            <SaveBtn section="videos" data={videos} status={videosStatus} setStatus={setVideosStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={videos.heading} onChange={e => setVideos({...videos, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "places" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Invasões</CardTitle>
            <SaveBtn section="places" data={places} status={placesStatus} setStatus={setPlacesStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={places.heading} onChange={e => setPlaces({...places, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "plan" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">O Plano</CardTitle>
            <SaveBtn section="plan" data={plan} status={planStatus} setStatus={setPlanStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={plan.heading} onChange={e => setPlan({...plan, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "about" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Sobre</CardTitle>
            <SaveBtn section="about" data={about} status={aboutStatus} setStatus={setAboutStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={about.heading} onChange={e => setAbout({...about, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "footer" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Rodapé</CardTitle>
            <SaveBtn section="footer" data={footer} status={footerStatus} setStatus={setFooterStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={footer.copyright} onChange={e => setFooter({...footer, copyright: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "seo" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">SEO</CardTitle>
            <SaveBtn section="seo" data={seo} status={seoStatus} setStatus={setSeoStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={seo.title} onChange={e => setSeo({...seo, title: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
          </CardContent>
        </Card>
      )}

      {activeSection === "languages" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle className="text-red-500">Idiomas</CardTitle>
            <SaveBtn section="languages" data={languages} status={langStatus} setStatus={setLangStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-500">Configurações de idiomas ativos.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
