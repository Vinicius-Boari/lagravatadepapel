
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon: Icon, action, className }: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex justify-between items-center bg-zinc-950/95 backdrop-blur-md z-[60] px-6 py-4 -mx-8 -mt-8 border-b border-zinc-800/80 shadow-2xl mb-6",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="bg-red-600/10 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-red-500 leading-none">{title}</h2>
          {subtitle && (
            <p className="text-[10px] text-red-500/50 uppercase tracking-widest mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}
