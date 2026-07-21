"use client";

import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { CVData } from "@/types/cv";
import { CVDocumentPDF } from "@/components/CVDocumentPDF";

interface ExportButtonProps {
  data: CVData;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const doc = <CVDocumentPDF data={data} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.personalInfo.fullName.trim().replace(/\s+/g, "_")}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white font-medium shadow-sm transition-all disabled:opacity-85"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin text-white/80" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>{isGenerating ? "Generating..." : <span>Download <span className="hidden sm:inline">PDF</span></span>}</span>
    </Button>
  );
};
