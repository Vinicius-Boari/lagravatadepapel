import React, { useState, useEffect, useRef } from "react";
import { useVisualEditor } from "./VisualEditorContext";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Image as ImageIcon, Link as LinkIcon, Move, Trash2, Plus, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditableElementProps {
  children: React.ReactNode;
  section: string;
  field: string;
  type?: "text" | "textarea" | "image" | "link" | "button";
  label?: string;
  className?: string;
  id?: string;
}

export function EditableElement({ 
  children, 
  section, 
  field, 
  type = "text", 
  label,
  className,
  id
}: EditableElementProps) {
  const { isEditing, draftContent, updateDraft, selectedElement, setSelectedElement } = useVisualEditor();
  const [isOpen, setIsOpen] = useState(false);
  const elementId = id || `${section}-${field}`;
  const isSelected = selectedElement === elementId;
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isEditing) return <>{children}</>;

  const currentValue = draftContent[section]?.[field] || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateDraft(section, field, e.target.value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Enviando imagem...");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `visual_editor/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-media')
        .getPublicUrl(filePath);

      updateDraft(section, field, publicUrl);
      toast.dismiss();
      toast.success("Imagem atualizada!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss();
      toast.error("Erro ao fazer upload.");
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative group transition-all duration-200 min-h-[1em] min-w-[1em]",
        isSelected ? "ring-2 ring-red-500 ring-offset-2 ring-offset-transparent z-[50]" : "hover:ring-1 hover:ring-red-400/50 cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(elementId);
        setIsOpen(true);
      }}
    >
      {/* Selection UI */}
      {isSelected && (
        <>
          {/* Top Bar / Label */}
          <div className="absolute -top-7 left-0 bg-red-600 text-white text-[10px] px-2 py-1 rounded-t-md font-bold flex items-center gap-1.5 z-[60] shadow-lg whitespace-nowrap">
            <GripVertical className="w-3 h-3 cursor-grab active:cursor-grabbing" />
            {type === 'image' ? <ImageIcon className="w-3 h-3" /> : type === 'link' ? <LinkIcon className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
            {label || field.replace('_', ' ')}
          </div>
          
          {/* Action Tools */}
          <div className="absolute -top-7 right-0 flex items-center gap-1 z-[60]">
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-6 w-6 rounded-md shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                if(confirm("Deseja realmente remover este elemento?")) {
                  updateDraft(section, field, "");
                }
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}

      <Popover open={isOpen && isSelected} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="w-full h-full">{children}</div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 bg-zinc-950 border-zinc-800 text-white p-4 shadow-2xl z-[100]"
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold text-red-500 uppercase tracking-tighter text-sm flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Edit2 className="w-4 h-4" />
              Editar {label || field}
            </h4>
            
            {type === "text" && (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-zinc-500">Conteúdo do Texto</Label>
                <Input 
                  autoFocus
                  value={currentValue} 
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}

            {type === "textarea" && (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-zinc-500">Conteúdo do Texto</Label>
                <Textarea 
                  autoFocus
                  value={currentValue} 
                  onChange={handleChange}
                  rows={6}
                  className="bg-zinc-900 border-zinc-800 text-white focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
            )}

            {type === "image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-zinc-500">Upload de Arquivo</Label>
                  <div className="relative">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-zinc-900 border-zinc-800 text-white cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div className="bg-zinc-900 border-dashed border-2 border-zinc-800 rounded-lg py-6 flex flex-col items-center justify-center text-zinc-400 gap-2">
                      <Plus className="w-6 h-6" />
                      <span className="text-xs">Clique para selecionar imagem</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-zinc-500">Ou use uma URL externa</Label>
                  <Input 
                    value={currentValue} 
                    onChange={handleChange}
                    className="bg-zinc-900 border-zinc-800 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {(type === "link" || type === "button") && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-zinc-500">Texto do Botão / Link</Label>
                  <Input 
                    value={draftContent[section]?.[field.replace('_url', '_label')] || ""} 
                    onChange={(e) => updateDraft(section, field.replace('_url', '_label'), e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-zinc-500">Link de Redirecionamento</Label>
                  <Input 
                    value={currentValue} 
                    onChange={handleChange}
                    className="bg-zinc-900 border-zinc-800 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => setIsOpen(false)}>Concluído</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
