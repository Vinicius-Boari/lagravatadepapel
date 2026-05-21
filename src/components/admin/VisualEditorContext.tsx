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
  const { content, updateSection } = useSiteContent(true); // Always use draft if possible
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<SiteContent>(content);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Sync draftContent when content from hook changes (e.g. initial load)
  React.useEffect(() => {
    setDraftContent(content);
  }, [content]);

  const updateDraft = useCallback((section: string, field: string, value: any) => {
    setDraftContent(prev => {
      const sectionData = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  }, []);

  const saveChanges = async () => {
    try {
      // In a real visual editor, we might want to save all modified sections
      // For simplicity, we'll compare and save what changed or just save everything
      const sections = Object.keys(draftContent);
      const savePromises = sections.map(section => 
        updateSection(section, draftContent[section])
      );
      
      await Promise.all(savePromises);
      toast.success("Alterações salvas com sucesso!");
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
    throw new Error("useVisualEditor must be used within a VisualEditorProvider");
  }
  return context;
}
