import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, MoveUp, MoveDown, Layout, Type, Video, Hash, Image as ImageIcon } from "lucide-react";

export function SiteContentEditor() {
  const { content, updateSection, loading } = useSiteContent();
  const [activeSection, setActiveSection] = useState("hero");

  // Local state for each section to handle edits
  const [hero, setHero] = useState(content.hero || {});
  const [about, setAbout] = useState(content.about || {});
  const [plan, setPlan] = useState(content.plan || {});
  const [services, setServices] = useState(content.services || { items: [] });
  const [videos, setVideos] = useState(content.videos || { items: [] });
  const [footer, setFooter] = useState(content.footer || {});

  const handleSave = async (section: string, data: any, isDraft = true) => {
    await updateSection(section, data, isDraft);
  };

  if (loading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Conteúdo do Site</h2>
          <p className="text-red-500/70">Edite textos, seções e banners de todas as páginas.</p>
        </div>
      </div>

      <Tabs defaultValue="hero" value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="bg-zinc-900 border border-red-900 p-1 mb-8 overflow-x-auto w-full justify-start">
          <TabsTrigger value="hero" className="data-[state=active]:bg-red-900/30 text-red-500 data-[state=active]:text-red-400">Home / Hero</TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-red-900/30 text-red-500 data-[state=active]:text-red-400">Serviços</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:bg-red-900/30 text-red-500 data-[state=active]:text-red-400">Vídeos</TabsTrigger>
          <TabsTrigger value="plan" className="data-[state=active]:bg-red-900/30 text-red-500 data-[state=active]:text-red-400">Seção "O Plano"</TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-red-900/30 text-red-500 data-[state=active]:text-red-400">Sobre</TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-red-900/30 text-red-500 data-[state=active]:text-red-400">Rodapé</TabsTrigger>
        </TabsList>

        {/* HERO SECTION */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-red-500">Cabeçalho (Hero)</CardTitle>
                <CardDescription className="text-red-500/60">Primeira seção visível do site.</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-red-900 text-red-500 hover:bg-red-900/20" onClick={() => handleSave("hero", hero, true)}>Salvar Rascunho</Button>
                <Button size="sm" onClick={() => handleSave("hero", hero, false)}>Publicar</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-red-500">Linhas do Título (uma por linha)</Label>
                    <Textarea 
                      rows={4} 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      value={hero.title_lines?.join("\n")}
                      onChange={(e) => setHero({...hero, title_lines: e.target.value.split("\n")})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-500">Subtítulo</Label>
                    <Textarea 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      value={hero.subtitle}
                      onChange={(e) => setHero({...hero, subtitle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-red-500">Localização (Canto Esquerdo)</Label>
                    <Input 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      value={hero.location}
                      onChange={(e) => setHero({...hero, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-500">Texto do Botão (CTA)</Label>
                    <Input 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      value={hero.cta_label}
                      onChange={(e) => setHero({...hero, cta_label: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-500">Link do Botão</Label>
                    <Input 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      value={hero.cta_url}
                      onChange={(e) => setHero({...hero, cta_url: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-medium flex items-center text-red-500"><Video className="mr-2 w-4 h-4" /> Vídeo de Fundo</h4>
                <div className="space-y-2">
                  <Label className="text-red-500">URL do Vídeo (MP4/WebM)</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    placeholder="https://..."
                    value={hero.video_url}
                    onChange={(e) => setHero({...hero, video_url: e.target.value})}
                  />
                  {hero.video_url && (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-red-900/30">
                      <video src={hero.video_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                    </div>
                  )}
                  <p className="text-[10px] text-red-500/50">Recomendação: Vídeo sem som, máx. 10MB, loop infinito.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-medium flex items-center"><ImageIcon className="mr-2 w-4 h-4" /> Cards Flutuantes (3 Imagens)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-red-500">Imagem do Card 1</Label>
                    <Input 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      placeholder="https://..."
                      value={hero.image1 || ""}
                      onChange={(e) => setHero({...hero, image1: e.target.value})}
                    />
                    {hero.image1 && (
                      <div className="mt-2 relative aspect-[3/4] rounded-lg overflow-hidden border border-red-900/30">
                        <img src={hero.image1} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-[10px] text-red-500/50">Recomendação: Retrato 450x700px.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-500">Imagem do Card 2</Label>
                    <Input 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      placeholder="https://..."
                      value={hero.image2 || ""}
                      onChange={(e) => setHero({...hero, image2: e.target.value})}
                    />
                    {hero.image2 && (
                      <div className="mt-2 relative aspect-[3/4] rounded-lg overflow-hidden border border-red-900/30">
                        <img src={hero.image2} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-[10px] text-red-500/50">Recomendação: Retrato 600x800px (Centro).</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-500">Imagem do Card 3</Label>
                    <Input 
                      className="bg-zinc-800 border-red-900 text-red-500" 
                      placeholder="https://..."
                      value={hero.image3 || ""}
                      onChange={(e) => setHero({...hero, image3: e.target.value})}
                    />
                    {hero.image3 && (
                      <div className="mt-2 relative aspect-[3/4] rounded-lg overflow-hidden border border-red-900/30">
                        <img src={hero.image3} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-[10px] text-red-500/50">Recomendação: Retrato 450x700px.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VIDEOS SECTION */}
        <TabsContent value="videos" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-red-500">Seção de Vídeos</CardTitle>
                <CardDescription className="text-red-500/60">Gerencie a galeria de vídeos e seus destaques.</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleSave("videos", videos, false)}>Publicar</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Título Principal</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={videos.heading}
                    onChange={(e) => setVideos({...videos, heading: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Título em Destaque (Itálico)</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={videos.heading_em}
                    onChange={(e) => setVideos({...videos, heading_em: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                   <h4 className="text-sm font-medium text-red-500">Lista de Vídeos</h4>
                   <Button size="sm" variant="outline" className="border-red-900 text-red-500 hover:bg-red-900/20" onClick={() => {
                    const newItems = [...(videos.items || []), { title: "Novo Vídeo", src: "", tag: "", poster: "", tall: false }];
                    setVideos({...videos, items: newItems});
                  }}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </div>

                <div className="space-y-3">
                  {(videos.items || []).map((v: any, idx: number) => (
                    <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-red-500/50 uppercase tracking-widest">Vídeo #{idx+1}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => {
                            const newItems = videos.items.filter((_: any, i: number) => i !== idx);
                            setVideos({...videos, items: newItems});
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-xs text-red-500">Título</Label>
                           <Input 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={v.title} 
                             onChange={(e) => {
                               const newItems = [...videos.items];
                               newItems[idx] = { ...newItems[idx], title: e.target.value };
                               setVideos({...videos, items: newItems});
                             }}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs text-red-500">Tag / Categoria</Label>
                           <Input 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={v.tag} 
                             onChange={(e) => {
                               const newItems = [...videos.items];
                               newItems[idx] = { ...newItems[idx], tag: e.target.value };
                               setVideos({...videos, items: newItems});
                             }}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs text-red-500">URL do Vídeo (MP4)</Label>
                           <Input 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={v.src} 
                             onChange={(e) => {
                               const newItems = [...videos.items];
                               newItems[idx] = { ...newItems[idx], src: e.target.value };
                               setVideos({...videos, items: newItems});
                             }}
                           />
                           {v.src && (
                             <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-red-900/30 bg-zinc-950">
                               <video src={v.src} className="w-full h-full object-contain" muted />
                             </div>
                           )}
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs text-red-500">URL da Capa (Poster)</Label>
                           <Input 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={v.poster} 
                             onChange={(e) => {
                               const newItems = [...videos.items];
                               newItems[idx] = { ...newItems[idx], poster: e.target.value };
                               setVideos({...videos, items: newItems});
                             }}
                           />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <input 
                            type="checkbox" 
                            id={`tall-${idx}`}
                            className="accent-red-500"
                            checked={v.tall}
                            onChange={(e) => {
                               const newItems = [...videos.items];
                               newItems[idx] = { ...newItems[idx], tall: e.target.checked };
                               setVideos({...videos, items: newItems});
                             }}
                          />
                          <Label htmlFor={`tall-${idx}`} className="text-xs text-red-500">Formato Vertical (Tall)</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLAN SECTION */}
        <TabsContent value="plan" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-red-500">Seção "O Plano"</CardTitle>
                <CardDescription className="text-red-500/60">Edite o conteúdo da seção informativa.</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleSave("plan", plan, false)}>Publicar</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-red-500">Título Principal</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={plan.heading}
                    onChange={(e) => setPlan({...plan, heading: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Título em Destaque (Itálico)</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={plan.heading_em}
                    onChange={(e) => setPlan({...plan, heading_em: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-red-500">Texto Descritivo</Label>
                  <Textarea 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    rows={4}
                    value={plan.text}
                    onChange={(e) => setPlan({...plan, text: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Texto do Botão</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={plan.cta_label}
                    onChange={(e) => setPlan({...plan, cta_label: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Link do Botão</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={plan.cta_url}
                    onChange={(e) => setPlan({...plan, cta_url: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT SECTION */}
        <TabsContent value="about" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-red-500">Seção Sobre</CardTitle>
                <CardDescription className="text-red-500/60">Edite a história e imagem da marca.</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleSave("about", about, false)}>Publicar</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-red-500">Título Principal</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={about.heading}
                    onChange={(e) => setAbout({...about, heading: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Título em Destaque (Itálico)</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={about.heading_em}
                    onChange={(e) => setAbout({...about, heading_em: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-red-500">Parágrafos (um por linha)</Label>
                  <Textarea 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    rows={6}
                    value={about.paragraphs?.join("\n")}
                    onChange={(e) => setAbout({...about, paragraphs: e.target.value.split("\n")})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">URL da Imagem Lateral</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={about.image}
                    onChange={(e) => setAbout({...about, image: e.target.value})}
                  />
                  {about.image && (
                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-red-900/30">
                      <img src={about.image} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Link do Botão</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={about.cta_url}
                    onChange={(e) => setAbout({...about, cta_url: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERVICES SECTION */}
        <TabsContent value="services" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-red-500">Nossos Serviços</CardTitle>
                <CardDescription className="text-red-500/60">Grid de serviços com imagem e descrição.</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleSave("services", services, false)}>Publicar Tudo</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-red-500">Título Principal</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={services.heading}
                    onChange={(e) => setServices({...services, heading: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-500">Título em Destaque (Itálico)</Label>
                  <Input 
                    className="bg-zinc-800 border-red-900 text-red-500" 
                    value={services.heading_em}
                    onChange={(e) => setServices({...services, heading_em: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                   <h4 className="text-sm font-medium text-red-500">Itens de Serviço</h4>
                   <Button size="sm" variant="outline" className="border-red-900 text-red-500 hover:bg-red-900/20" onClick={() => {
                    const newItems = [...(services.items || []), { title: "Novo Serviço", desc: "", img: "" }];
                    setServices({...services, items: newItems});
                  }}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </div>

                <div className="space-y-3">
                  {(services.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-red-900/30 flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-red-500/50 uppercase tracking-widest">Serviço #{idx+1}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7"
                            onClick={() => {
                              const newItems = services.items.filter((_: any, i: number) => i !== idx);
                              setServices({...services, items: newItems});
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-xs text-red-500">Título</Label>
                           <Input 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={item.title} 
                             onChange={(e) => {
                               const newItems = [...services.items];
                               newItems[idx] = { ...newItems[idx], title: e.target.value };
                               setServices({...services, items: newItems});
                             }}
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs text-red-500">URL da Imagem</Label>
                           <Input 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={item.img} 
                             onChange={(e) => {
                               const newItems = [...services.items];
                               newItems[idx] = { ...newItems[idx], img: e.target.value };
                               setServices({...services, items: newItems});
                             }}
                           />
                           {item.img && (
                             <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-red-900/30 bg-zinc-950">
                               <img src={item.img} className="w-full h-full object-contain" />
                             </div>
                           )}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                           <Label className="text-xs text-red-500">Descrição Curta</Label>
                           <Textarea 
                             className="bg-zinc-800 border-red-900 text-red-500" 
                             value={item.desc} 
                             onChange={(e) => {
                               const newItems = [...services.items];
                               newItems[idx] = { ...newItems[idx], desc: e.target.value };
                               setServices({...services, items: newItems});
                             }}
                           />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER SECTION */}
        <TabsContent value="footer" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-red-500">Rodapé</CardTitle>
                 <CardDescription className="text-red-500/60">Informações de contato e links sociais.</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleSave("footer", footer, false)}>Publicar</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-red-500">Telefone (Exibição)</Label>
                   <Input 
                     className="bg-zinc-800 border-red-900 text-red-500" 
                     value={footer.phone} 
                     onChange={(e) => setFooter({...footer, phone: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-red-500">WhatsApp Link</Label>
                   <Input 
                     className="bg-zinc-800 border-red-900 text-red-500" 
                     value={footer.whatsapp_url} 
                     onChange={(e) => setFooter({...footer, whatsapp_url: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-red-500">Copyright</Label>
                   <Input 
                     className="bg-zinc-800 border-red-900 text-red-500" 
                     value={footer.copyright} 
                     onChange={(e) => setFooter({...footer, copyright: e.target.value})}
                   />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-red-500">Endereço Linha 1</Label>
                   <Input 
                     className="bg-zinc-800 border-red-900 text-red-500" 
                     value={footer.address_line1} 
                     onChange={(e) => setFooter({...footer, address_line1: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-red-500">Endereço Linha 2</Label>
                   <Input 
                     className="bg-zinc-800 border-red-900 text-red-500" 
                     value={footer.address_line2} 
                     onChange={(e) => setFooter({...footer, address_line2: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-red-500">Hashtag Destaque</Label>
                   <Input 
                     className="bg-zinc-800 border-red-900 text-red-500" 
                     value={footer.hashtag} 
                     onChange={(e) => setFooter({...footer, hashtag: e.target.value})}
                   />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}