"use client";

import React from "react";
import { Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewSectionProps {
  section: string;
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  section,
  children,
  className,
  label,
}) => {
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("add-cv-item", { detail: { section } }));
  };

  return (
    <div className={cn("group/section relative transition-all duration-200", className)}>
      {/* Section Hover Overlay Outline */}
      <div className="absolute inset-0 border border-dashed border-transparent group-hover/section:border-indigo-400/40 rounded-lg pointer-events-none -m-2 z-10 transition-all duration-200" />
      
      {children}

      {/* Floating Add Button for Section */}
      {section !== "personal" && section !== "summary" && section !== "skills" && (
        <div className="flex justify-center mt-2.5 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 print:hidden relative z-20">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95 animate-in fade-in zoom-in duration-200"
          >
            <Plus className="h-3 w-3 animate-pulse" />
            <span>Add {label || section.charAt(0).toUpperCase() + section.slice(1)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface PreviewItemProps {
  section: string;
  id: string;
  index: number;
  totalCount: number;
  children: React.ReactNode;
  className?: string;
}

export const PreviewItem: React.FC<PreviewItemProps> = ({
  section,
  id,
  index,
  totalCount,
  children,
  className,
}) => {
  const handleMove = (e: React.MouseEvent, direction: "up" | "down") => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("move-cv-item", { detail: { section, id, direction } }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete this ${section} item?`)) {
      window.dispatchEvent(new CustomEvent("delete-cv-item", { detail: { section, id } }));
    }
  };

  return (
    <div className={cn("group/item relative transition-all duration-200", className)}>
      {/* Item Hover Background highlight */}
      <div className="absolute inset-0 bg-transparent group-hover/item:bg-slate-50/20 border border-transparent group-hover/item:border-indigo-400/25 rounded-lg pointer-events-none -m-1 z-10 transition-all duration-200" />

      {children}

      {/* Floating Toolbar on Hover */}
      <div className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 print:hidden flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-lg p-1 z-30">
        <button
          type="button"
          onClick={(e) => handleMove(e, "up")}
          disabled={index === 0}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => handleMove(e, "down")}
          disabled={index === totalCount - 1}
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <div className="h-3.5 w-[1px] bg-slate-200 mx-0.5" />
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

interface PreviewFieldProps {
  path: string;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export const PreviewField: React.FC<PreviewFieldProps> = ({
  path,
  children,
  className,
  as: Component = "span",
  style,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("focus-cv-field", { detail: { path } }));
  };

  return (
    <Component
      data-path={path}
      onClick={handleClick}
      style={style}
      className={cn(
        "cursor-pointer hover:bg-indigo-50/45 hover:ring-2 hover:ring-dashed hover:ring-indigo-400 hover:ring-offset-2 rounded-xs transition-all duration-150 relative inline-block print:hover:bg-transparent print:hover:ring-0 print:hover:ring-offset-0 print:cursor-default",
        className
      )}
    >
      {children}
    </Component>
  );
};
