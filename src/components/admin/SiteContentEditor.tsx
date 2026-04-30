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
                      className="bg-zinc-800 border-zinc-700" 
                      value={hero.title_lines?.join("\n")}
                      onChange={(e) => setHero({...hero, title_lines: e.target.value.split("\n")})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Textarea 
                      className="bg-zinc-800 border-zinc-700" 
                      value={hero.subtitle}
                      onChange={(e) => setHero({...hero, subtitle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Localização (Canto Esquerdo)</Label>
                    <Input 
                      className="bg-zinc-800 border-zinc-700" 
                      value={hero.location}
                      onChange={(e) => setHero({...hero, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto do Botão (CTA)</Label>
                    <Input 
                      className="bg-zinc-800 border-zinc-700" 
                      value={hero.cta_label}
                      onChange={(e) => setHero({...hero, cta_label: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link do Botão</Label>
                    <Input 
                      className="bg-zinc-800 border-zinc-700" 
                      value={hero.cta_url}
                      onChange={(e) => setHero({...hero, cta_url: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-medium flex items-center"><Video className="mr-2 w-4 h-4" /> Vídeo de Fundo</h4>
                <div className="space-y-2">
                  <Label>URL do Vídeo (MP4/WebM)</Label>
                  <Input 
                    className="bg-zinc-800 border-zinc-700" 
                    placeholder="https://... (URL direta do arquivo)"
                    value={hero.video_url}
                    onChange={(e) => setHero({...hero, video_url: e.target.value})}
                  />
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
                    <p className="text-[10px] text-red-500/50">Recomendação: Retrato 450x700px.</p>
                  </div>
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
      </Tabs>
    </div>
  );
}