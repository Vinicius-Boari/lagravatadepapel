import { useState, useEffect } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  event_date: z.string().min(1, "Data é obrigatória"),
  invasion_type: z.string().min(1, "Tipo de invasão é obrigatório"),
  selected_coupon: z.string().optional(),
  event_type: z.string().min(1, "Tipo de evento é obrigatório"),
  primary_name: z.string().min(1, "Nome é obrigatório"),
  secondary_name: z.string().optional(),
  venue_name: z.string().min(1, "Local é obrigatório"),
  performance_time: z.string().min(1, "Horário é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  municipality: z.string().min(1, "Município é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  zip_code: z.string().min(1, "CEP é obrigatório"),
  complement: z.string().min(1, "Referência/Complemento é obrigatório"),
  is_assistant_aware: z.string().min(1, "Campo obrigatório"),
  parking_payment_pref: z.string().min(1, "Campo obrigatório"),
  allowed_items: z.array(z.string()).optional(),
  other_allowed_items: z.string().optional(),
  has_screen: z.string().min(1, "Campo obrigatório"),
  contact_person_name: z.string().min(1, "Nome do responsável é obrigatório"),
  contact_person_phone: z.string().min(1, "Telefone é obrigatório"),
  extra_services: z.array(z.string()).optional(),
  other_extra_services: z.string().optional(),
  character_count: z.string().min(1, "Quantidade de personagens é obrigatória"),
  stay_duration: z.string().min(1, "Tempo de permanência é obrigatório"),
  everyone_informed: z.string().min(1, "Campo obrigatório"),
  changing_room_informed: z.string().min(1, "Campo obrigatório"),
  pix_key: z.string().min(1, "Chave Pix é obrigatória"),
  pix_holder_name: z.string().min(1, "Nome do titular é obrigatório"),
  pix_key_type: z.string().min(1, "Tipo de chave é obrigatório"),
  pix_bank: z.string().min(1, "Banco é obrigatório"),
  is_aware_of_card_fees: z.string().min(1, "Campo obrigatório"),
  observations: z.string().optional(),
  social_media_1: z.string().min(1, "Instagram/Facebook é obrigatório"),
  social_media_2: z.string().optional(),
  social_media_3: z.string().optional(),
  how_did_you_hear_about_us: z.string().min(1, "Campo obrigatório"),
});

export function QuestionarioForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { content } = useSiteContent();
  const coupons = content.coupons?.items || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allowed_items: [],
      extra_services: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from("questionnaire_responses").insert({
        ...values,
        is_assistant_aware: values.is_assistant_aware === "Sim",
        everyone_informed: values.everyone_informed === "Sim",
        changing_room_informed: values.changing_room_informed === "Sim",
      } as any);

      if (dbError) throw dbError;

      // Envia para o Formspree
      await fetch("https://formspree.io/f/xvgzbgkg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          _subject: `Novo Questionário: ${values.primary_name} - ${values.event_date}`,
          _to: "viniciusbataglia500@gmail.com"
        }),
      });

      setSubmitted(true);
      toast.success("Questionário enviado com sucesso!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Erro ao enviar:", error);
      toast.error("Erro ao enviar questionário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white uppercase tracking-tighter">O Plano foi Concluído com Sucesso!</h2>
          <p className="text-xl md:text-2xl text-zinc-400 italic">Muito obrigado por responder nosso questionário.</p>
        </div>
        <p className="text-2xl md:text-3xl text-primary font-bold animate-pulse uppercase tracking-widest pt-4">
          Prepare-se para o maior evento da sua vida! 🧨
        </p>
        <Button 
          variant="outline" 
          className="mt-8 border-zinc-800 text-zinc-400 hover:text-white"
          onClick={() => window.location.href = '/'}
        >
          VOLTAR AO INÍCIO
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* Seção 0: Invasão e Cupom */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Invasão</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end relative z-[1000]">
            <FormField
              control={form.control}
              name="invasion_type"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-zinc-400">Escolha a sua invasão*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 text-white relative z-[1001] pointer-events-auto">
                        <SelectValue placeholder="Selecione o tipo de invasão..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[999999] pointer-events-auto">
                      <SelectItem value="La gravata de papel" className="cursor-pointer">La gravata de papel</SelectItem>
                      <SelectItem value="Tropa da gravata (BOPE)" className="cursor-pointer">Tropa da gravata (BOPE)</SelectItem>
                      <SelectItem value="Ambas as invasões" className="cursor-pointer">Ambas as invasões</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selected_coupon"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-zinc-400">Cupom de Desconto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 text-white relative z-[1001] pointer-events-auto">
                        <SelectValue placeholder="Selecione um cupom (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[999999] pointer-events-auto">
                      {coupons.length > 0 ? (
                        coupons.map((coupon: any, idx: number) => (
                          <SelectItem key={idx} value={coupon.code} className="cursor-pointer">
                            {coupon.title} ({coupon.discount})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Carregando cupons...</SelectItem>
                      )}
                      <SelectItem value="none" className="cursor-pointer">Nenhum cupom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Seção 1: Informações Básicas */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Informações do Evento</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[100]">
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Data do evento*</FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[101]" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-zinc-400">Tipo do evento*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[101]">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[999999]">
                      <SelectItem value="Casamento">Casamento</SelectItem>
                      <SelectItem value="Debutante">Debutante</SelectItem>
                      <SelectItem value="Empresarial">Empresarial</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.value === "Outros" && (
                    <FormControl>
                      <Input 
                        placeholder="Especifique o tipo de evento" 
                        className="bg-zinc-900/50 border-zinc-800 focus:border-primary transition-all h-12 animate-in fade-in slide-in-from-top-1 relative z-[101]"
                        onChange={(e) => {
                          // ... existing comment
                        }}
                      />
                    </FormControl>
                  )}
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="primary_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Nome (Cônjuge/Debutante/Empresa)*</FormLabel>
                  <FormControl>
                    <Input placeholder="Primeiro nome" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Segundo Nome (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Segundo nome do cônjuge" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Seção 2: Localização */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Local do Evento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[90]">
            <FormField
              control={form.control}
              name="venue_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Nome do local do evento*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do espaço" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[91]" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="performance_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Horário da apresentação*</FormLabel>
                  <FormControl>
                    <Input type="time" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[91]" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Endereço completo (Rua, Av, nº)*</FormLabel>
                <FormControl>
                  <Input className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                </FormControl>
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Município*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Cidade*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">CEP*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Referência ou complemento*</FormLabel>
                <FormControl>
                  <Textarea className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Seção 3: Requisitos e Permissões */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Requisitos e Permissões</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
            <FormField
              control={form.control}
              name="is_assistant_aware"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-white font-semibold">Assessoria está ciente dos requisitos?*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 group cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value="Sim" className="border-zinc-700 text-primary focus:ring-primary" />
                        </FormControl>
                        <FormLabel className="font-normal text-zinc-300 group-hover:text-white transition-colors cursor-pointer">Sim</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 group cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value="Não" className="border-zinc-700 text-primary focus:ring-primary" />
                        </FormControl>
                        <FormLabel className="font-normal text-zinc-300 group-hover:text-white transition-colors cursor-pointer">Não</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parking_payment_pref"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-white font-semibold">Pagamento de estacionamento/valet?*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 group cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value="Através da assessora no local na chegada" className="border-zinc-700 text-primary focus:ring-primary" />
                        </FormControl>
                        <FormLabel className="font-normal text-zinc-300 group-hover:text-white transition-colors cursor-pointer">Na chegada (pela assessora)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 group cursor-pointer">
                        <FormControl>
                          <RadioGroupItem value="No dia ao final do evento" className="border-zinc-700 text-primary focus:ring-primary" />
                        </FormControl>
                        <FormLabel className="font-normal text-zinc-300 group-hover:text-white transition-colors cursor-pointer">Ao final do evento</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>

          <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Assinale os itens permitidos pelo local*
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Uso de instrumentos (pandeiro)",
                  "Bomba de som de explosão (sem fogo)",
                  "Sinalizador (área externa)",
                  "Papel picado não laminado (bomba sem fogo)",
                  "Chuva de prata/gerb indoor",
                  "Fumaça bastão",
                  "Bazuca CO2",
                  "Adesivos p/ convidados",
                ].map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="allowed_items"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== item)
                                    );
                              }}
                              className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-zinc-300 cursor-pointer">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="has_screen"
            render={({ field }) => (
              <FormItem className="relative z-[80]">
                <FormLabel className="text-zinc-400">O Local tem telão? Vídeo com áudio sincronizado?*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[81]">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[999999]">
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Não, apenas som">Não, apenas som</SelectItem>
                    <SelectItem value="Apenas video">Apenas vídeo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Seção 4: Contato e Detalhes do Plano */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Equipe e Detalhes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contact_person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Responsável pelo cronograma/local*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_person_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Telefone do responsável*</FormLabel>
                  <FormControl>
                    <Input placeholder="WhatsApp/Telefone" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                  </FormControl>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>

          <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Serviços extras inclusos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Sapatinho",
                  "Tequileiros",
                  "Bazuca CO2",
                  "Plataforma 360º",
                  "Totem Fotográfico",
                  "Fantasia extra",
                  "Não está incluso",
                ].map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="extra_services"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== item)
                                    );
                              }}
                              className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-zinc-300 cursor-pointer">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-[70]">
            <FormField
              control={form.control}
              name="character_count"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-zinc-400">Quantos personagens contratados?*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[71]">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[999999]">
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {field.value === "Outro" && (
                    <FormControl>
                      <Input 
                        placeholder="Especifique a quantidade" 
                        className="bg-zinc-900/50 border-zinc-800 focus:border-primary transition-all h-12 animate-in fade-in slide-in-from-top-1 relative z-[71]"
                      />
                    </FormControl>
                  )}
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stay_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400">Tempo de permanência na balada*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 relative z-[71]">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white z-[999999]">
                      <SelectItem value="20min">20min</SelectItem>
                      <SelectItem value="30min">30min</SelectItem>
                      <SelectItem value="45min">45min</SelectItem>
                      <SelectItem value="1h00">1h00</SelectItem>
                      <SelectItem value="1h30">1h30</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-primary" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Seção 5: Financeiro */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Informações Financeiras</h2>
          </div>

          <div className="p-8 bg-zinc-900/40 rounded-2xl border border-primary/20 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-6xl font-bold italic text-primary">PIX</span>
            </div>
            
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              Chave Pix para Gravata
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="pix_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Chave Pix*</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-950 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 font-mono" {...field} />
                    </FormControl>
                    <FormMessage className="text-primary" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pix_holder_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Nome do Titular da conta*</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-950 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12 uppercase" {...field} />
                    </FormControl>
                    <FormMessage className="text-primary" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="pix_key_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Tipo de chave (CPF, E-mail, Celular...)*</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-950 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                    </FormControl>
                    <FormMessage className="text-primary" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pix_bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400">Banco*</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-950 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                    </FormControl>
                    <FormMessage className="text-primary" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="is_aware_of_card_fees"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Ciente das taxas da máquina de cartão da La Gravata?*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Sim, iremos usar maquina da la gravata">Sim, iremos usar máquina da La Gravata</SelectItem>
                    <SelectItem value="Não, usaremos a nossa">Não, usaremos a nossa</SelectItem>
                    <SelectItem value="Não usaremos maquina">Não usaremos máquina</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />
        </div>

        <Separator className="bg-zinc-800/50" />

        {/* Seção 6: Finalização */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Redes Sociais e Feedback</h2>
          </div>

          <FormField
            control={form.control}
            name="social_media_1"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Qual rede social (Insta/FB) devemos marcar?*</FormLabel>
                <FormControl>
                  <Input placeholder="@digite o @ aqui!" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12" {...field} />
                </FormControl>
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="how_did_you_hear_about_us"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-zinc-400">Como nos conheceu?*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Vi em um evento">Vi em um evento</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                {field.value === "Outros" && (
                  <FormControl>
                    <Input 
                      placeholder="Especifique como nos conheceu" 
                      className="bg-zinc-900/50 border-zinc-800 focus:border-primary transition-all h-12 animate-in fade-in slide-in-from-top-1"
                    />
                  </FormControl>
                )}
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400">Observações Adicionais</FormLabel>
                <FormControl>
                  <Textarea placeholder="Campo destinado para fazer observações para equipe La Gravata de Papel" className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-primary/20 transition-all min-h-[120px]" {...field} />
                </FormControl>
                <FormMessage className="text-primary" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex pt-10">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-8 text-xl rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 border-none group"
            disabled={submitting}
          >
            {submitting ? "PROCESSANDO..." : "ENVIAR QUESTIONÁRIO AGORA"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
