import { useState, useCallback } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Link as LinkIcon, MessageCircle, BarChart, Code, CheckCircle2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSaveStatus, getSaveButtonStyles } from "@/hooks/useSaveStatus";

const showToast = (message: string, type: 'success' | 'error') => {
  if (type === 'success') {
    toast.success(message, { position: "top-center", duration: 4000 });
  } else {
    toast.error(message, { position: "top-center", duration: 5000 });
  }
};

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
    instagram_mode: instagram.mode || "manual",
  });

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Tentando salvar Integrações", formData);
      
      const integrationsData = {
        google_analytics_id: formData.google_analytics_id,
        google_tag_manager_id: formData.google_tag_manager_id,
        facebook_pixel_id: formData.facebook_pixel_id,
        whatsapp_number: formData.whatsapp_number,
        whatsapp_message: formData.whatsapp_message,
      };

      // Strip any sensitive credentials previously stored in this public table
      const { app_id: _ignoredAppId, app_secret: _ignoredAppSecret, access_token: _ignoredAccessToken, ...safeInstagram } = instagram as Record<string, unknown>;
      const instagramData = {
        ...safeInstagram,
        handle: formData.instagram_handle,
        mode: formData.instagram_mode,
      };

      const results = await Promise.all([
        updateSection("integrations", integrationsData, false),
        updateSection("instagram_config", instagramData, false)
      ]);
      
      if (results.some(r => !r)) throw new Error("Falha ao salvar uma ou mais seções");
      return true;
    } catch (err: any) {
      console.error("Erro ao salvar Integrações:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData, instagram, updateSection]);

  const { status, setSaveStatus } = useSaveStatus();

  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      await handleSave();
      setSaveStatus('saved');
      showToast("Integrações salvas com sucesso!", "success");
    } catch {
      setSaveStatus('error');
      showToast("Erro ao salvar integrações.", "error");
    }
  };

  if (contentLoading) return <div className="p-8 text-zinc-400">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center sticky top-16 bg-zinc-950/80 backdrop-blur-sm z-50 py-4 -mt-4 border-b border-zinc-800/50">
        <div>
          <h2 className="text-2xl font-bold text-red-500">Integrações e APIs</h2>
          <p className="text-zinc-400">Conecte redes sociais, analytics e botões de contato.</p>
        </div>
        <Button 
          onClick={handleManualSave}
          className={cn("transition-all duration-300 w-32", getSaveButtonStyles(status))}
        >
          {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {status === 'saved' ? 'Salvo!' : status === 'error' ? 'Erro!' : 'Salvar'}
        </Button>
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
              <div className="md:col-span-2 space-y-2">
                <p className="text-xs text-zinc-500 italic">
                  Por segurança, credenciais sensíveis (App ID, App Secret e Access Token) devem ser armazenadas apenas como segredos do servidor (Edge Function secrets), nunca neste painel público. Configure-as em Lovable Cloud → Secrets.
                </p>
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

      <div className="flex justify-center pt-8 border-t border-zinc-800/50 pb-10">
        <Button 
          onClick={handleManualSave}
          size="lg"
          className={cn("transition-all duration-300 w-full max-w-md text-xl font-bold h-16 shadow-2xl shadow-red-900/20", getSaveButtonStyles(status))}
        >
          {status === 'saving' ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Save className="w-6 h-6 mr-2" />}
          {status === 'saved' ? 'Integrações Salvas!' : status === 'error' ? 'Erro ao Salvar!' : 'Salvar Todas as Integrações'}
        </Button>
      </div>
    </div>
  );
}