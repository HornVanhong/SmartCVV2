"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);
import { CVData, PersonalInfo, Education, Experience, Project, Language, Reference, CVTheme, CustomSection, CustomSectionItem } from "@/types/cv";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, GraduationCap, Briefcase, FolderGit2, Languages, User, Award, FileText, Upload, UserCheck, Palette, ChevronUp, ChevronDown } from "lucide-react";
import { translations } from "@/lib/translations";
import { getLinkInfo } from "@/lib/utils";

const STANDARD_GOOGLE_FONTS = ["Inter", "Poppins", "Roboto", "Lora", "Playfair Display", "Noto Sans Khmer"];
const KHMER_GOOGLE_FONT_SUGGESTIONS = [
  "Angkor", "Battambang", "Bayon", "Bokor", "Chenla", "Content", "Dangrek", "Fasthand", "Freehand",
  "Hanuman", "Kantumruy", "Kantumruy Pro", "Kdam Thmor Pro", "Khmer", "Khula", "Koh Santepheap",
  "Koulen", "Krahand", "Moul", "Moulpali", "Noto Sans Khmer", "Noto Serif Khmer", "Odor Mean Chey",
  "Preahvihear", "Siemreap", "Srisakdi", "Suwannaphum", "Taprom"
];
const GOOGLE_FONT_SUGGESTIONS = Array.from(new Set([
  ...KHMER_GOOGLE_FONT_SUGGESTIONS,
  "ABeeZee", "Abril Fatface", "Alegreya", "Archivo", "Arimo", "Bebas Neue", "Bitter", "Cairo",
  "Cinzel", "Cormorant Garamond", "DM Sans", "DM Serif Display", "Dancing Script", "EB Garamond",
  "Exo 2", "Fira Sans", "Fjalla One", "Forum", "IBM Plex Sans", "IBM Plex Serif", "Inconsolata",
  "Indie Flower", "Inter", "Josefin Sans", "Kanit", "Lato", "Libre Baskerville", "Libre Franklin",
  "Lora", "Manrope", "Merriweather", "Montserrat", "Mukta", "Noto Sans", "Noto Sans Khmer",
  "Noto Serif Khmer", "Nunito", "Open Sans", "Oswald", "Outfit", "Pacifico", "Playfair Display",
  "Plus Jakarta Sans", "Poppins", "Prompt", "PT Sans", "Quicksand", "Raleway", "Roboto",
  "Roboto Condensed", "Roboto Slab", "Rubik", "Sarabun", "Source Sans 3", "Space Grotesk",
  "Teko", "Ubuntu", "Work Sans", "Yeseva One"
]));

interface CVFormProps {
  data: CVData;
  onChange: (newData: CVData) => void;
}

export const CVForm: React.FC<CVFormProps> = ({ data, onChange }) => {
  const [skillInput, setSkillInput] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [isCustomGoogleFont, setIsCustomGoogleFont] = useState(
    !STANDARD_GOOGLE_FONTS.includes(data.theme?.fontFamily || "Inter")
  );
  const selectedGoogleFont = data.theme?.fontFamily || "";
  const matchingGoogleFonts = GOOGLE_FONT_SUGGESTIONS.filter((font) =>
    font.toLowerCase().includes(selectedGoogleFont.trim().toLowerCase())
  ).slice(0, 30);
  
  // Template filter states
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStyle, setFilterStyle] = useState<string>("All");
  const [filterLanguage, setFilterLanguage] = useState<string>("All");

  // Controlled Accordion State
  const [openSections, setOpenSections] = useState<string[]>(["theme", "personal"]);

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError("Image size exceeds 2MB limit.");
        return;
      }
      setPhotoError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        handlePersonalInfoChange("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    handlePersonalInfoChange("photo", "");
    setPhotoError("");
  };

  // Logo handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setLogoError("Image size exceeds 2MB limit.");
        return;
      }
      setLogoError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        handlePersonalInfoChange("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handlePersonalInfoChange("logo", "");
    setLogoError("");
  };

  // Personal Info helpers
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const parseField = (value: string | undefined | null) => {
    const info = getLinkInfo(value);
    const hasCustom = value ? (value.includes("|") || value.startsWith("[")) : false;
    return {
      label: hasCustom ? info.label : "",
      url: info.url
    };
  };

  const handleLinkChange = (field: "github" | "linkedin" | "portfolio", labelVal: string, urlVal: string) => {
    const trimmedUrl = urlVal.trim();
    const trimmedLabel = labelVal.trim();
    const combined = trimmedLabel ? `${trimmedLabel} | ${trimmedUrl}` : trimmedUrl;
    handlePersonalInfoChange(field, combined);
  };

  // Summary helper
  const handleSummaryChange = (value: string) => {
    onChange({
      ...data,
      professionalSummary: value,
    });
  };

  const handleHighlightTextarea = (textareaId: string, value: string, onChangeFn: (val: string) => void) => {
    const el = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
      alert("Please select some text inside the text area first, then click this button to highlight it!");
      return;
    }
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + `==${selectedText}==` + value.substring(end);
    onChangeFn(newValue);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, end + 4);
    }, 50);
  };

  const renderHighlightButton = (textareaId: string, value: string, onChangeFn: (val: string) => void) => {
    return (
      <button
        type="button"
        onClick={() => handleHighlightTextarea(textareaId, value, onChangeFn)}
        className="text-[10px] text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors font-semibold shrink-0 ml-auto"
        title="Select text in the editor and click to highlight it in yellow"
      >
        <span>✨</span> Highlight Selection
      </button>
    );
  };

  const renderActionVerbsHelper = (currentText: string, onUpdate: (val: string) => void) => {
    const actionVerbs = [
      "Led", "Architected", "Built", "Developed", "Spearheaded", "Optimized", 
      "Streamlined", "Increased", "Engineered", "Orchestrated", "Implemented", "Transformed"
    ];

    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Action Verbs:</span>
        {actionVerbs.map((verb) => (
          <button
            key={verb}
            type="button"
            onClick={() => {
              const text = currentText || "";
              const needsNewline = text.length > 0 && !text.endsWith("\n");
              const bullet = `${needsNewline ? "\n" : ""}• ${verb} `;
              onUpdate(`${text}${bullet}`);
            }}
            className="text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-slate-650 px-2 py-0.5 rounded-full cursor-pointer shrink-0 transition-all"
          >
            + {verb}
          </button>
        ))}
      </div>
    );
  };

  // List manipulation helpers
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "",
      major: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange({
      ...data,
      education: [...data.education, newEdu],
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean | number) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    onChange({
      ...data,
      experience: [...data.experience, newExp],
    });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | number) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id),
    });
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "",
      description: "",
      technologies: "",
      link: "",
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const updateProject = (id: string, field: keyof Project, value: string | boolean | number) => {
    onChange({
      ...data,
      projects: data.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((proj) => proj.id !== id),
    });
  };

  const addLanguage = () => {
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: "",
      level: "",
    };
    onChange({
      ...data,
      languages: [...data.languages, newLang],
    });
  };

  const updateLanguage = (id: string, field: keyof Language, value: string | number) => {
    onChange({
      ...data,
      languages: data.languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)),
    });
  };

  const removeLanguage = (id: string) => {
    onChange({
      ...data,
      languages: data.languages.filter((lang) => lang.id !== id),
    });
  };

  const addReference = () => {
    const newRef: Reference = {
      id: `ref-${Date.now()}`,
      name: "",
      relationship: "",
      company: "",
      email: "",
      phone: "",
    };
    onChange({
      ...data,
      references: [...(data.references || []), newRef],
    });
  };

  const updateReference = (id: string, field: keyof Reference, value: string | boolean | number) => {
    onChange({
      ...data,
      references: (data.references || []).map((ref) => (ref.id === id ? { ...ref, [field]: value } : ref)),
    });
  };

  const removeReference = (id: string) => {
    onChange({
      ...data,
      references: (data.references || []).filter((ref) => ref.id !== id),
    });
  };

  // Reordering helpers
  const moveEducation = (id: string, direction: "up" | "down") => {
    const list = data.education;
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const newList = [...list];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    onChange({ ...data, education: newList });
  };

  const moveExperience = (id: string, direction: "up" | "down") => {
    const list = data.experience;
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const newList = [...list];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    onChange({ ...data, experience: newList });
  };

  const moveProject = (id: string, direction: "up" | "down") => {
    const list = data.projects;
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const newList = [...list];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    onChange({ ...data, projects: newList });
  };

  const moveLanguage = (id: string, direction: "up" | "down") => {
    const list = data.languages;
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const newList = [...list];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    onChange({ ...data, languages: newList });
  };

  const moveReference = (id: string, direction: "up" | "down") => {
    const list = data.references || [];
    const index = list.findIndex((x) => x.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const newList = [...list];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    onChange({ ...data, references: newList });
  };

  const updateSectionName = (key: string, newName: string) => {
    onChange({
      ...data,
      theme: {
        ...data.theme,
        templateId: data.theme?.templateId || "modern",
        primaryColor: data.theme?.primaryColor || "#2563eb",
        sectionNames: {
          ...(data.theme?.sectionNames || {}),
          [key]: newName
        }
      }
    });
  };

  // Custom Section handlers
  const addCustomSection = (name: string) => {
    const sectionId = `csec-${Date.now()}`;
    const newSection: CustomSection = {
      id: sectionId,
      name,
      items: [
        {
          id: `citem-${Date.now()}`,
          title: "",
          subtitle: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    };
    onChange({
      ...data,
      customSections: [...(data.customSections || []), newSection]
    });
    setOpenSections((prev) => [...prev, `customSections.${sectionId}`]);
  };

  const removeCustomSection = (sectionId: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).filter((sec) => sec.id !== sectionId)
    });
  };

  const updateCustomSectionName = (sectionId: string, newName: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((sec) => 
        sec.id === sectionId ? { ...sec, name: newName } : sec
      )
    });
  };

  const addCustomSectionItem = (sectionId: string) => {
    const newId = `citem-${Date.now()}`;
    const newItem: CustomSectionItem = {
      id: newId,
      title: "",
      subtitle: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    onChange({
      ...data,
      customSections: (data.customSections || []).map((sec) => 
        sec.id === sectionId ? { ...sec, items: [...sec.items, newItem] } : sec
      )
    });
  };

  const updateCustomSectionItem = (sectionId: string, itemId: string, field: keyof CustomSectionItem, value: any) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.map((item) => 
              item.id === itemId ? { ...item, [field]: value } : item
            )
          };
        }
        return sec;
      })
    });
  };

  const removeCustomSectionItem = (sectionId: string, itemId: string) => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.filter((item) => item.id !== itemId)
          };
        }
        return sec;
      })
    });
  };

  const moveCustomSectionItem = (sectionId: string, itemId: string, direction: "up" | "down") => {
    onChange({
      ...data,
      customSections: (data.customSections || []).map((sec) => {
        if (sec.id === sectionId) {
          const list = sec.items;
          const index = list.findIndex((item) => item.id === itemId);
          if (index === -1) return sec;
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= list.length) return sec;
          const newList = [...list];
          const temp = newList[index];
          newList[index] = newList[targetIndex];
          newList[targetIndex] = temp;
          return { ...sec, items: newList };
        }
        return sec;
      })
    });
  };

  // Event Listeners for Preview Interactions
  React.useEffect(() => {
    const handleFocusField = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>;
      const { path } = customEvent.detail;
      if (!path) return;
      
      const parts = path.split(".");
      const section = parts[0];
      let accordionValue = section === "personalInfo" ? "personal" : (section === "professionalSummary" ? "summary" : section);

      if (section === "customSections") {
        accordionValue = `customSections.${parts[1]}`;
      }

      setOpenSections((prev) => {
        if (prev.includes(accordionValue)) return prev;
        return [...prev, accordionValue];
      });

      let searchId = path;
      if (section === "personalInfo") {
        searchId = parts[1];
      } else if (path === "professionalSummary") {
        searchId = "professionalSummary";
      }

      setTimeout(() => {
        const element = document.getElementById(searchId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus();
          element.classList.add("focus-highlight");
          setTimeout(() => {
            element.classList.remove("focus-highlight");
          }, 1500);
        }
      }, 200);
    };

    const handleAddCvItem = (e: Event) => {
      const customEvent = e as CustomEvent<{ section: string }>;
      const { section } = customEvent.detail;
      
      if (section.startsWith("customSections.")) {
        const sectionId = section.replace("customSections.", "");
        const newId = `citem-${Date.now()}`;
        
        onChange({
          ...data,
          customSections: (data.customSections || []).map((sec) => {
            if (sec.id === sectionId) {
              const newItem: CustomSectionItem = {
                id: newId,
                title: "",
                subtitle: "",
                startDate: "",
                endDate: "",
                description: ""
              };
              return {
                ...sec,
                items: [...sec.items, newItem]
              };
            }
            return sec;
          })
        });

        setOpenSections((prev) => {
          if (prev.includes(section)) return prev;
          return [...prev, section];
        });

        setTimeout(() => {
          const inputId = `${section}.${newId}.title`;
          const element = document.getElementById(inputId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
            element.classList.add("focus-highlight");
            setTimeout(() => element.classList.remove("focus-highlight"), 1500);
          }
        }, 250);
        return;
      }
      
      let newId = "";
      if (section === "experience") {
        newId = `exp-${Date.now()}`;
        const newExp = { id: newId, company: "", position: "", startDate: "", endDate: "", description: "" };
        onChange({ ...data, experience: [...data.experience, newExp] });
      } else if (section === "education") {
        newId = `edu-${Date.now()}`;
        const newEdu = { id: newId, school: "", major: "", startDate: "", endDate: "", description: "" };
        onChange({ ...data, education: [...data.education, newEdu] });
      } else if (section === "projects") {
        newId = `proj-${Date.now()}`;
        const newProj = { id: newId, name: "", description: "", technologies: "", link: "" };
        onChange({ ...data, projects: [...data.projects, newProj] });
      } else if (section === "languages") {
        newId = `lang-${Date.now()}`;
        const newLang = { id: newId, name: "", level: "" };
        onChange({ ...data, languages: [...data.languages, newLang] });
      } else if (section === "references") {
        newId = `ref-${Date.now()}`;
        const newRef = { id: newId, name: "", relationship: "", company: "", email: "", phone: "" };
        onChange({ ...data, references: [...(data.references || []), newRef] });
      }

      if (newId) {
        setOpenSections((prev) => {
          if (prev.includes(section)) return prev;
          return [...prev, section];
        });

        setTimeout(() => {
          const firstField = section === "experience" ? "company" : (section === "education" ? "school" : "name");
          const inputId = `${section}.${newId}.${firstField}`;
          const element = document.getElementById(inputId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
            element.classList.add("focus-highlight");
            setTimeout(() => element.classList.remove("focus-highlight"), 1500);
          }
        }, 250);
      }
    };

    const handleDeleteCvItem = (e: Event) => {
      const customEvent = e as CustomEvent<{ section: string; id: string }>;
      const { section, id } = customEvent.detail;
      if (section.startsWith("customSections.")) {
        const sectionId = section.replace("customSections.", "");
        removeCustomSectionItem(sectionId, id);
      } else {
        if (section === "experience") removeExperience(id);
        else if (section === "education") removeEducation(id);
        else if (section === "projects") removeProject(id);
        else if (section === "languages") removeLanguage(id);
        else if (section === "references") removeReference(id);
      }
    };

    const handleMoveCvItem = (e: Event) => {
      const customEvent = e as CustomEvent<{ section: string; id: string; direction: "up" | "down" }>;
      const { section, id, direction } = customEvent.detail;
      if (section.startsWith("customSections.")) {
        const sectionId = section.replace("customSections.", "");
        moveCustomSectionItem(sectionId, id, direction);
      } else {
        if (section === "experience") moveExperience(id, direction);
        else if (section === "education") moveEducation(id, direction);
        else if (section === "projects") moveProject(id, direction);
        else if (section === "languages") moveLanguage(id, direction);
        else if (section === "references") moveReference(id, direction);
      }
    };

    window.addEventListener("focus-cv-field", handleFocusField);
    window.addEventListener("add-cv-item", handleAddCvItem);
    window.addEventListener("delete-cv-item", handleDeleteCvItem);
    window.addEventListener("move-cv-item", handleMoveCvItem);
    return () => {
      window.removeEventListener("focus-cv-field", handleFocusField);
      window.removeEventListener("add-cv-item", handleAddCvItem);
      window.removeEventListener("delete-cv-item", handleDeleteCvItem);
      window.removeEventListener("move-cv-item", handleMoveCvItem);
    };
  }, [data, openSections]);

  const handleThemeChange = (field: keyof CVTheme, value: any) => {
    onChange({
      ...data,
      theme: {
        templateId: data.theme?.templateId || "modern",
        primaryColor: data.theme?.primaryColor || "#2563eb",
        ...data.theme,
        [field]: value,
      },
    });
  };

  // Skills helpers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !data.skills.includes(cleanSkill)) {
      onChange({
        ...data,
        skills: [...data.skills, cleanSkill],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">CV Editor</h2>
        <p className="text-xs text-slate-500 mt-0.5">Fill in your information to update the preview instantly.</p>
      </div>

      <div className="p-6 lg:overflow-y-auto lg:max-h-[calc(100vh-280px)] space-y-6">
        <Accordion multiple value={openSections} onValueChange={setOpenSections} className="w-full space-y-3 border-none">
          
          {/* Design & Layout (Templates & Colors) */}
          <AccordionItem value="theme" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <Palette className="h-4.5 w-4.5 text-indigo-550" />
                Design & Templates
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-5">
              
              <div className="space-y-4">
                {/* Category, Style, Language Filters */}
                <div className="space-y-3 border-b border-slate-100 pb-4">
                  {/* Category Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "Tech", "Executive", "Design", "General"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFilterCategory(cat)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                            filterCategory === cat
                              ? "bg-indigo-650 border-indigo-650 text-white shadow-xs"
                              : "bg-slate-55 border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Style</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "Modern", "Minimalist", "Creative", "Professional"].map((sty) => (
                        <button
                          key={sty}
                          type="button"
                          onClick={() => setFilterStyle(sty)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                            filterStyle === sty
                              ? "bg-emerald-650 border-emerald-650 text-white shadow-xs"
                              : "bg-slate-55 border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {sty}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Filter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "English", "Khmer"].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setFilterLanguage(lang)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                            filterLanguage === lang
                              ? "bg-amber-650 border-amber-650 text-white shadow-xs"
                              : "bg-slate-55 border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Templates Grid Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-700">Select Layout Template</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory("All");
                        setFilterStyle("All");
                        setFilterLanguage("All");
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                  
                  {(() => {
                    const templates = [
                      { id: "modern", name: "Modern Tech", desc: "Double column layout", category: "Tech", style: "Modern", languages: ["English", "Khmer"] },
                      { id: "minimalist", name: "Classic Minimalist", desc: "Clean centered layout", category: "General", style: "Minimalist", languages: ["English", "Khmer"] },
                      { id: "creative", name: "Creative Split", desc: "Modern split sidebar", category: "Design", style: "Creative", languages: ["English", "Khmer"] },
                      { id: "professional", name: "Professional Executive", desc: "Banner header design", category: "Executive", style: "Professional", languages: ["English", "Khmer"] },
                      { id: "elegant", name: "Elegant Academic", desc: "Serif font centered layout", category: "General", style: "Elegant", languages: ["English", "Khmer"] },
                      { id: "executive", name: "Executive Contrast", desc: "Dark panel sidebar style", category: "Executive", style: "Professional", languages: ["English", "Khmer"] },
                      { id: "fancygrid", name: "Fancy Grid", desc: "Card widget layout design", category: "Design", style: "Creative", languages: ["English", "Khmer"] },
                      { id: "simpleleft", name: "Simple Left Margin", desc: "Left sidebar headers layout", category: "General", style: "Minimalist", languages: ["English", "Khmer"] },
                      { id: "timeline", name: "Timeline Accent", desc: "Timeline dots experience list", category: "Tech", style: "Modern", languages: ["English", "Khmer"] },
                      { id: "portfolio", name: "Initial Portfolio", desc: "Initials branding badge header", category: "Design", style: "Creative", languages: ["English", "Khmer"] },
                      { id: "canvacolumn", name: "Canva Two Column", desc: "Elegant navy sidebar with linear progress and timeline dots", category: "Design", style: "Creative", languages: ["English", "Khmer"] },
                      { id: "kshrd", name: "Korea Software HRD", desc: "Official HRD center student background CV template", category: "Academic", style: "Professional", languages: ["English", "Khmer"] }
                    ] as const;

                    const filtered = templates.filter((temp) => {
                      const matchCategory = filterCategory === "All" || temp.category === filterCategory;
                      const matchStyle = filterStyle === "All" || temp.style === filterStyle;
                      const matchLanguage = filterLanguage === "All" || (temp.languages as readonly string[]).includes(filterLanguage);
                      return matchCategory && matchStyle && matchLanguage;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                          No templates match your filters.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {filtered.map((temp) => {
                          const active = (data.theme?.templateId || "modern") === temp.id;
                          return (
                            <button
                              key={temp.id}
                              type="button"
                              onClick={() => handleThemeChange("templateId", temp.id)}
                              className={`flex flex-col items-start justify-center p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                active
                                  ? "border-blue-600 bg-blue-50/30 shadow-xs ring-1 ring-blue-500/20"
                                  : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                              }`}
                            >
                              <span className={`text-xs font-bold ${active ? "text-blue-600" : "text-slate-800"}`}>
                                {temp.name}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 leading-tight">
                                {temp.desc}
                              </span>
                              <div className="flex gap-1 mt-2 flex-wrap">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-sm">{temp.category}</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-sm">{temp.style}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Document Language */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold text-slate-700">Document Language</Label>
                <div className="flex gap-2">
                  {[
                    { code: "en", name: "English (EN)" },
                    { code: "km", name: "Khmer (KH)" }
                  ].map((langOpt) => {
                    const active = (data.theme?.language || "en") === langOpt.code;
                    return (
                      <button
                        key={langOpt.code}
                        type="button"
                        onClick={() => handleThemeChange("language", langOpt.code)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          active
                            ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                        }`}
                      >
                        {langOpt.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Layout Mode */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Experience Layout Mode</span>
                  <span className="text-[10px] font-normal text-slate-400">(Order sections)</span>
                </Label>
                <div className="flex gap-2">
                  {[
                    { code: "experienced", name: "Experienced (Work First)", desc: "Show professional career history first" },
                    { code: "entry", name: "Entry-Level (Education First)", desc: "Show academic credentials & projects first" }
                  ].map((levelOpt) => {
                    const active = (data.theme?.experienceLevel || "experienced") === levelOpt.code;
                    return (
                      <button
                        key={levelOpt.code}
                        type="button"
                        onClick={() => handleThemeChange("experienceLevel", levelOpt.code)}
                        className={`flex-1 p-2.5 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-center gap-0.5 ${
                          active
                            ? "bg-indigo-50/40 border-indigo-600 ring-1 ring-indigo-500/20"
                            : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`text-xs font-bold ${active ? "text-indigo-650" : "text-slate-800"}`}>
                          {levelOpt.name}
                        </span>
                        <span className="text-[9px] text-slate-400 leading-tight">
                          {levelOpt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Customization */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold text-slate-700">Primary Theme Color</Label>
                
                {/* Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { hex: "#2563eb", name: "Royal Blue" },
                    { hex: "#1e3a8a", name: "Midnight Navy" },
                    { hex: "#059669", name: "Emerald" },
                    { hex: "#0f766e", name: "Teal" },
                    { hex: "#4f46e5", name: "Indigo" },
                    { hex: "#7c3aed", name: "Violet" },
                    { hex: "#881337", name: "Burgundy" },
                    { hex: "#e11d48", name: "Rose" },
                    { hex: "#d97706", name: "Amber" },
                    { hex: "#0f172a", name: "Charcoal" }
                  ].map((color) => {
                    const active = (data.theme?.primaryColor || "#2563eb") === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => handleThemeChange("primaryColor", color.hex)}
                        title={color.name}
                        style={{ backgroundColor: color.hex }}
                        className={`h-7 w-7 rounded-full border transition-all cursor-pointer ${
                          active 
                            ? "ring-2 ring-offset-2 ring-blue-600 scale-110 border-white" 
                            : "border-transparent hover:scale-105"
                        }`}
                      />
                    );
                  })}

                  {/* Custom Picker */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <input
                      type="color"
                      id="customColorPicker"
                      value={data.theme?.primaryColor || "#2563eb"}
                      onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                      className="h-7 w-7 rounded-full border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    />
                    <Label htmlFor="customColorPicker" className="text-[10px] font-semibold text-slate-500 cursor-pointer">
                      Custom
                    </Label>
                  </div>
                </div>
              </div>

              {/* Document Background Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                {/* Main Column Background */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Main Content Background</Label>
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { hex: "#ffffff", name: "White" },
                      { hex: "#faf8f5", name: "Warm Cream" },
                      { hex: "#f0f9ff", name: "Baby Blue" },
                      { hex: "#fdf2f8", name: "Baby Pink" },
                      { hex: "#faf5ff", name: "Lavender" },
                      { hex: "#f0fdf4", name: "Soft Mint" },
                      { hex: "#f8fafc", name: "Pale Slate" }
                    ].map((color) => {
                      const active = (data.theme?.backgroundColor || "#ffffff") === color.hex;
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => handleThemeChange("backgroundColor", color.hex)}
                          title={color.name}
                          style={{ backgroundColor: color.hex }}
                          className={`h-6 w-6 rounded-full border transition-all cursor-pointer shadow-xs ${
                            active 
                              ? "ring-2 ring-offset-1 ring-indigo-650 scale-110 border-white" 
                              : "border-slate-200 hover:scale-105"
                          }`}
                        />
                      );
                    })}

                    {/* Custom Picker */}
                    <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                      <input
                        type="color"
                        id="customBgColorPicker"
                        value={data.theme?.backgroundColor || "#ffffff"}
                        onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                        className="h-6 w-6 rounded-full border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                      />
                      <Label htmlFor="customBgColorPicker" className="text-[10px] font-semibold text-slate-500 cursor-pointer">
                        Custom
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Sidebar Background (Only visible if the template has a sidebar) */}
                {["creative", "canvacolumn", "executive"].includes(data.theme?.templateId || "modern") ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Sidebar Column Background</Label>
                    
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { hex: "", name: "Default" },
                        { hex: "#ffffff", name: "White" },
                        { hex: "#f0f9ff", name: "Baby Blue" },
                        { hex: "#fdf2f8", name: "Baby Pink" },
                        { hex: "#faf5ff", name: "Lavender" },
                        { hex: "#f0fdf4", name: "Soft Mint" },
                        { hex: "#1e293b", name: "Slate Dark" }
                      ].map((color) => {
                        const active = (data.theme?.sidebarBackgroundColor || "") === color.hex;
                        return (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => handleThemeChange("sidebarBackgroundColor", color.hex)}
                            title={color.name}
                            style={{ 
                              backgroundColor: color.hex || "#e2e8f0",
                              backgroundImage: color.hex ? "none" : "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
                              backgroundSize: color.hex ? "auto" : "8px 8px",
                              backgroundPosition: color.hex ? "0 0" : "0 0, 0 4px, 4px -4px, -4px 0px"
                            }}
                            className={`h-6 w-6 rounded-full border transition-all cursor-pointer shadow-xs ${
                              active 
                                ? "ring-2 ring-offset-1 ring-indigo-650 scale-110 border-white" 
                                : "border-slate-200 hover:scale-105"
                            }`}
                          />
                        );
                      })}

                      {/* Custom Picker */}
                      <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                        <input
                          type="color"
                          id="customSidebarBgColorPicker"
                          value={data.theme?.sidebarBackgroundColor || "#f1f5f9"}
                          onChange={(e) => handleThemeChange("sidebarBackgroundColor", e.target.value)}
                          className="h-6 w-6 rounded-full border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                        />
                        <Label htmlFor="customSidebarBgColorPicker" className="text-[10px] font-semibold text-slate-500 cursor-pointer">
                          Custom
                        </Label>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <Label className="text-xs font-bold text-slate-700">Document Typography</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="font-family" className="text-[11px] font-semibold text-slate-600">Google Font</Label>
                    <select
                      id="font-family"
                      value={isCustomGoogleFont ? "__custom" : (data.theme?.fontFamily || "Inter")}
                      onChange={(e) => {
                        if (e.target.value === "__custom") {
                          setIsCustomGoogleFont(true);
                          handleThemeChange("fontFamily", "");
                          return;
                        }
                        setIsCustomGoogleFont(false);
                        handleThemeChange("fontFamily", e.target.value);
                      }}
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Lora">Lora</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Noto Sans Khmer">Noto Sans Khmer</option>
                      <option value="__custom">Other Google Font…</option>
                    </select>
                    {isCustomGoogleFont ? (
                      <div className="space-y-1.5">
                        <Input
                          value={selectedGoogleFont}
                          onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
                          placeholder="Search Google Fonts, e.g. Roboto Condensed"
                          className="h-8 text-xs"
                          aria-label="Search Google Font family names"
                        />
                        <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1">
                          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {selectedGoogleFont ? "Matching Google Fonts" : "Khmer & Google Font Results"}
                          </p>
                          {matchingGoogleFonts.length > 0 ? matchingGoogleFonts.map((font) => (
                            <button
                              key={font}
                              type="button"
                              onClick={() => {
                                handleThemeChange("fontFamily", font);
                                setIsCustomGoogleFont(!STANDARD_GOOGLE_FONTS.includes(font));
                              }}
                              className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                              style={{ fontFamily: `"${font}", sans-serif` }}
                            >
                              {font}
                            </button>
                          )) : (
                            <p className="px-2 py-1.5 text-[11px] text-slate-400">No suggestion found. You can still use the font name you typed.</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="font-color" className="text-[11px] font-semibold text-slate-600">Text Color</Label>
                    <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2">
                      <input
                        id="font-color"
                        type="color"
                        value={data.theme?.fontColor || "#1e293b"}
                        onChange={(e) => handleThemeChange("fontColor", e.target.value)}
                        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <span className="text-xs font-medium uppercase text-slate-500">{data.theme?.fontColor || "#1e293b"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size" className="text-[11px] font-semibold text-slate-600">Font Size</Label>
                    <span className="text-xs font-bold tabular-nums text-blue-700">{data.theme?.fontSize ?? 100}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-slate-400">Small</span>
                    <input
                      id="font-size"
                      type="range"
                      min="85"
                      max="115"
                      step="5"
                      value={data.theme?.fontSize ?? 100}
                      onChange={(e) => handleThemeChange("fontSize", Number(e.target.value))}
                      className="h-1.5 flex-1 cursor-pointer accent-blue-600"
                    />
                    <span className="text-[10px] font-medium text-slate-400">Large</span>
                  </div>
                </div>
                {/* Global Section Order Panel */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-slate-700">Section Display Order</Label>
                    <span className="text-[10px] text-slate-400 font-normal">Reorder main sections</span>
                  </div>
                  {(() => {
                    const defaultSections = [
                      { id: "summary", name: data.theme?.sectionNames?.professionalSummary || "Professional Summary" },
                      { id: "experience", name: data.theme?.sectionNames?.workExperience || "Work Experience" },
                      { id: "education", name: data.theme?.sectionNames?.education || "Education" },
                      { id: "projects", name: data.theme?.sectionNames?.projects || "Projects & Courses" },
                      { id: "skills", name: data.theme?.sectionNames?.skills || "Skills" },
                      { id: "languages", name: data.theme?.sectionNames?.languages || "Languages" },
                      { id: "references", name: data.theme?.sectionNames?.references || "References" }
                    ];

                    const currentOrderKeys = data.theme?.sectionOrder && data.theme.sectionOrder.length > 0 
                      ? data.theme.sectionOrder 
                      : defaultSections.map(s => s.id);
                    
                    const orderedSections = currentOrderKeys
                      .map(key => defaultSections.find(s => s.id === key))
                      .filter(Boolean) as { id: string; name: string }[];

                    const moveSectionOrder = (index: number, direction: "up" | "down") => {
                      const newOrder = [...currentOrderKeys];
                      const targetIndex = direction === "up" ? index - 1 : index + 1;
                      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
                      const temp = newOrder[index];
                      newOrder[index] = newOrder[targetIndex];
                      newOrder[targetIndex] = temp;
                      handleThemeChange("sectionOrder", newOrder);
                    };

                    return (
                      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {orderedSections.map((sec, idx) => (
                          <div key={sec.id} className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
                            <span>{sec.name}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSectionOrder(idx, "up")}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === orderedSections.length - 1}
                                onClick={() => moveSectionOrder(idx, "down")}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Personal Information */}
          <AccordionItem value="personal" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <User className="h-4.5 w-4.5 text-blue-500" />
                Personal Information
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              {/* Profile Photo Upload */}
              <div className="space-y-4 pb-4 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                  <div className="flex items-center gap-4">
                    {data.personalInfo.photo ? (
                      <div className="relative h-20 w-16 rounded-xl border border-slate-200 overflow-hidden group">
                        <img
                          src={data.personalInfo.photo}
                          alt="Profile Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 w-16 rounded-xl border border-dashed border-slate-350 bg-slate-50/50 text-slate-400">
                        <Upload className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold text-slate-650">Profile Photo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="text-xs h-9 w-full max-w-[240px] cursor-pointer file:text-xs file:font-semibold"
                      />
                      {photoError ? (
                        <span className="text-[10px] text-rose-500 font-medium">{photoError}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Recommended: Portrait image, PNG or JPG, max 2MB.</span>
                      )}
                    </div>
                  </div>

                  {/* Aspect Ratio Picker */}
                  <div className="space-y-1.5 shrink-0">
                    <Label className="text-xs font-semibold text-slate-650 block">Photo Size (Aspect Ratio)</Label>
                    <div className="flex gap-2">
                      {([
                        { id: "3:4", label: "3x4 Portrait" },
                        { id: "4:6", label: "4x6 Portrait" }
                      ] as const).map((ratio) => {
                        const active = (data.theme?.photoAspectRatio || "3:4") === ratio.id;
                        return (
                          <button
                            key={ratio.id}
                            type="button"
                            onClick={() => handleThemeChange("photoAspectRatio", ratio.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              active
                                ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/50"
                            }`}
                          >
                            {ratio.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="photo-scale" className="text-xs font-semibold text-slate-650">
                      Portrait Size <span className="font-normal text-slate-400">(KSHRD template)</span>
                    </Label>
                    <span className="text-xs font-bold tabular-nums text-blue-700">{data.theme?.photoScale ?? 100}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-slate-400">Small</span>
                    <input
                      id="photo-scale"
                      type="range"
                      min="80"
                      max="125"
                      step="5"
                      value={data.theme?.photoScale ?? 100}
                      onChange={(e) => handleThemeChange("photoScale", Number(e.target.value))}
                      className="h-1.5 flex-1 cursor-pointer accent-blue-600"
                      aria-label="KSHRD portrait size"
                    />
                    <span className="text-[10px] font-medium text-slate-400">Large</span>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("photoScale", 100)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="logo-scale" className="text-xs font-semibold text-slate-650">
                      Logo Size <span className="font-normal text-slate-400">(KSHRD header)</span>
                    </Label>
                    <span className="text-xs font-bold tabular-nums text-blue-700">{data.theme?.logoScale ?? 100}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-slate-400">Small</span>
                    <input
                      id="logo-scale"
                      type="range"
                      min="80"
                      max="250"
                      step="10"
                      value={data.theme?.logoScale ?? 100}
                      onChange={(e) => handleThemeChange("logoScale", Number(e.target.value))}
                      className="h-1.5 flex-1 cursor-pointer accent-blue-600"
                      aria-label="KSHRD header logo size"
                    />
                    <span className="text-[10px] font-medium text-slate-400">Large</span>
                    <button
                      type="button"
                      onClick={() => handleThemeChange("logoScale", 100)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  {data.personalInfo.logo ? (
                    <div className="relative h-16 w-16 rounded-xl border border-slate-200 overflow-hidden group flex items-center justify-center bg-white p-1">
                      <img
                        src={data.personalInfo.logo}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16 w-16 rounded-xl border border-dashed border-slate-350 bg-slate-50/50 text-slate-400">
                      <Upload className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label className="text-xs font-semibold text-slate-650">Custom Header Logo</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs h-9 w-full max-w-[240px] cursor-pointer file:text-xs file:font-semibold"
                    />
                    {logoError ? (
                      <span className="text-[10px] text-rose-500 font-medium">{logoError}</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Optional: Replaces default HRD Center logo in KSHRD layout. PNG/JPG, max 2MB.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-slate-600">Full Name</Label>
                  <Input
                    id="fullName"
                    value={data.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobTitle" className="text-xs font-semibold text-slate-600">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={data.personalInfo.jobTitle}
                    onChange={(e) => handlePersonalInfoChange("jobTitle", e.target.value)}
                    placeholder="Senior Developer"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="targetRole" className="text-xs font-semibold text-slate-600">Target Role / Applied For</Label>
                  <Input
                    id="targetRole"
                    value={data.personalInfo.targetRole || ""}
                    onChange={(e) => handlePersonalInfoChange("targetRole", e.target.value)}
                    placeholder="e.g. Staff Architect"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-600">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-600">Phone Number</Label>
                  <Input
                    id="phone"
                    value={data.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs font-semibold text-slate-600">Location</Label>
                  <Input
                    id="location"
                    value={data.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                    placeholder="City, State"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs font-semibold text-slate-600">Date of Birth</Label>
                  <Input
                    id="dob"
                    value={data.personalInfo.dob || ""}
                    onChange={(e) => handlePersonalInfoChange("dob", e.target.value)}
                    placeholder="e.g. Feb 19th, 2002"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nationality" className="text-xs font-semibold text-slate-600">Nationality</Label>
                  <Input
                    id="nationality"
                    value={data.personalInfo.nationality || ""}
                    onChange={(e) => handlePersonalInfoChange("nationality", e.target.value)}
                    placeholder="e.g. Cambodian"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-slate-600">Gender / Sex</Label>
                  <Input
                    id="gender"
                    value={data.personalInfo.gender || ""}
                    onChange={(e) => handlePersonalInfoChange("gender", e.target.value)}
                    placeholder="e.g. Male"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="placeOfBirth" className="text-xs font-semibold text-slate-600">Place of Birth</Label>
                  <Input
                    id="placeOfBirth"
                    value={data.personalInfo.placeOfBirth || ""}
                    onChange={(e) => handlePersonalInfoChange("placeOfBirth", e.target.value)}
                    placeholder="e.g. Kohkong"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maritalStatus" className="text-xs font-semibold text-slate-600">Marital Status</Label>
                  <Input
                    id="maritalStatus"
                    value={data.personalInfo.maritalStatus || ""}
                    onChange={(e) => handlePersonalInfoChange("maritalStatus", e.target.value)}
                    placeholder="e.g. Single"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="health" className="text-xs font-semibold text-slate-600">Health Status</Label>
                  <Input
                    id="health"
                    value={data.personalInfo.health || ""}
                    onChange={(e) => handlePersonalInfoChange("health", e.target.value)}
                    placeholder="e.g. Excellent"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* GitHub */}
                <div className="space-y-2 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 block">
                    {parseField(data.personalInfo.github).label 
                      ? `${parseField(data.personalInfo.github).label} Profile` 
                      : "GitHub Profile"}
                  </span>
                  <div className="space-y-1.5">
                    <Label htmlFor="github-label" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Button Text / Label</Label>
                    <Input
                      id="github-label"
                      value={parseField(data.personalInfo.github).label}
                      onChange={(e) => handleLinkChange("github", e.target.value, parseField(data.personalInfo.github).url)}
                      placeholder="e.g. GitHub"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="github" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Address / Link</Label>
                    <Input
                      id="github"
                      value={parseField(data.personalInfo.github).url}
                      onChange={(e) => handleLinkChange("github", parseField(data.personalInfo.github).label, e.target.value)}
                      placeholder="github.com/username"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-2 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 block">
                    {parseField(data.personalInfo.linkedin).label 
                      ? `${parseField(data.personalInfo.linkedin).label} Profile` 
                      : "LinkedIn Profile"}
                  </span>
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin-label" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Button Text / Label</Label>
                    <Input
                      id="linkedin-label"
                      value={parseField(data.personalInfo.linkedin).label}
                      onChange={(e) => handleLinkChange("linkedin", e.target.value, parseField(data.personalInfo.linkedin).url)}
                      placeholder="e.g. LinkedIn"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Address / Link</Label>
                    <Input
                      id="linkedin"
                      value={parseField(data.personalInfo.linkedin).url}
                      onChange={(e) => handleLinkChange("linkedin", parseField(data.personalInfo.linkedin).label, e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Portfolio / Custom Link */}
                <div className="space-y-2 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 block">
                    {parseField(data.personalInfo.portfolio).label 
                      ? parseField(data.personalInfo.portfolio).label 
                      : "Portfolio / Custom Link"}
                  </span>
                  <div className="space-y-1.5">
                    <Label htmlFor="portfolio-label" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Button Text / Label</Label>
                    <Input
                      id="portfolio-label"
                      value={parseField(data.personalInfo.portfolio).label}
                      onChange={(e) => handleLinkChange("portfolio", e.target.value, parseField(data.personalInfo.portfolio).url)}
                      placeholder="e.g. Portfolio"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="portfolio" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Address / Link</Label>
                    <Input
                      id="portfolio"
                      value={parseField(data.personalInfo.portfolio).url}
                      onChange={(e) => handleLinkChange("portfolio", parseField(data.personalInfo.portfolio).label, e.target.value)}
                      placeholder="portfolio.com"
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Professional Summary */}
          <AccordionItem value="summary" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <FileText className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.professionalSummary || "Professional Summary"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-summary" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-summary"
                  value={data.theme?.sectionNames?.professionalSummary || ""}
                  onChange={(e) => updateSectionName("professionalSummary", e.target.value)}
                  placeholder="e.g. Professional Summary"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center gap-2">
                  <Label htmlFor="summaryText" className="text-xs font-semibold text-slate-600">About Me</Label>
                  {renderHighlightButton("summaryText", data.professionalSummary, handleSummaryChange)}
                </div>
                <div data-color-mode="light" className="text-xs mt-1">
                  <MDEditor
                    value={data.professionalSummary}
                    onChange={(val) => handleSummaryChange(val || "")}
                    preview="edit"
                    height={160}
                    textareaProps={{
                      placeholder: "Summarize your professional experience, key strengths, and career highlights..."
                    }}
                  />
                </div>

                {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                  <div className="flex items-center gap-2 pt-2">
                    <Label htmlFor="summary-pg" className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                    <select
                      id="summary-pg"
                      value={data.theme.summaryPage || 1}
                      onChange={(e) => handleThemeChange("summaryPage", parseInt(e.target.value) || 1)}
                      className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                    >
                      {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Work Experience */}
          <AccordionItem value="experience" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <Briefcase className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.workExperience || "Work Experience"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-experience" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-experience"
                  value={data.theme?.sectionNames?.workExperience || ""}
                  onChange={(e) => updateSectionName("workExperience", e.target.value)}
                  placeholder="e.g. Work Experience"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              {/* Professional Pitch for Entry-Level / No Experience */}
              <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/10 space-y-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="show-pitch-checkbox"
                    checked={!!data.theme?.showPitch}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      handleThemeChange("showPitch", checked);
                      // Pre-fill pitch if checking and empty
                      if (checked && !data.theme?.professionalPitch) {
                        const lang = data.theme?.language || "en";
                        const defaultPitch = lang === "km" 
                          ? translations.km.defaultPitch 
                          : translations.en.defaultPitch;
                        handleThemeChange("professionalPitch", defaultPitch);
                      }
                    }}
                    className="h-4 w-4 mt-0.5 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="show-pitch-checkbox" className="text-xs font-bold text-slate-800 cursor-pointer select-none leading-none">
                      No work experience yet?
                    </Label>
                    <span className="text-[10px] text-slate-400">Show a compelling career objective/pitch to interest HR instead.</span>
                  </div>
                </div>

                {data.theme?.showPitch ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1.5 duration-200">
                    <div className="flex justify-between items-center gap-2">
                      <Label htmlFor="pitch-text" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Career Focus & Objective Pitch</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const lang = data.theme?.language || "en";
                          const defaultPitch = lang === "km" 
                            ? translations.km.defaultPitch 
                            : translations.en.defaultPitch;
                          handleThemeChange("professionalPitch", defaultPitch);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-855 cursor-pointer hover:underline"
                      >
                        Reset to default
                      </button>
                    </div>
                    <Textarea
                      id="pitch-text"
                      rows={3}
                      value={data.theme?.professionalPitch || ""}
                      onChange={(e) => handleThemeChange("professionalPitch", e.target.value)}
                      placeholder="Write 2-3 sentences to catch recruiter interest..."
                      className="text-xs resize-none"
                    />
                    <span className="text-[9px] text-slate-400 block leading-tight">
                      This statement is highlighted on your CV in place of work experience to grab the recruiter's interest immediately.
                    </span>
                  </div>
                ) : null}
              </div>

              {data.experience.map((exp, index) => (
                <div key={exp.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveExperience(exp.id, "up")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === data.experience.length - 1}
                      onClick={() => moveExperience(exp.id, "down")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(exp.id)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry #{index + 1}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Company Name</Label>
                      <Input
                        id={`experience.${exp.id}.company`}
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                        placeholder="Company Inc."
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Position / Job Title</Label>
                      <Input
                        id={`experience.${exp.id}.position`}
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                        placeholder="Senior Software Engineer"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Start Date</Label>
                      <Input
                        id={`experience.${exp.id}.startDate`}
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        placeholder="e.g., 2021-06 or June 2021"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">End Date</Label>
                      <Input
                        id={`experience.${exp.id}.endDate`}
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        placeholder="e.g., Present or June 2023"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <Label className="text-xs font-semibold text-slate-600">Description</Label>
                      {renderHighlightButton(`exp-desc-${exp.id}`, exp.description, (val) => updateExperience(exp.id, "description", val))}
                    </div>
                    {renderActionVerbsHelper(exp.description, (val) => updateExperience(exp.id, "description", val))}
                    <div data-color-mode="light" className="text-xs mt-1">
                      <MDEditor
                        value={exp.description}
                        onChange={(val) => updateExperience(exp.id, "description", val || "")}
                        preview="edit"
                        height={160}
                        textareaProps={{
                          placeholder: "Detail your responsibilities, key projects, and achievements...",
                          id: `experience.${exp.id}.description`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`exp-pb-${exp.id}`}
                        checked={!!exp.pageBreakBefore}
                        onChange={(e) => updateExperience(exp.id, "pageBreakBefore", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor={`exp-pb-${exp.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                        Force page break before this item
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`exp-hl-${exp.id}`}
                        checked={!!exp.highlight}
                        onChange={(e) => updateExperience(exp.id, "highlight", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor={`exp-hl-${exp.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                        Highlight date/duration
                      </Label>
                    </div>

                    {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`exp-pg-${exp.id}`} className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                        <select
                          id={`exp-pg-${exp.id}`}
                          value={exp.page || 1}
                          onChange={(e) => updateExperience(exp.id, "page", parseInt(e.target.value) || 1)}
                          className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                        >
                          {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addExperience}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold border-dashed border-slate-350 hover:bg-slate-50 text-slate-600"
              >
                <Plus className="h-4 w-4" />
                Add Experience
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <GraduationCap className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.education || "Education"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-education" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-education"
                  value={data.theme?.sectionNames?.education || ""}
                  onChange={(e) => updateSectionName("education", e.target.value)}
                  placeholder="e.g. Education"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              {data.education.map((edu, index) => (
                <div key={edu.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveEducation(edu.id, "up")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === data.education.length - 1}
                      onClick={() => moveEducation(edu.id, "down")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry #{index + 1}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">School / University</Label>
                      <Input
                        id={`education.${edu.id}.school`}
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                        placeholder="University Name"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Major / Degree</Label>
                      <Input
                        id={`education.${edu.id}.major`}
                        value={edu.major}
                        onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                        placeholder="B.S. in Computer Science"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Start Date</Label>
                      <Input
                        id={`education.${edu.id}.startDate`}
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                        placeholder="e.g., 2016-09"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">End Date</Label>
                      <Input
                        id={`education.${edu.id}.endDate`}
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                        placeholder="e.g., 2020-05"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <Label className="text-xs font-semibold text-slate-600">Additional Description</Label>
                      {renderHighlightButton(`edu-desc-${edu.id}`, edu.description, (val) => updateEducation(edu.id, "description", val))}
                    </div>
                    <div data-color-mode="light" className="text-xs mt-1">
                      <MDEditor
                        value={edu.description}
                        onChange={(val) => updateEducation(edu.id, "description", val || "")}
                        preview="edit"
                        height={140}
                        textareaProps={{
                          placeholder: "Graduated with honors, GPA, key courses...",
                          id: `education.${edu.id}.description`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edu-pb-${edu.id}`}
                        checked={!!edu.pageBreakBefore}
                        onChange={(e) => updateEducation(edu.id, "pageBreakBefore", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor={`edu-pb-${edu.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                        Force page break before this item
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edu-hl-${edu.id}`}
                        checked={!!edu.highlight}
                        onChange={(e) => updateEducation(edu.id, "highlight", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor={`edu-hl-${edu.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                        Highlight date/duration
                      </Label>
                    </div>

                    {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`edu-pg-${edu.id}`} className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                        <select
                          id={`edu-pg-${edu.id}`}
                          value={edu.page || 1}
                          onChange={(e) => updateEducation(edu.id, "page", parseInt(e.target.value) || 1)}
                          className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                        >
                          {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold border-dashed border-slate-350 hover:bg-slate-50 text-slate-600"
              >
                <Plus className="h-4 w-4" />
                Add Education
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Projects */}
          <AccordionItem value="projects" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <FolderGit2 className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.projects || "Projects & Courses"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-projects" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-projects"
                  value={data.theme?.sectionNames?.projects || ""}
                  onChange={(e) => updateSectionName("projects", e.target.value)}
                  placeholder="e.g. Projects & Courses"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              {data.projects.map((proj, index) => (
                <div key={proj.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveProject(proj.id, "up")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === data.projects.length - 1}
                      onClick={() => moveProject(proj.id, "down")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(proj.id)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry #{index + 1}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Project Name</Label>
                      <Input
                        id={`projects.${proj.id}.name`}
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                        placeholder="E-commerce Web App"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Project Link</Label>
                      <Input
                        id={`projects.${proj.id}.link`}
                        value={proj.link}
                        onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                        placeholder="github.com/yourusername/project"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600">Technologies Used</Label>
                    <Input
                      id={`projects.${proj.id}.technologies`}
                      value={proj.technologies}
                      onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                      placeholder="Next.js, Tailwind CSS, TypeScript"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600">Description</Label>
                    {renderActionVerbsHelper(proj.description, (val) => updateProject(proj.id, "description", val))}
                    <div data-color-mode="light" className="text-xs mt-1">
                      <MDEditor
                        value={proj.description}
                        onChange={(val) => updateProject(proj.id, "description", val || "")}
                        preview="edit"
                        height={140}
                        textareaProps={{
                          placeholder: "Explain what you built, what challenge you resolved, and final results...",
                          id: `projects.${proj.id}.description`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`proj-pb-${proj.id}`}
                        checked={!!proj.pageBreakBefore}
                        onChange={(e) => updateProject(proj.id, "pageBreakBefore", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor={`proj-pb-${proj.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                        Force page break before this item
                      </Label>
                    </div>

                    {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`proj-pg-${proj.id}`} className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                        <select
                          id={`proj-pg-${proj.id}`}
                          value={proj.page || 1}
                          onChange={(e) => updateProject(proj.id, "page", parseInt(e.target.value) || 1)}
                          className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                        >
                          {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addProject}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold border-dashed border-slate-350 hover:bg-slate-50 text-slate-600"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <Award className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.skills || "Skills"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-skills" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-skills"
                  value={data.theme?.sectionNames?.skills || ""}
                  onChange={(e) => updateSectionName("skills", e.target.value)}
                  placeholder="e.g. Skills"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. Next.js, Docker, Webpack"
                  className="h-9 text-xs flex-1"
                />
                <Button type="submit" size="sm" className="h-9 text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium">
                  Add Skill
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {data.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border-none font-semibold transition-colors"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {data.skills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No skills added yet.</p>
                )}
              </div>

              {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                  <Label htmlFor="skills-pg" className="text-xs font-semibold text-slate-500">Show Skills on Page:</Label>
                  <select
                    id="skills-pg"
                    value={data.theme.skillsPage || 1}
                    onChange={(e) => handleThemeChange("skillsPage", parseInt(e.target.value) || 1)}
                    className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                  >
                    {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>

          {/* Languages */}
          <AccordionItem value="languages" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <Languages className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.languages || "Languages"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-languages" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-languages"
                  value={data.theme?.sectionNames?.languages || ""}
                  onChange={(e) => updateSectionName("languages", e.target.value)}
                  placeholder="e.g. Languages"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              {data.languages.map((lang, index) => (
                <div key={lang.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveLanguage(lang.id, "up")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === data.languages.length - 1}
                      onClick={() => moveLanguage(lang.id, "down")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLanguage(lang.id)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Language #{index + 1}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Language Name</Label>
                      <Input
                        id={`languages.${lang.id}.name`}
                        value={lang.name}
                        onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                        placeholder="e.g. English, French"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Proficiency Level</Label>
                      <Input
                        id={`languages.${lang.id}.level`}
                        value={lang.level}
                        onChange={(e) => updateLanguage(lang.id, "level", e.target.value)}
                        placeholder="e.g. Native, Bilingual, Fluent, Basic"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                    <div className="flex items-center gap-2 pt-1">
                      <Label htmlFor={`lang-pg-${lang.id}`} className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                      <select
                        id={`lang-pg-${lang.id}`}
                        value={lang.page || 1}
                        onChange={(e) => updateLanguage(lang.id, "page", parseInt(e.target.value) || 1)}
                        className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                      >
                        {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addLanguage}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold border-dashed border-slate-350 hover:bg-slate-50 text-slate-600"
              >
                <Plus className="h-4 w-4" />
                Add Language
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* References */}
          <AccordionItem value="references" className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm">
                <UserCheck className="h-4.5 w-4.5 text-blue-500" />
                {data.theme?.sectionNames?.references || "References"}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Label htmlFor="rename-references" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Rename Section</Label>
                <Input
                  id="rename-references"
                  value={data.theme?.sectionNames?.references || ""}
                  onChange={(e) => updateSectionName("references", e.target.value)}
                  placeholder="e.g. References"
                  className="h-8 text-xs bg-white max-w-[200px]"
                />
              </div>
              {(data.references || []).map((ref, index) => (
                <div key={ref.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveReference(ref.id, "up")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === (data.references || []).length - 1}
                      onClick={() => moveReference(ref.id, "down")}
                      className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeReference(ref.id)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference #{index + 1}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Reference Name</Label>
                      <Input
                        id={`references.${ref.id}.name`}
                        value={ref.name}
                        onChange={(e) => updateReference(ref.id, "name", e.target.value)}
                        placeholder="John Doe"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Relationship</Label>
                      <Input
                        id={`references.${ref.id}.relationship`}
                        value={ref.relationship}
                        onChange={(e) => updateReference(ref.id, "relationship", e.target.value)}
                        placeholder="e.g. Former Manager, Mentor"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-1">
                      <Label className="text-xs font-semibold text-slate-600">Company</Label>
                      <Input
                        id={`references.${ref.id}.company`}
                        value={ref.company}
                        onChange={(e) => updateReference(ref.id, "company", e.target.value)}
                        placeholder="e.g. Stripe"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Email</Label>
                      <Input
                        id={`references.${ref.id}.email`}
                        value={ref.email}
                        onChange={(e) => updateReference(ref.id, "email", e.target.value)}
                        placeholder="john.doe@company.com"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Phone</Label>
                      <Input
                        id={`references.${ref.id}.phone`}
                        value={ref.phone}
                        onChange={(e) => updateReference(ref.id, "phone", e.target.value)}
                        placeholder="+1 (555) 012-3456"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`ref-pb-${ref.id}`}
                        checked={!!ref.pageBreakBefore}
                        onChange={(e) => updateReference(ref.id, "pageBreakBefore", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Label htmlFor={`ref-pb-${ref.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                        Force page break before this item
                      </Label>
                    </div>

                    {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`ref-pg-${ref.id}`} className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                        <select
                          id={`ref-pg-${ref.id}`}
                          value={ref.page || 1}
                          onChange={(e) => updateReference(ref.id, "page", parseInt(e.target.value) || 1)}
                          className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                        >
                          {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addReference}
                className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold border-dashed border-slate-350 hover:bg-slate-50 text-slate-600"
              >
                <Plus className="h-4 w-4" />
                Add Reference
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Dynamic Custom Sections */}
          {(data.customSections || []).map((sec) => (
            <AccordionItem
              key={sec.id}
              value={`customSections.${sec.id}`}
              className="border border-slate-200 rounded-xl px-4 py-1 bg-white shadow-none"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm w-full">
                  <Award className="h-4.5 w-4.5 text-indigo-550 shrink-0" />
                  <span className="flex-1 text-left">{sec.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete the whole "${sec.name}" section?`)) {
                        removeCustomSection(sec.id);
                      }
                    }}
                    className="mr-2 text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-md print:hidden text-xs flex items-center gap-1 cursor-pointer font-bold"
                    title="Delete entire section"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete Section</span>
                  </button>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 space-y-4">
                <div className="space-y-1.5 pb-2 border-b border-slate-100">
                  <Label className="text-xs font-semibold text-slate-600">Section Title</Label>
                  <Input
                    value={sec.name}
                    onChange={(e) => updateCustomSectionName(sec.id, e.target.value)}
                    placeholder="e.g. Courses, Achievements"
                    className="h-9 text-xs font-bold text-slate-800 bg-slate-50/50"
                  />
                </div>

                {sec.items.map((item, index) => (
                  <div key={item.id} className="relative p-4 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4 animate-in fade-in slide-in-from-top-1.5 duration-200">
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveCustomSectionItem(sec.id, item.id, "up")}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === sec.items.length - 1}
                        onClick={() => moveCustomSectionItem(sec.id, item.id, "down")}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomSectionItem(sec.id, item.id)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry #{index + 1}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600">Title / Name</Label>
                        <Input
                          id={`customSections.${sec.id}.${item.id}.title`}
                          value={item.title}
                          onChange={(e) => updateCustomSectionItem(sec.id, item.id, "title", e.target.value)}
                          placeholder="e.g. Course or Award Name"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600">Subtitle / Institution / Issuer</Label>
                        <Input
                          id={`customSections.${sec.id}.${item.id}.subtitle`}
                          value={item.subtitle || ""}
                          onChange={(e) => updateCustomSectionItem(sec.id, item.id, "subtitle", e.target.value)}
                          placeholder="e.g. Stanford University, AWS"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600">Start Date / Issue Date</Label>
                        <Input
                          id={`customSections.${sec.id}.${item.id}.startDate`}
                          value={item.startDate || ""}
                          onChange={(e) => updateCustomSectionItem(sec.id, item.id, "startDate", e.target.value)}
                          placeholder="e.g. 2023-01 or Jan 2023"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600">End Date / Expiry Date</Label>
                        <Input
                          id={`customSections.${sec.id}.${item.id}.endDate`}
                          value={item.endDate || ""}
                          onChange={(e) => updateCustomSectionItem(sec.id, item.id, "endDate", e.target.value)}
                          placeholder="e.g. 2023-06 or Present"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs font-semibold text-slate-600">Description</Label>
                        {renderHighlightButton(`csec-desc-${item.id}`, item.description || "", (val) => updateCustomSectionItem(sec.id, item.id, "description", val))}
                      </div>
                      <div data-color-mode="light" className="text-xs mt-1">
                        <MDEditor
                          value={item.description || ""}
                          onChange={(val) => updateCustomSectionItem(sec.id, item.id, "description", val || "")}
                          preview="edit"
                          height={140}
                          textareaProps={{
                            placeholder: "Detail your key takeaways, learnings, or achievement context...",
                            id: `customSections.${sec.id}.${item.id}.description`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`csec-pb-${item.id}`}
                          checked={!!item.pageBreakBefore}
                          onChange={(e) => updateCustomSectionItem(sec.id, item.id, "pageBreakBefore", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <Label htmlFor={`csec-pb-${item.id}`} className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                          Force page break before this item
                        </Label>
                      </div>

                      {data.theme?.pagesCount && data.theme.pagesCount > 1 ? (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`csec-pg-${item.id}`} className="text-xs font-semibold text-slate-500">Show on Page:</Label>
                          <select
                            id={`csec-pg-${item.id}`}
                            value={item.page || 1}
                            onChange={(e) => updateCustomSectionItem(sec.id, item.id, "page", parseInt(e.target.value) || 1)}
                            className="h-7 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs focus-visible:outline-none cursor-pointer font-semibold text-slate-650"
                          >
                            {Array.from({ length: data.theme.pagesCount }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>Page {i + 1}</option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCustomSectionItem(sec.id)}
                  className="w-full flex items-center justify-center gap-2 h-9 text-xs font-semibold border-dashed border-slate-350 hover:bg-slate-50 text-slate-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}

        </Accordion>

        {/* Add Section Controls */}
        <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/30 space-y-3 print:hidden mt-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-700">Add More CV Sections</span>
            <span className="text-[10px] text-slate-400">Expand your resume with custom subsections tailored to your background.</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Courses", label: "Courses" },
              { name: "Certifications", label: "Certifications" },
              { name: "Achievements & Awards", label: "Awards" },
              { name: "Volunteer Experience", label: "Volunteer" },
              { name: "Publications", label: "Publications" }
            ].map((s) => {
              const exists = (data.customSections || []).some((sec) => sec.name === s.name);
              return (
                <Button
                  key={s.name}
                  type="button"
                  variant="outline"
                  disabled={exists}
                  onClick={() => addCustomSection(s.name)}
                  className="h-8 px-2.5 text-[11px] font-semibold border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {s.label}
                </Button>
              );
            })}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const name = prompt("Enter the name of your custom section (e.g. Activities, Publications):");
                if (name && name.trim()) {
                  addCustomSection(name.trim());
                }
              }}
              className="h-8 px-2.5 text-[11px] font-semibold border-indigo-200 bg-indigo-50/20 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer"
            >
              <Plus className="h-3 w-3 mr-1" />
              Custom Section...
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
