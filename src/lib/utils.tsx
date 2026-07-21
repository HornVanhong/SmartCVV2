import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Mail, Phone, MapPin, Github, Linkedin, Globe, Facebook, Twitter, Instagram, Youtube, Gitlab } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSocialIcon(val: string | undefined | null, className?: string) {
  if (!val) return <Globe className={className} />;
  const trimmed = val.toLowerCase();
  
  if (trimmed.includes("github") || trimmed.includes("git")) return <Github className={className} />;
  if (trimmed.includes("linkedin")) return <Linkedin className={className} />;
  if (trimmed.includes("facebook") || trimmed.includes("fb")) return <Facebook className={className} />;
  if (trimmed.includes("twitter") || trimmed.includes("x.com")) return <Twitter className={className} />;
  if (trimmed.includes("instagram") || trimmed.includes("ig")) return <Instagram className={className} />;
  if (trimmed.includes("youtube") || trimmed.includes("yt")) return <Youtube className={className} />;
  if (trimmed.includes("gitlab")) return <Gitlab className={className} />;
  
  return <Globe className={className} />;
}

export function getLinkInfo(val: string | undefined | null): { label: string; url: string } {
  if (!val) return { label: "", url: "" };
  const trimmed = val.trim();
  const index = trimmed.indexOf("|");
  if (index !== -1) {
    const label = trimmed.substring(0, index).trim();
    const url = trimmed.substring(index + 1).trim();
    return { label, url };
  }
  // Check if it's in markdown format [Label](URL)
  const mdMatch = trimmed.match(/^\[(.*?)\]\((.*?)\)$/);
  if (mdMatch) {
    return { label: mdMatch[1].trim(), url: mdMatch[2].trim() };
  }
  
  return { label: trimmed.replace(/^(https?:\/\/)?(www\.)?/, ""), url: trimmed };
}

export function getLinkLabel(val: string | undefined | null): string {
  if (!val) return "";
  return getLinkInfo(val).label;
}

export function formatUrl(url: string | undefined | null): string {
  if (!url) return "";
  const { url: actualUrl } = getLinkInfo(url);
  const trimmed = actualUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isLightColor(colorHex?: string): boolean {
  if (!colorHex) return false;
  const hex = colorHex.replace("#", "").trim();
  if (hex.length === 3) {
    const r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
    const g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
    const b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  }
  return false;
}

export interface MarkdownToken {
  type: "text" | "bold" | "italic" | "highlight";
  content: string;
}

export function parseInlineMarkdown(text: string): MarkdownToken[] {
  const parts: MarkdownToken[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|==.*?==)/g;
  const split = text.split(regex);
  for (const token of split) {
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push({ type: "bold", content: token.slice(2, -2) });
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push({ type: "italic", content: token.slice(1, -1) });
    } else if (token.startsWith("==") && token.endsWith("==")) {
      parts.push({ type: "highlight", content: token.slice(2, -2) });
    } else if (token) {
      parts.push({ type: "text", content: token });
    }
  }
  return parts;
}

export function renderMarkdownHTML(text?: string, customBodyClass?: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const renderLineContent = (lineText: string) => {
    const tokens = parseInlineMarkdown(lineText);
    return tokens.map((token, idx) => {
      if (token.type === "bold") {
        return <strong key={idx} className="font-bold text-slate-900">{token.content}</strong>;
      }
      if (token.type === "italic") {
        return <em key={idx} className="italic">{token.content}</em>;
      }
      if (token.type === "highlight") {
        return <span key={idx} className="bg-yellow-250 px-1 py-0.5 rounded font-bold text-slate-900 mx-0.5 inline-block">{token.content}</span>;
      }
      return token.content;
    });
  };

  const textClass = customBodyClass || "text-xs sm:text-sm text-slate-650";

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${lineIdx}`} className="list-disc pl-4 space-y-1 my-1.5 text-xs sm:text-sm text-slate-700">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      elements.push(<div key={`br-${lineIdx}`} className="h-1.5" />);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      currentList.push(
        <li key={`li-${lineIdx}`} className="leading-relaxed">
          {renderLineContent(bulletMatch[1])}
        </li>
      );
    } else {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${lineIdx}`} className="list-disc pl-4 space-y-1 my-1.5 text-xs sm:text-sm text-slate-700">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      elements.push(
        <p key={`p-${lineIdx}`} className={`${textClass} leading-relaxed text-justify mb-1`}>
          {renderLineContent(trimmed)}
        </p>
      );
    }
  });

  if (currentList.length > 0) {
    elements.push(
      <ul key="list-final" className="list-disc pl-4 space-y-1 my-1.5 text-xs sm:text-sm text-slate-700">
        {currentList}
      </ul>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

