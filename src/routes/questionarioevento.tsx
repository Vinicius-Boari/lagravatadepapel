import { createFileRoute } from "@tanstack/react-router";
import { QuestionarioForm } from "@/components/QuestionarioForm";

export const Route = createFileRoute("/questionarioevento")({
  head: () => ({
    meta: [
      { title: "Questionário de Evento — La Gravata de Papel" },
      { name: "description", content: "Preencha o questionário para garantir o horário e os detalhes da sua invasão La Gravata de Papel." },
    ],
  }),
  component: QuestionarioPage,
});

function QuestionarioPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 text-center">LA GRAVATA DE PAPEL 🧨</h1>
        <p className="text-lg text-zinc-300 text-center mb-12 italic">Olá tudo bem? precisamos que respondam esse questionário em até 5 dias antes do evento para podermos garantir o horário pretendido.</p>
        
        <QuestionarioForm />
      </div>
    </div>
  );
}
