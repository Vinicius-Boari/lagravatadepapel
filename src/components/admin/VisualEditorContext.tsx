import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { SiteContent, useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "sonner";

interface VisualEditorContextType {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  draftContent: SiteContent;
  updateDraft: (section: string, field: string, value: any) => void;
  saveChanges: () => Promise<void>;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | undefined>(undefined);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  // We check if we are in the visual editor route to decide whether to use drafts
  const isVisualEditorPath = typeof window !== 'undefined' && window.location.pathname === '/admin/visual-editor';
  const { content, updateSection } = useSiteContent(isVisualEditorPath); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<SiteContent>(content);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Sync draftContent when content from hook changes (e.g. initial load or path change)
  React.useEffect(() => {
    setDraftContent(content);
  }, [content]);

  const updateDraft = useCallback((section: string, field: string, value: any) => {
    setDraftContent(prev => {
      const newContent = { ...prev };
      const sectionData = { ...(newContent[section] || {}) };
      
      // Handle array paths like "items[0].title"
      if (field.includes('[') && field.includes(']')) {
        const parts = field.split(/[\[\].]+/);
        const arrayKey = parts[0];
        const index = parseInt(parts[1], 10);
        const property = parts[2];
        
        const array = [...(sectionData[arrayKey] || [])];
        array[index] = { ...array[index], [property]: value };
        sectionData[arrayKey] = array;
      } else if (field === "title_lines" && typeof value === "string") {
        sectionData[field] = value.split("\n");
      } else if (field === "paragraphs" && typeof value === "string") {
        sectionData[field] = value.split("\n");
      } else {
        sectionData[field] = value;
      }
      
      newContent[section] = sectionData;
      return newContent;
    });
  }, []);

  const saveChanges = async () => {
    try {
      const sections = Object.keys(draftContent);
      const savePromises = sections.map(section => 
        updateSection(section, draftContent[section])
      );
      
      await Promise.all(savePromises);
      toast.success("Alterações salvas e publicadas com sucesso!");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erro ao salvar alterações.");
    }
  };

  return (
    <VisualEditorContext.Provider 
      value={{ 
        isEditing, 
        setIsEditing, 
        draftContent, 
        updateDraft, 
        saveChanges,
        selectedElement,
        setSelectedElement
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
}

export const useVisualEditor = () => {
  const context = useContext(VisualEditorContext);
  if (context === undefined) {
    // Return a safe fallback or throw depending on architecture
    // For this project, we want it available everywhere
    throw new Error("useVisualEditor must be used within a VisualEditorProvider");
  }
  return context;
}
