import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Upload, Type } from "lucide-react";

export function VisualIdentity() {
  const { content, updateSection, loading } = useSiteContent();
  const visual = content.visual || {};
  
  const [formData, setFormData] = useState({
    primary_color: visual.primary_color || "#c0392b",
    secondary_color: visual.secondary_color || "#ffffff",
    background_color: visual.background_color || "#0a0a0a",
    text_color: visual.text_color || "#ffffff",
    font_family: visual.font_family || "Playfair Display",
    logo_url: visual.logo_url || "",
    favicon_url: visual.favicon_url || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (isDraft = true) => {
    await updateSection("visual", formData, isDraft);
  };

  if (loading) return <div className="p-8 text-red-500">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Identidade Visual</h2>
          <p className="text-red-500/70">Configure cores, fontes e logo do seu site.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-red-900 bg-zinc-900 text-red-500 hover:bg-red-900/20" onClick={() => handleSave(true)}>
            Salvar Rascunho
          </Button>
          <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => handleSave(false)}>
            <Save className="mr-2 w-4 h-4" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-red-500">Paleta de Cores</CardTitle>
            <CardDescription className="text-red-500/60">Defina as cores principais que compõem o visual do site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-red-500">Cor Primária</Label>
                <div className="flex space-x-2">
                  <Input type="color" name="primary_color" value={formData.primary_color} onChange={handleChange} className="w-12 p-1 bg-zinc-800 border-red-900 h-10" />
                  <Input type="text" name="primary_color" value={formData.primary_color} onChange={handleChange} className="bg-zinc-800 border-red-900 font-mono text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Cor Secundária</Label>
                <div className="flex space-x-2">
                  <Input type="color" name="secondary_color" value={formData.secondary_color} onChange={handleChange} className="w-12 p-1 bg-zinc-800 border-red-900 h-10" />
                  <Input type="text" name="secondary_color" value={formData.secondary_color} onChange={handleChange} className="bg-zinc-800 border-red-900 font-mono text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Cor de Fundo</Label>
                <div className="flex space-x-2">
                  <Input type="color" name="background_color" value={formData.background_color} onChange={handleChange} className="w-12 p-1 bg-zinc-800 border-red-900 h-10" />
                  <Input type="text" name="background_color" value={formData.background_color} onChange={handleChange} className="bg-zinc-800 border-red-900 font-mono text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">Cor do Texto</Label>
                <div className="flex space-x-2">
                  <Input type="color" name="text_color" value={formData.text_color} onChange={handleChange} className="w-12 p-1 bg-zinc-800 border-red-900 h-10" />
                  <Input type="text" name="text_color" value={formData.text_color} onChange={handleChange} className="bg-zinc-800 border-red-900 font-mono text-red-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo & Typography */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-red-500">Logo e Tipografia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center text-red-500"><Type className="mr-2 w-4 h-4" /> Fonte Principal (Google Fonts)</Label>
              <Input name="font_family" value={formData.font_family} onChange={handleChange} className="bg-zinc-800 border-red-900 text-red-500 placeholder:text-red-900" placeholder="Ex: Inter, Playfair Display..." />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="space-y-2">
                <Label className="flex items-center text-red-500"><Upload className="mr-2 w-4 h-4" /> URL da Logo (PNG/SVG)</Label>
                <div className="flex space-x-2">
                  <Input name="logo_url" value={formData.logo_url} onChange={handleChange} className="bg-zinc-800 border-red-900 text-red-500 placeholder:text-red-900" placeholder="https://..." />
                  <Button variant="outline" className="border-red-900 text-red-500"><Upload className="w-4 h-4" /></Button>
                </div>
                <p className="text-[10px] text-red-500/50">Recomendação: PNG Transparente ou SVG, altura máx. 60px.</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-red-500"><Upload className="mr-2 w-4 h-4" /> URL do Favicon (ICO/PNG)</Label>
                <div className="flex space-x-2">
                  <Input name="favicon_url" value={formData.favicon_url} onChange={handleChange} className="bg-zinc-800 border-red-900 text-red-500 placeholder:text-red-900" placeholder="https://..." />
                  <Button variant="outline" className="border-red-900 text-red-500"><Upload className="w-4 h-4" /></Button>
                </div>
                <p className="text-[10px] text-red-500/50">Recomendação: 32x32px ou 48x48px.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-red-500">Preview em Tempo Real</CardTitle>
          <CardDescription className="text-red-500/60">Veja como as alterações afetam o estilo do site antes de publicar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="p-8 rounded-lg border border-zinc-700 transition-all"
            style={{ backgroundColor: formData.background_color, color: formData.text_color, fontFamily: formData.font_family }}
          >
            <h3 className="text-3xl mb-4 font-bold" style={{ color: formData.primary_color }}>Título de Exemplo</h3>
            <p className="mb-6 opacity-80">Este é um parágrafo de exemplo para testar a legibilidade das cores e da fonte escolhida.</p>
            <Button style={{ backgroundColor: formData.primary_color, color: formData.secondary_color }}>
              Botão de CTA
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-6">
        <Button onClick={() => handleSave(false)} className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 text-lg font-bold">
          <Save className="mr-2 w-5 h-5" />
          Publicar Identidade Visual
        </Button>
      </div>
    </div>
  );
}