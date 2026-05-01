import { useState } from "react";
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
      const { error } = await supabase.from("questionnaire_responses").insert({
        ...values,
        is_assistant_aware: values.is_assistant_aware === "Sim",
        everyone_informed: values.everyone_informed === "Sim",
        changing_room_informed: values.changing_room_informed === "Sim",
      });

      if (error) throw error;

      toast.success("Questionário enviado com sucesso!");
      form.reset();
    } catch (error: any) {
      console.error("Erro ao enviar:", error);
      toast.error("Erro ao enviar questionário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do evento*</FormLabel>
                <FormControl>
                  <Input type="date" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo do evento*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Escolha uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Casamento">Casamento</SelectItem>
                    <SelectItem value="Debutante">Debutante</SelectItem>
                    <SelectItem value="Empresarial">Empresarial</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
                <FormLabel>Nome (Cônjuge/Debutante/Empresa)*</FormLabel>
                <FormControl>
                  <Input placeholder="Primeiro nome" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondary_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segundo Nome (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Segundo nome do cônjuge" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="venue_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do local do evento*</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do espaço" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="performance_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário da apresentação*</FormLabel>
                <FormControl>
                  <Input type="time" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço completo (Rua, Av, nº)*</FormLabel>
              <FormControl>
                <Input className="bg-zinc-900 border-zinc-800" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="municipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Município*</FormLabel>
                <FormControl>
                  <Input className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade*</FormLabel>
                <FormControl>
                  <Input className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP*</FormLabel>
                <FormControl>
                  <Input className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="complement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referência ou complemento*</FormLabel>
              <FormControl>
                <Textarea className="bg-zinc-900 border-zinc-800 min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <FormField
            control={form.control}
            name="is_assistant_aware"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Assessoria está ciente dos requisitos?*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Sim" />
                      </FormControl>
                      <FormLabel className="font-normal">Sim</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Não" />
                      </FormControl>
                      <FormLabel className="font-normal">Não</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parking_payment_pref"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Preferencia de pagamento estacionamento/valet?*</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Através da assessora no local na chegada" />
                      </FormControl>
                      <FormLabel className="font-normal">Na chegada (pela assessora)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="No dia ao final do evento" />
                      </FormControl>
                      <FormLabel className="font-normal">Ao final do evento</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-4 block">Assinale os itens permitidos pelo local*</h3>
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item}</FormLabel>
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
            <FormItem>
              <FormLabel>O Local tem telão? Pode passar vídeo com áudio sincronizado?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Escolha uma opção" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                  <SelectItem value="Não, apenas som">Não, apenas som</SelectItem>
                  <SelectItem value="Apenas video">Apenas vídeo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contact_person_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável pelo cronograma/local*</FormLabel>
                <FormControl>
                  <Input placeholder="Nome" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_person_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do responsável*</FormLabel>
                <FormControl>
                  <Input placeholder="WhatsApp/Telefone" className="bg-zinc-900 border-zinc-800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold mb-4 block">Serviços extras inclusos</h3>
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="character_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantos personagens contratados?*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Escolha uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stay_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo de permanência na balada*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue placeholder="Escolha uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="20min">20min</SelectItem>
                    <SelectItem value="30min">30min</SelectItem>
                    <SelectItem value="45min">45min</SelectItem>
                    <SelectItem value="1h00">1h00</SelectItem>
                    <SelectItem value="1h30">1h30</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="p-6 bg-primary/10 rounded-xl border border-primary/20 space-y-6">
          <h3 className="text-xl font-bold text-primary">Informações de Pagamento (Gravata Pix)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="pix_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave Pix*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900 border-zinc-800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pix_holder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Titular da conta*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900 border-zinc-800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="pix_key_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de chave (CPF, E-mail, Celular...)*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900 border-zinc-800" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pix_bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco*</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-900 border-zinc-800" {...field} />
                  </FormControl>
                  <FormMessage />
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
              <FormLabel>Ciente das taxas da máquina de cartão da La Gravata?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Escolha uma opção" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="Sim, iremos usar maquina da la gravata">Sim, iremos usar máquina da La Gravata</SelectItem>
                  <SelectItem value="Não, usaremos a nossa">Não, usaremos a nossa</SelectItem>
                  <SelectItem value="Não usaremos maquina">Não usaremos máquina</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social_media_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qual rede social (Insta/FB) devemos marcar?*</FormLabel>
              <FormControl>
                <Input placeholder="@digite o @ aqui!" className="bg-zinc-900 border-zinc-800" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="how_did_you_hear_about_us"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Como nos conheceu?*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Escolha uma opção" />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            disabled={submitting}
          >
            {submitting ? "ENVIANDO..." : "ENVIAR QUESTIONÁRIO"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
