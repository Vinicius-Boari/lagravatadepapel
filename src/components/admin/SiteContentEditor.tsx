import { useState, useEffect, useRef, useCallback } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2, Video, ImageIcon, Upload, Loader2, Search, Globe, Instagram, MapPin, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";

const showToast = (message: string, type: 'success' | 'error') => {
  if (type === 'success') {
    toast.success(message, { position: "top-center", duration: 4000 });
  } else {
    toast.error(message, { position: "top-center", duration: 5000 });
  }
};

const ImageUpload = ({ 
  value, 
  onChange, 
  label, 
  showOnMobile = true, 
  onMobileToggle 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  label: string,
  showOnMobile?: boolean,
  onMobileToggle?: (val: boolean) => void
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `site_content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-media')
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
    <div className="space-y-2 flex-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-red-500">{label}</Label>
        {onMobileToggle && (
          <div className="flex items-center gap-2">
            <Label className="text-[9px] text-zinc-500 uppercase tracking-tighter">Mobile</Label>
            <Switch 
              checked={showOnMobile}
              onCheckedChange={onMobileToggle}
              className="h-4 w-7 data-[state=checked]:bg-red-600 scale-75"
            />
          </div>
        )}
      </div>
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
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
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
  const [coupons, setCoupons] = useState<any>({ items: [] });
  const [seo, setSeo] = useState<any>({});
  const [tropaConfig, setTropaConfig] = useState<any>({});
  const [languages, setLanguages] = useState<any>({});
  const [instagramConfig, setInstagramConfig] = useState<any>({});
  const { status: instagramStatus, setSaveStatus: setInstagramStatus } = useSaveStatus();
  const { status: couponsStatus, setSaveStatus: setCouponsStatus } = useSaveStatus();
  const { status: tropaStatus, setSaveStatus: setTropaStatus } = useSaveStatus();

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
      setCoupons(content.coupons || { items: [] });
      setSeo(content.seo || {});
      setTropaConfig(content.tropa_config || {});
      setLanguages(content.languages || {});
      setInstagramConfig(content.instagram_config || {});
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
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[SaveBtn] Clicked for section: ${section}`, data);
        setStatus('saving');
        try {
          const result = await handleSave(section, data);
          if (result) {
            setStatus('saved');
            showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} salvo com sucesso!`, 'success');
          } else {
            throw new Error("Falha ao salvar");
          }
        } catch (err: any) {
          console.error(`[SaveBtn] Error in section ${section}:`, err);
          setStatus('error');
          showToast(`Erro ao salvar ${section}: ${err.message || 'Erro desconhecido'}`, 'error');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-950/95 backdrop-blur-md z-[60] px-6 py-4 -mx-8 -mt-8 border-b border-zinc-800/80 shadow-2xl gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-red-600/10 p-2 rounded-lg">
            <Globe className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-500 leading-none">Conteúdo do Site</h2>
            <p className="text-[10px] text-red-500/50 uppercase tracking-widest mt-1">Gerencie as informações públicas</p>
          </div>
        </div>
        
        <Button 
          onClick={async () => {
            const btnMap: Record<string, any> = {
              hero: { data: hero, status: heroStatus, set: setHeroStatus },
              services: { data: services, status: servicesStatus, set: setServicesStatus },
              videos: { data: videos, status: videosStatus, set: setVideosStatus },
              places: { data: places, status: placesStatus, set: setPlacesStatus },
              plan: { data: plan, status: planStatus, set: setPlanStatus },
              about: { data: about, status: aboutStatus, set: setAboutStatus },
              footer: { data: footer, status: footerStatus, set: setFooterStatus },
              coupons: { data: coupons, status: couponsStatus, set: setCouponsStatus },
              seo: { data: seo, status: seoStatus, set: setSeoStatus },
              tropa: { data: tropaConfig, status: tropaStatus, set: setTropaStatus },
              languages: { data: languages, status: langStatus, set: setLangStatus },
              instagram: { data: instagramConfig, status: instagramStatus, set: setInstagramStatus },
            };
            const current = btnMap[activeSection];
            if (current) {
              current.set('saving');
              try {
                const saveKey = activeSection === 'instagram' ? 'instagram_config' : 
                               activeSection === 'tropa' ? 'tropa_config' : 
                               activeSection;
                const result = await handleSave(saveKey, current.data);
                if (result) {
                  current.set('saved');
                  showToast(`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} salvo com sucesso!`, 'success');
                } else {
                  throw new Error("Falha ao salvar");
                }
              } catch (err: any) {
                current.set('error');
                showToast(`Erro ao salvar ${activeSection}: ${err.message}`, 'error');
              }
            }
          }}
          size="sm"
          className={cn(
            "transition-all duration-300 w-40 font-bold shadow-lg h-10",
            getSaveButtonStyles(
              activeSection === "hero" ? heroStatus :
              activeSection === "services" ? servicesStatus :
              activeSection === "videos" ? videosStatus :
              activeSection === "places" ? placesStatus :
              activeSection === "plan" ? planStatus :
              activeSection === "about" ? aboutStatus :
              activeSection === "footer" ? footerStatus :
              activeSection === "coupons" ? couponsStatus :
              activeSection === "seo" ? seoStatus :
              activeSection === "tropa" ? tropaStatus :
              activeSection === "instagram" ? instagramStatus :
              langStatus
            )
          )}
        >
          { (heroStatus === 'saving' || servicesStatus === 'saving' || videosStatus === 'saving' || placesStatus === 'saving' || planStatus === 'saving' || aboutStatus === 'saving' || footerStatus === 'saving' || couponsStatus === 'saving' || seoStatus === 'saving' || langStatus === 'saving' || instagramStatus === 'saving' || tropaStatus === 'saving') 
            ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> 
            : <Save className="w-4 h-4 mr-2" />
          }
          Salvar {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
        {[
          { id: "hero", label: "Home / Hero" },
          { id: "services", label: "Serviços" },
          { id: "videos", label: "Vídeos" },
          { id: "places", label: "Nossas Invasões" },
          { id: "plan", label: "O Plano" },
          { id: "about", label: "La gravata" },
          { id: "tropa", label: "Tropa da Gravata" },
          { id: "footer", label: "Rodapé" },
          { id: "coupons", label: "Cupons", icon: <Ticket className="w-4 h-4" /> },
          { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
          { id: "languages", label: "Idiomas", icon: <Globe className="w-4 h-4" /> },
          { id: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" /> }
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
            <div className="pt-2">
              <ImageUpload 
                label="URL do Vídeo de Fundo" 
                value={hero.video_url || ""} 
                onChange={val => setHero({...hero, video_url: val})}
                showOnMobile={hero.show_video_mobile !== false}
                onMobileToggle={checked => setHero({...hero, show_video_mobile: checked})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <ImageUpload 
                label="Imagem Card 1" 
                value={hero.image1 || ""} 
                onChange={val => setHero({...hero, image1: val})} 
                showOnMobile={hero.image1_show_mobile !== false}
                onMobileToggle={checked => setHero({...hero, image1_show_mobile: checked})}
              />
              <ImageUpload 
                label="Imagem Card 2" 
                value={hero.image2 || ""} 
                onChange={val => setHero({...hero, image2: val})} 
                showOnMobile={hero.image2_show_mobile !== false}
                onMobileToggle={checked => setHero({...hero, image2_show_mobile: checked})}
              />
              <ImageUpload 
                label="Imagem Card 3" 
                value={hero.image3 || ""} 
                onChange={val => setHero({...hero, image3: val})} 
                showOnMobile={hero.image3_show_mobile !== false}
                onMobileToggle={checked => setHero({...hero, image3_show_mobile: checked})}
              />
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
               <div className="flex justify-between items-center">
                 <Label className="text-red-500 italic">Lista de Serviços</Label>
                 <Button size="sm" variant="outline" className="border-red-900 text-red-500" onClick={() => setServices({...services, items: [...(services.items || []), {title: "Novo Serviço", desc: "", img: ""}]})}>
                   <Plus className="w-4 h-4 mr-1"/> Adicionar Serviço
                 </Button>
               </div>
               
               {services.items?.map((item: any, idx: number) => (
                 <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 space-y-4 relative group">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="absolute top-2 right-2 text-red-900 hover:text-red-500 hover:bg-red-900/10 h-8 w-8"
                     onClick={() => {
                       const newI = [...services.items];
                       newI.splice(idx, 1);
                       setServices({...services, items: newI});
                     }}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                   
                   <div className="space-y-2">
                     <Label className="text-xs text-red-500">Título do Serviço</Label>
                     <Input value={item.title} onChange={e => { const newI = [...services.items]; newI[idx].title = e.target.value; setServices({...services, items: newI}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-xs text-red-500">Descrição</Label>
                     <Textarea value={item.desc} onChange={e => { const newI = [...services.items]; newI[idx].desc = e.target.value; setServices({...services, items: newI}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                   </div>
                    <ImageUpload 
                      label="Ícone/Imagem" 
                      value={item.img} 
                      onChange={val => { const newI = [...services.items]; newI[idx].img = val; setServices({...services, items: newI}); }}
                      showOnMobile={item.show_mobile !== false}
                      onMobileToggle={checked => { const newI = [...services.items]; newI[idx].show_mobile = checked; setServices({...services, items: newI}); }}
                    />
                   <div className="flex justify-end pt-4">
                     <SaveBtn section="services" data={services} status={servicesStatus} setStatus={setServicesStatus} />
                   </div>
                 </div>
               ))}
               
               {(!services.items || services.items.length === 0) && (
                 <div className="text-center py-8 border-2 border-dashed border-red-900/20 rounded-lg text-red-900/50">
                   Nenhum serviço cadastrado.
                 </div>
               )}
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
            <div className="space-y-2">
              <Label className="text-red-500">Título da Seção de Vídeos</Label>
              <Input value={videos.heading || ""} onChange={e => setVideos({...videos, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-red-500">Galeria de Vídeos</Label>
                <Button size="sm" variant="outline" className="border-red-900 text-red-500" onClick={() => setVideos({...videos, items: [...(videos.items || []), {title: "Novo Vídeo", src: ""}]})}>
                  <Plus className="w-4 h-4 mr-1"/> Adicionar Vídeo
                </Button>
              </div>
              
              {videos.items?.map((v: any, idx: number) => (
                <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 space-y-4 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-red-900 hover:text-red-500 hover:bg-red-900/10 h-8 w-8"
                    onClick={() => {
                      const newV = [...videos.items];
                      newV.splice(idx, 1);
                      setVideos({...videos, items: newV});
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-red-500">Título do Vídeo</Label>
                    <Input value={v.title} onChange={e => { const newV = [...videos.items]; newV[idx].title = e.target.value; setVideos({...videos, items: newV}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                  </div>
                  <ImageUpload 
                    label="URL ou Upload do Vídeo" 
                    value={v.src} 
                    onChange={val => { const newV = [...videos.items]; newV[idx].src = val; setVideos({...videos, items: newV}); }}
                    showOnMobile={v.show_mobile !== false}
                    onMobileToggle={checked => { const newV = [...videos.items]; newV[idx].show_mobile = checked; setVideos({...videos, items: newV}); }}
                  />
                  <div className="flex justify-end pt-2">
                    <SaveBtn section="videos" data={videos} status={videosStatus} setStatus={setVideosStatus} />
                  </div>
                </div>
              ))}
              
              {(!videos.items || videos.items.length === 0) && (
                <div className="text-center py-8 border-2 border-dashed border-red-900/20 rounded-lg text-red-900/50">
                  Nenhum vídeo cadastrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "places" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500">Invasões</CardTitle>
              <CardDescription className="text-red-500/60">Lista de locais e invasões realizadas.</CardDescription>
            </div>
            <SaveBtn section="places" data={places} status={placesStatus} setStatus={setPlacesStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-red-500">Título da Seção</Label>
              <Input value={places.heading || ""} onChange={e => setPlaces({...places, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            </div>
            
            <div className="space-y-4 pt-4">
               <div className="flex justify-between items-center">
                 <Label className="text-red-500">Itens das Invasões</Label>
                 <Button size="sm" variant="outline" className="border-red-900 text-red-500" onClick={() => setPlaces({...places, items: [...(places.items || []), {title: "Novo Local", date: "", location: "", img: ""}]})}>
                   <Plus className="w-4 h-4 mr-1"/> Adicionar Local
                 </Button>
               </div>
               
               {places.items?.map((item: any, idx: number) => (
                 <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 space-y-4 relative group">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="absolute top-2 right-2 text-red-900 hover:text-red-500 hover:bg-red-900/10 h-8 w-8"
                     onClick={() => {
                       const newI = [...places.items];
                       newI.splice(idx, 1);
                       setPlaces({...places, items: newI});
                     }}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="text-xs text-red-500">Nome do Local</Label>
                       <Input value={item.title} onChange={e => { const newI = [...places.items]; newI[idx].title = e.target.value; setPlaces({...places, items: newI}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-xs text-red-500">Cidade/Localização</Label>
                       <Input value={item.location} onChange={e => { const newI = [...places.items]; newI[idx].location = e.target.value; setPlaces({...places, items: newI}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                     </div>
                    </div>
                    <ImageUpload 
                      label="Imagem do Local" 
                      value={item.img} 
                      onChange={val => { const newI = [...places.items]; newI[idx].img = val; setPlaces({...places, items: newI}); }}
                      showOnMobile={item.show_mobile !== false}
                      onMobileToggle={checked => { const newI = [...places.items]; newI[idx].show_mobile = checked; setPlaces({...places, items: newI}); }}
                    />
                    <div className="flex justify-end pt-2">
                      <SaveBtn section="places" data={places} status={placesStatus} setStatus={setPlacesStatus} />
                    </div>
                  </div>
                ))}
               
               {(!places.items || places.items.length === 0) && (
                 <div className="text-center py-8 border-2 border-dashed border-red-900/20 rounded-lg text-red-900/50">
                   Nenhum local cadastrado. Clique em "Adicionar Local".
                 </div>
               )}
            </div>
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
            <div className="space-y-2">
              <Label className="text-red-500">Título</Label>
              <Input value={plan.heading || ""} onChange={e => setPlan({...plan, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">Texto</Label>
              <Textarea value={plan.text || ""} onChange={e => setPlan({...plan, text: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">Link do Botão (WhatsApp)</Label>
              <Input value={plan.cta_url || ""} onChange={e => setPlan({...plan, cta_url: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" placeholder="https://api.whatsapp.com/send?phone=..." />
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "about" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-red-500">La gravata</CardTitle></div>
            <SaveBtn section="about" data={about} status={aboutStatus} setStatus={setAboutStatus} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={about.heading || ""} onChange={e => setAbout({...about, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" placeholder="Título (Ex: La Gravata)" />
            <div className="space-y-2">
              <Label className="text-red-500">Destaque (Ex: La gravata)</Label>
              <Input value={about.heading_em || ""} onChange={e => setAbout({...about, heading_em: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
            </div>
            <ImageUpload 
              label="Imagem" 
              value={about.image || ""} 
              onChange={val => setAbout({...about, image: val})}
              showOnMobile={about.show_mobile !== false}
              onMobileToggle={checked => setAbout({...about, show_mobile: checked})}
            />
            <div className="space-y-2">
              <Label className="text-red-500">Link do Botão (WhatsApp)</Label>
              <Input value={about.cta_url || ""} onChange={e => setAbout({...about, cta_url: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" placeholder="https://api.whatsapp.com/send?phone=..." />
            </div>
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

      {activeSection === "coupons" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500">Cupons Especiais</CardTitle>
              <CardDescription className="text-red-500/60">Gerencie os cupons exibidos no site.</CardDescription>
            </div>
            <SaveBtn section="coupons" data={coupons} status={couponsStatus} setStatus={setCouponsStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Título da Seção</Label>
                <Input value={coupons.heading || ""} onChange={e => setCoupons({...coupons, heading: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Destaque (Itálico)</Label>
                <Input value={coupons.heading_em || ""} onChange={e => setCoupons({...coupons, heading_em: e.target.value})} className="bg-zinc-800 border-red-900 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-red-500">Lista de Cupons</Label>
                <Button size="sm" variant="outline" className="border-red-900 text-red-500" onClick={() => {
                  const newItems = [...(coupons.items || []), {title: "Novo Cupom", code: `CUPOM${(coupons.items?.length || 0) + 1}`, discount: "10% OFF", description: "", link: "/questionarioevento"}];
                  setCoupons({...coupons, items: newItems});
                }}>
                  <Plus className="w-4 h-4 mr-1"/> Adicionar Cupom
                </Button>
              </div>
              
              {coupons.items?.map((coupon: any, idx: number) => (
                <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 space-y-4 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-red-900 hover:text-red-500 hover:bg-red-900/10 h-8 w-8"
                    onClick={() => {
                      const newItems = [...coupons.items];
                      newItems.splice(idx, 1);
                      setCoupons({...coupons, items: newItems});
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-red-500">Título do Cupom</Label>
                      <Input value={coupon.title} onChange={e => { const newItems = [...coupons.items]; newItems[idx].title = e.target.value; setCoupons({...coupons, items: newItems}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-red-500">Código</Label>
                      <Input value={coupon.code} onChange={e => { const newItems = [...coupons.items]; newItems[idx].code = e.target.value; setCoupons({...coupons, items: newItems}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-red-500">Valor/Desconto</Label>
                      <Input value={coupon.discount} onChange={e => { const newItems = [...coupons.items]; newItems[idx].discount = e.target.value; setCoupons({...coupons, items: newItems}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-red-500">Link de Resgate</Label>
                      <Input value={coupon.link} onChange={e => { const newItems = [...coupons.items]; newItems[idx].link = e.target.value; setCoupons({...coupons, items: newItems}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-red-500">Descrição</Label>
                    <Textarea value={coupon.description} onChange={e => { const newItems = [...coupons.items]; newItems[idx].description = e.target.value; setCoupons({...coupons, items: newItems}); }} className="bg-zinc-800 border-red-900 text-red-500" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <SaveBtn section="coupons" data={coupons} status={couponsStatus} setStatus={setCouponsStatus} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "tropa" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500">Tropa da Gravata</CardTitle>
              <CardDescription className="text-red-500/60">Configure a seção Tropa da Gravata.</CardDescription>
            </div>
            <SaveBtn section="tropa_config" data={tropaConfig} status={tropaStatus} setStatus={setTropaStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-red-500">Título</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={tropaConfig.heading || ""} onChange={e => setTropaConfig({...tropaConfig, heading: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Título Ênfase (Itálico)</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={tropaConfig.heading_em || ""} onChange={e => setTropaConfig({...tropaConfig, heading_em: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">Subtítulo (Destaque Vermelho)</Label>
              <Input className="bg-zinc-800 border-red-900 text-red-500" value={tropaConfig.subheading || ""} onChange={e => setTropaConfig({...tropaConfig, subheading: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">Parágrafos (um por linha)</Label>
              <Textarea 
                rows={8}
                className="bg-zinc-800 border-red-900 text-red-500" 
                value={tropaConfig.paragraphs?.join("\n") || ""} 
                onChange={e => setTropaConfig({...tropaConfig, paragraphs: e.target.value.split("\n")})} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-red-500">Texto do Botão CTA</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={tropaConfig.cta_label || ""} onChange={e => setTropaConfig({...tropaConfig, cta_label: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Link do Instagram</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={tropaConfig.instagram_url || ""} onChange={e => setTropaConfig({...tropaConfig, instagram_url: e.target.value})} />
              </div>
            </div>
            <ImageUpload 
              label="Imagem da Seção" 
              value={tropaConfig.image_url || ""} 
              onChange={val => setTropaConfig({...tropaConfig, image_url: val})}
              showOnMobile={tropaConfig.show_mobile !== false}
              onMobileToggle={checked => setTropaConfig({...tropaConfig, show_mobile: checked})}
            />
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

      {activeSection === "instagram" && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-red-500">Instagram Config (Feed)</CardTitle>
              <CardDescription className="text-red-500/60">Textos e links da seção do Instagram.</CardDescription>
            </div>
            <SaveBtn section="instagram_config" data={instagramConfig} status={instagramStatus} setStatus={setInstagramStatus} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-red-500">Título</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={instagramConfig.title || ""} onChange={e => setInstagramConfig({...instagramConfig, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Subtítulo</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={instagramConfig.subtitle || ""} onChange={e => setInstagramConfig({...instagramConfig, subtitle: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-red-500">Handle (@usuário)</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={instagramConfig.handle || ""} onChange={e => setInstagramConfig({...instagramConfig, handle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">URL do Perfil</Label>
                <Input className="bg-zinc-800 border-red-900 text-red-500" value={instagramConfig.profile_url || ""} onChange={e => setInstagramConfig({...instagramConfig, profile_url: e.target.value})} />
              </div>
            </div>
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

      <div className="flex justify-center pt-8 border-t border-zinc-800/50 pb-10">
        <Button 
          onClick={async () => {
            const btnMap: Record<string, any> = {
              hero: { data: hero, status: heroStatus, set: setHeroStatus },
              services: { data: services, status: servicesStatus, set: setServicesStatus },
              videos: { data: videos, status: videosStatus, set: setVideosStatus },
              places: { data: places, status: placesStatus, set: setPlacesStatus },
              plan: { data: plan, status: planStatus, set: setPlanStatus },
              about: { data: about, status: aboutStatus, set: setAboutStatus },
              footer: { data: footer, status: footerStatus, set: setFooterStatus },
              coupons: { data: coupons, status: couponsStatus, set: setCouponsStatus },
              seo: { data: seo, status: seoStatus, set: setSeoStatus },
              languages: { data: languages, status: langStatus, set: setLangStatus },
              instagram: { data: instagramConfig, status: instagramStatus, set: setInstagramStatus },
              tropa: { data: tropaConfig, status: tropaStatus, set: setTropaStatus },
            };
            const current = btnMap[activeSection];
            if (current) {
              current.set('saving');
              try {
                const saveKey = activeSection === 'instagram' ? 'instagram_config' : 
                               activeSection === 'tropa' ? 'tropa_config' : 
                               activeSection;
                const result = await handleSave(saveKey, current.data);
                if (result) {
                  current.set('saved');
                  showToast(`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} salvo com sucesso!`, 'success');
                } else {
                  throw new Error("Falha ao salvar");
                }
              } catch (err: any) {
                current.set('error');
                showToast(`Erro ao salvar ${activeSection}: ${err.message}`, 'error');
              }
            }
          }}
          size="lg"
          className={cn(
            "transition-all duration-300 w-full max-w-md text-xl font-bold h-16 shadow-2xl shadow-red-900/20",
            getSaveButtonStyles(
              activeSection === "hero" ? heroStatus :
              activeSection === "services" ? servicesStatus :
              activeSection === "videos" ? videosStatus :
              activeSection === "places" ? placesStatus :
              activeSection === "plan" ? planStatus :
              activeSection === "about" ? aboutStatus :
              activeSection === "footer" ? footerStatus :
              activeSection === "coupons" ? couponsStatus :
              activeSection === "seo" ? seoStatus :
              activeSection === "instagram" ? instagramStatus :
              langStatus
            )
          )}
        >
          <Save className="w-6 h-6 mr-2" />
          Salvar Alterações de {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </Button>
      </div>
    </div>
  );
}
