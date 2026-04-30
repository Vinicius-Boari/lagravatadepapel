import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Link as LinkIcon, MessageCircle, BarChart, Code, CheckCircle2 } from "lucide-react";

export function IntegrationsManager() {
  const { content, updateSection, loading } = useSiteContent();
  const integrations = content.integrations || {};
  const instagram = content.instagram_config || {};

  const [formData, setFormData] = useState({
    google_analytics_id: integrations.google_analytics_id || "",
    google_tag_manager_id: integrations.google_tag_manager_id || "",
    facebook_pixel_id: integrations.facebook_pixel_id || "",
    whatsapp_number: integrations.whatsapp_number || "",
    whatsapp_message: integrations.whatsapp_message || "",
    instagram_handle: instagram.handle || "",
    instagram_app_id: instagram.app_id || "",
    instagram_app_secret: instagram.app_secret || "",
    instagram_access_token: instagram.access_token || "",
    instagram_mode: instagram.mode || "manual",
  });

  const handleSave = async () => {
    const integrationsData = {
      google_analytics_id: formData.google_analytics_id,
      google_tag_manager_id: formData.google_tag_manager_id,
      facebook_pixel_id: formData.facebook_pixel_id,
      whatsapp_number: formData.whatsapp_number,
      whatsapp_message: formData.whatsapp_message,
    };

    const instagramData = {
      ...instagram,
      handle: formData.instagram_handle,
      app_id: formData.instagram_app_id,
      app_secret: formData.instagram_app_secret,
      access_token: formData.instagram_access_token,
      mode: formData.instagram_mode,
    };

    await Promise.all([
      updateSection("integrations", integrationsData, false),
      updateSection("instagram_config", instagramData, false)
    ]);
  };

  if (loading) return <div className="p-8 text-zinc-400">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrações e APIs</h2>
          <p className="text-zinc-400">Conecte redes sociais, analytics e botões de contato.</p>
        </div>
        <Button className="bg-white text-black hover:bg-zinc-200" onClick={handleSave}>
          <CheckCircle2 className="mr-2 w-4 h-4" />
          Salvar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instagram API */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Instagram className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <CardTitle>Instagram API</CardTitle>
                <CardDescription>Configure o feed automático do seu perfil.</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Modo Automático</Label>
              <Switch 
                checked={formData.instagram_mode === "auto"}
                onCheckedChange={(checked) => setFormData({...formData, instagram_mode: checked ? "auto" : "manual"})}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Usuário (@handle)</Label>
                <Input className="bg-zinc-800 border-zinc-700" value={formData.instagram_handle} onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Instagram App ID</Label>
                <Input className="bg-zinc-800 border-zinc-700" type="password" value={formData.instagram_app_id} onChange={(e) => setFormData({...formData, instagram_app_id: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Instagram App Secret</Label>
                <Input className="bg-zinc-800 border-zinc-700" type="password" value={formData.instagram_app_secret} onChange={(e) => setFormData({...formData, instagram_app_secret: e.target.value})} />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label>Access Token (Long-lived)</Label>
                <div className="flex space-x-2">
                  <Input className="bg-zinc-800 border-zinc-700 font-mono" type="password" value={formData.instagram_access_token} onChange={(e) => setFormData({...formData, instagram_access_token: e.target.value})} />
                  <Button variant="outline" className="border-zinc-700 shrink-0">Gerar Token</Button>
                </div>
                <p className="text-[10px] text-zinc-500 italic">Necessário para carregar posts e vídeos automaticamente sem expiração constante.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex items-center space-x-3 flex-row">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp Flutuante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número (com DDI + DDD)</Label>
              <Input className="bg-zinc-800 border-zinc-700" value={formData.whatsapp_number} placeholder="5511999999999" onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Mensagem Padrão</Label>
              <Textarea className="bg-zinc-800 border-zinc-700" value={formData.whatsapp_message} rows={3} onChange={(e) => setFormData({...formData, whatsapp_message: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Tracking */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex items-center space-x-3 flex-row">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Rastreamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Google Analytics ID (GA4)</Label>
              <Input className="bg-zinc-800 border-zinc-700" value={formData.google_analytics_id} placeholder="G-XXXXXXXXXX" onChange={(e) => setFormData({...formData, google_analytics_id: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Facebook Pixel ID</Label>
              <Input className="bg-zinc-800 border-zinc-700" value={formData.facebook_pixel_id} onChange={(e) => setFormData({...formData, facebook_pixel_id: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Google Tag Manager ID</Label>
              <Input className="bg-zinc-800 border-zinc-700" value={formData.google_tag_manager_id} placeholder="GTM-XXXXXXX" onChange={(e) => setFormData({...formData, google_tag_manager_id: e.target.value})} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}