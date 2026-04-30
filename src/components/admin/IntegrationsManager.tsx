import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Link as LinkIcon, MessageCircle, BarChart, Code, CheckCircle2, Loader2 } from "lucide-react";

export function IntegrationsManager() {
  const { content, updateSection, loading: contentLoading } = useSiteContent();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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

    const results = await Promise.all([
      updateSection("integrations", integrationsData, false),
      updateSection("instagram_config", instagramData, false)
    ]);

    if (results.every(r => r === true)) {
      setTimeout(() => setLoading(false), 500);
    } else {
      setLoading(false);
    }
  };

  if (contentLoading) return <div className="p-8 text-zinc-400">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Integrações e APIs</h2>
          <p className="text-zinc-400">Conecte redes sociais, analytics e botões de contato.</p>
        </div>
        <button 
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center font-medium disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
          {loading ? "Salvando..." : "Salvar Tudo"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instagram API */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Instagram className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-red-500">Instagram API</CardTitle>
                <CardDescription className="text-zinc-400">Configure o feed automático do seu perfil.</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Label className="text-xs text-zinc-400">Modo Automático</Label>
              <Switch 
                checked={formData.instagram_mode === "auto"}
                onCheckedChange={(checked) => setFormData({...formData, instagram_mode: checked ? "auto" : "manual"})}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-zinc-400">Usuário (@handle)</Label>
                <Input 
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                  value={formData.instagram_handle} 
                  onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Instagram App ID</Label>
                <Input 
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                  type="password" 
                  value={formData.instagram_app_id} 
                  onChange={(e) => setFormData({...formData, instagram_app_id: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">Instagram App Secret</Label>
                <Input 
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                  type="password" 
                  value={formData.instagram_app_secret} 
                  onChange={(e) => setFormData({...formData, instagram_app_secret: e.target.value})} 
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="text-zinc-400">Access Token (Long-lived)</Label>
                <div className="flex space-x-2">
                  <Input 
                    className="bg-zinc-800 border-zinc-700 font-mono text-zinc-100 focus:border-red-500/50" 
                    type="password" 
                    value={formData.instagram_access_token} 
                    onChange={(e) => setFormData({...formData, instagram_access_token: e.target.value})} 
                  />
                  <Button variant="outline" className="border-zinc-700 shrink-0 text-zinc-300 hover:text-red-500 hover:border-red-500/30">Gerar Token</Button>
                </div>
                <p className="text-[10px] text-zinc-500 italic">Necessário para carregar posts e vídeos automaticamente sem expiração constante.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex items-center space-x-3 flex-row">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-500">WhatsApp Flutuante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Número (com DDI + DDD)</Label>
              <Input 
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                value={formData.whatsapp_number} 
                placeholder="5511999999999" 
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Mensagem Padrão</Label>
              <Textarea 
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                value={formData.whatsapp_message} 
                rows={3} 
                onChange={(e) => setFormData({...formData, whatsapp_message: e.target.value})} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Tracking */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader className="flex items-center space-x-3 flex-row">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <BarChart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-500">Rastreamento</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Google Analytics ID (GA4)</Label>
              <Input 
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                value={formData.google_analytics_id} 
                placeholder="G-XXXXXXXXXX" 
                onChange={(e) => setFormData({...formData, google_analytics_id: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Facebook Pixel ID</Label>
              <Input 
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                value={formData.facebook_pixel_id} 
                onChange={(e) => setFormData({...formData, facebook_pixel_id: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Google Tag Manager ID</Label>
              <Input 
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-red-500/50" 
                value={formData.google_tag_manager_id} 
                placeholder="GTM-XXXXXXX" 
                onChange={(e) => setFormData({...formData, google_tag_manager_id: e.target.value})} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-8">
        <button 
          className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <CheckCircle2 className="mr-2 w-5 h-5" />}
          {loading ? "Publicando..." : "Publicar Todas as Integrações"}
        </button>
      </div>
    </div>
  );
}