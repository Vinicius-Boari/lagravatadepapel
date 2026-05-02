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
    <div className="min-h-screen bg-black text-white py-12 px-4 md:px-8 relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <a 
          href="/" 
          className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-sans text-sm tracking-widest uppercase"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </a>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 text-center">LA GRAVATA DE PAPEL 🧨</h1>
        <p className="text-lg text-zinc-300 text-center mb-12 italic">Olá tudo bem? precisamos que respondam esse questionário em até 5 dias antes do evento para podermos garantir o horário pretendido.</p>
        
        <QuestionarioForm />
      </div>
    </div>
  );
}
