import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteSections } from "@/components/SiteSections";
import { VisualEditorProvider, useVisualEditor } from "@/components/admin/VisualEditorContext";
import { Button } from "@/components/ui/button";
import { Save, X, Eye, EyeOff, Monitor, Smartphone, Layout, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/visual-editor")({
  component: VisualEditorPageWrapper,
});

function VisualEditorPageWrapper() {
  return (
    <VisualEditorProvider>
      <VisualEditorContent />
    </VisualEditorProvider>
  );
}

function VisualEditorContent() {
  const { isEditing, setIsEditing, draftContent, saveChanges } = useVisualEditor();
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const navigate = useNavigate();

  // Enable editing on mount
  useEffect(() => {
    setIsEditing(true);
    // Add editor styles
    document.body.classList.add("is-visual-editing");
    return () => {
      document.body.classList.remove("is-visual-editing");
    };
  }, [setIsEditing]);

  const handleExit = () => {
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Editor Toolbar */}
      <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 z-[100] shadow-xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-400 hover:text-white"
            onClick={handleExit}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Painel
          </Button>
          <div className="h-6 w-px bg-zinc-800 mx-2" />
          <h1 className="font-bold text-red-500 uppercase tracking-tighter text-sm">Visual Editor</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-800 rounded-lg p-0.5 mr-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", viewport === "desktop" ? "bg-zinc-700 text-white" : "text-zinc-400")}
              onClick={() => setViewport("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", viewport === "mobile" ? "bg-zinc-700 text-white" : "text-zinc-400")}
              onClick={() => setViewport("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className={cn("border-zinc-800 text-zinc-400", isPreviewMode && "bg-zinc-800 text-white border-zinc-700")}
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              setIsEditing(isPreviewMode);
            }}
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {isPreviewMode ? "Editar" : "Preview"}
          </Button>

          <Button 
            size="sm" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={saveChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Publicar Alterações
          </Button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 overflow-auto bg-zinc-950 flex flex-col items-center py-8">
        <div 
          className={cn(
            "bg-black shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 relative",
            viewport === "desktop" ? "w-full max-w-[1920px]" : "w-[390px] h-[844px] rounded-[40px] border-[8px] border-zinc-800 overflow-hidden"
          )}
        >
          <div className={cn("w-full h-full bg-black overflow-y-auto overflow-x-hidden", viewport === "mobile" && "no-scrollbar")}>
            <SiteSections content={draftContent} />
          </div>
        </div>
      </main>

      {/* Helper Footer */}
      {!isPreviewMode && (
        <div className="h-10 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center px-4 text-[10px] text-zinc-500 uppercase tracking-widest gap-8">
          <span className="flex items-center gap-1"><Layout className="w-3 h-3" /> Clique em qualquer elemento para editar</span>
          <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Salve para aplicar no site público</span>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .is-visual-editing .whatsapp-float-real { display: none !important; }
      `}</style>
    </div>
  );
}
