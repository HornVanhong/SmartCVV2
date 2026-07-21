import React, { useEffect, useState } from "react";
import { CVData } from "@/types/cv";
import { CVTemplateModern } from "@/components/CVTemplateModern";
import { CVTemplateMinimalist } from "@/components/CVTemplateMinimalist";
import { CVTemplateCreative } from "@/components/CVTemplateCreative";
import { CVTemplateProfessional } from "@/components/CVTemplateProfessional";
import { CVTemplateElegant } from "@/components/CVTemplateElegant";
import { CVTemplateExecutive } from "@/components/CVTemplateExecutive";
import { CVTemplateFancyGrid } from "@/components/CVTemplateFancyGrid";
import { CVTemplateSimpleLeft } from "@/components/CVTemplateSimpleLeft";
import { CVTemplateTimeline } from "@/components/CVTemplateTimeline";
import { CVTemplatePortfolio } from "@/components/CVTemplatePortfolio";
import { CVTemplateCanvaColumn } from "@/components/CVTemplateCanvaColumn";
import { CVTemplateKSHRD } from "@/components/CVTemplateKSHRD";
import { getPageData, duplicatePageContent, deletePageContent } from "@/lib/page-utils";
import { renderMarkdownHTML } from "@/lib/utils";
import { Copy, Trash2, Plus, ChevronUp, ChevronDown, Eye, Lock, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const calculateAtsScore = (cv: CVData) => {
  let score = 0;
  const tips: string[] = [];

  if (cv.personalInfo?.fullName) score += 5;
  else tips.push("Add your full name");

  if (cv.personalInfo?.email) score += 5;
  else tips.push("Add an email address");

  if (cv.personalInfo?.phone) score += 5;
  else tips.push("Add a phone number");

  if (cv.personalInfo?.location) score += 5;
  else tips.push("Add your location (City, Country)");

  if (cv.personalInfo?.github || cv.personalInfo?.linkedin || cv.personalInfo?.portfolio) score += 5;
  else tips.push("Add a LinkedIn or GitHub profile link");

  const summary = cv.professionalSummary?.trim() || "";
  if (summary.length >= 120) {
    score += 20;
  } else if (summary.length > 30) {
    score += 10;
    tips.push("Expand your Professional Summary (aim for 2-3 sentences)");
  } else {
    tips.push("Write a Professional Summary detailing your background");
  }

  const hasExp = (cv.experience || []).length > 0;
  const hasProjects = (cv.projects || []).length > 0;
  if (hasExp || hasProjects) {
    score += 15;
    const allText = [...(cv.experience || []).map(e => e.description), ...(cv.projects || []).map(p => p.description)].join(" ");
    if (/\b(managed|built|led|developed|created|increased|reduced|improved|achieved|architected|spearheaded|\d+%|\$\d+)\b/i.test(allText)) {
      score += 15;
    } else {
      tips.push("Add action verbs (e.g., Led, Developed) and quantifiable numbers/percentages in experience");
    }
  } else {
    tips.push("Add at least one Work Experience or Project entry");
  }

  if ((cv.education || []).length > 0) {
    score += 15;
  } else {
    tips.push("Add your academic background under Education");
  }

  const skillsCount = (cv.skills || []).length;
  if (skillsCount >= 4) {
    score += 10;
  } else if (skillsCount > 0) {
    score += 5;
    tips.push("Add at least 4 skills for ATS keyword matching");
  } else {
    tips.push("Add core professional or technical skills");
  }

  return { score: Math.min(100, score), tips };
};

const CVTemplateWhite: React.FC<{ data: CVData }> = ({ data }) => {
  const { education, experience, projects, languages, references, skills, theme, customSections } = data;
  const primaryColor = theme?.primaryColor || "#2563eb";

  const isEmpty = !data.professionalSummary && 
    (!education || education.length === 0) &&
    (!experience || experience.length === 0) &&
    (!projects || projects.length === 0) &&
    (!languages || languages.length === 0) &&
    (!references || references.length === 0) &&
    (!skills || skills.length === 0) &&
    (!customSections || customSections.length === 0);

  if (isEmpty) {
    return <div className="bg-white min-h-[inherit]" />;
  }

  return (
    <div className="p-8 sm:p-10 bg-white flex flex-col gap-6 text-slate-800 font-sans min-h-[inherit]">
      {data.professionalSummary && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            About Me
          </h3>
          {renderMarkdownHTML(data.professionalSummary, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            Work Experience
          </h3>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                  <span className="text-slate-850 font-bold">{exp.position}</span>
                  <span className="text-slate-500 font-medium text-[11px]">{exp.startDate} - {exp.endDate || "Present"}</span>
                </div>
                <div className="text-xs font-semibold text-slate-600">{exp.company}</div>
                {exp.description && <div className="mt-0.5">{renderMarkdownHTML(exp.description, "text-xs text-slate-500 mt-1")}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            Education
          </h3>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                  <span className="text-slate-850 font-bold">{edu.major}</span>
                  <span className="text-slate-500 font-medium text-[11px]">{edu.startDate} - {edu.endDate || "Present"}</span>
                </div>
                <div className="text-xs font-semibold text-slate-600">{edu.school}</div>
                {edu.description && <div className="mt-0.5">{renderMarkdownHTML(edu.description, "text-xs text-slate-500 mt-1")}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            Projects
          </h3>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                  <span className="text-slate-855 font-bold">{proj.name}</span>
                  {proj.link && <span className="text-blue-600 text-xs">{proj.link}</span>}
                </div>
                {proj.technologies && <div className="text-[10px] font-semibold text-slate-500">Tech: {proj.technologies}</div>}
                {proj.description && <div className="mt-0.5">{renderMarkdownHTML(proj.description, "text-xs text-slate-500 mt-1")}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && skills.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            Skills
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {skills.map((skill, index) => (
              <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {languages && languages.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            Languages
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            {languages.map((langItem) => (
              <div key={langItem.id} className="flex justify-between border-b pb-1 border-slate-100">
                <span className="font-semibold">{langItem.name}</span>
                <span className="text-slate-500">{langItem.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {references && references.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            References
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {references.map((ref) => (
              <div key={ref.id} className="text-xs text-slate-755 space-y-0.5">
                <p className="font-bold text-slate-800">{ref.name}</p>
                <p>{ref.relationship} {ref.company ? `@ ${ref.company}` : ""}</p>
                {ref.email && <p>Email: {ref.email}</p>}
                {ref.phone && <p>Tel: {ref.phone}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Custom Sections */}
      {customSections && customSections.map((sec) => (
        <section key={sec.id} className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1 border-slate-200" style={{ color: primaryColor }}>
            {sec.name}
          </h3>
          <div className="space-y-4">
            {sec.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                  <span className="text-slate-850 font-bold">{item.title || "Untitled Entry"}</span>
                  <span className="text-slate-500 font-medium text-[11px]">{item.startDate} {item.endDate ? `- ${item.endDate}` : ""}</span>
                </div>
                {item.subtitle && <div className="text-xs font-semibold text-slate-600">{item.subtitle}</div>}
                {item.description && <div className="mt-0.5">{renderMarkdownHTML(item.description, "text-xs text-slate-500 mt-1")}</div>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const documentTypographyStyle = (data: CVData): React.CSSProperties & Record<"--cv-font-family" | "--cv-font-scale" | "--cv-font-color", string> => ({
  "--cv-font-family": `"${(data.theme?.fontFamily || "Inter").replace(/["';{}]/g, "")}", sans-serif`,
  "--cv-font-scale": String(Math.min(115, Math.max(85, data.theme?.fontSize ?? 100)) / 100),
  "--cv-font-color": data.theme?.fontColor || "#1e293b",
});

const GoogleFontLoader: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  useEffect(() => {
    const safeFontFamily = fontFamily.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
    if (!safeFontFamily) return;

    const linkId = "smart-cv-selected-google-font";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(safeFontFamily)}&display=swap`;
  }, [fontFamily]);

  return null;
};

interface CVPreviewProps {
  data: CVData;
  onChange?: (newData: CVData) => void;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ data, onChange }) => {
  const templateId = data.theme?.templateId || "modern";
  const pagesCount = data.theme?.pagesCount || 1;

  const handleAddPage = () => {
    if (!onChange) return;
    const oldLayouts = data.theme?.pageLayouts || Array.from({ length: pagesCount }).map(() => templateId);
    onChange({
      ...data,
      theme: {
        ...data.theme,
        templateId,
        primaryColor: data.theme?.primaryColor || "#2563eb",
        pagesCount: pagesCount + 1,
        pageLayouts: [...oldLayouts, "white"],
      }
    });
  };

  const handleDuplicatePage = (pageNumber: number) => {
    if (!onChange) return;
    onChange(duplicatePageContent(data, pageNumber));
  };

  const handleDeletePage = (pageNumber: number) => {
    if (!onChange) return;
    onChange(deletePageContent(data, pageNumber));
  };

  const handleMovePage = (pageNumber: number, direction: "up" | "down") => {
    if (!onChange) return;
    const targetPage = direction === "up" ? pageNumber - 1 : pageNumber + 1;
    if (targetPage < 1 || targetPage > pagesCount) return;

    const swapPages = (page?: number) => {
      const p = page || 1;
      if (p === pageNumber) return targetPage;
      if (p === targetPage) return pageNumber;
      return p;
    };

    const oldLayouts = data.theme?.pageLayouts || Array.from({ length: pagesCount }).map(() => templateId);
    const newLayouts = [...oldLayouts];
    const temp = newLayouts[pageNumber - 1];
    newLayouts[pageNumber - 1] = newLayouts[targetPage - 1];
    newLayouts[targetPage - 1] = temp;

    onChange({
      ...data,
      education: data.education.map(edu => ({ ...edu, page: swapPages(edu.page) })),
      experience: data.experience.map(exp => ({ ...exp, page: swapPages(exp.page) })),
      projects: data.projects.map(proj => ({ ...proj, page: swapPages(proj.page) })),
      languages: data.languages.map(lang => ({ ...lang, page: swapPages(lang.page) })),
      references: (data.references || []).map(ref => ({ ...ref, page: swapPages(ref.page) })),
      theme: {
        ...data.theme,
        templateId,
        primaryColor: data.theme?.primaryColor || "#2563eb",
        summaryPage: (data.theme?.summaryPage || 1) === pageNumber ? targetPage : ((data.theme?.summaryPage || 1) === targetPage ? pageNumber : data.theme?.summaryPage),
        skillsPage: (data.theme?.skillsPage || 1) === pageNumber ? targetPage : ((data.theme?.skillsPage || 1) === targetPage ? pageNumber : data.theme?.skillsPage),
        pageLayouts: newLayouts,
      }
    });
  };

  const renderTemplateForPage = (pageData: CVData, layoutId: string, pageNumber: number) => {
    switch (layoutId) {
      case "white":
        return <CVTemplateWhite data={pageData} />;
      case "minimalist":
        return <CVTemplateMinimalist data={pageData} />;
      case "creative":
        return <CVTemplateCreative data={pageData} />;
      case "professional":
        return <CVTemplateProfessional data={pageData} />;
      case "elegant":
        return <CVTemplateElegant data={pageData} />;
      case "executive":
        return <CVTemplateExecutive data={pageData} />;
      case "fancygrid":
        return <CVTemplateFancyGrid data={pageData} />;
      case "simpleleft":
        return <CVTemplateSimpleLeft data={pageData} />;
      case "timeline":
        return <CVTemplateTimeline data={pageData} />;
      case "portfolio":
        return <CVTemplatePortfolio data={pageData} />;
      case "canvacolumn":
        return <CVTemplateCanvaColumn data={pageData} />;
      case "kshrd":
        return <CVTemplateKSHRD data={pageData} pageNumber={pageNumber} />;
      case "modern":
      default:
        return <CVTemplateModern data={pageData} />;
    }
  };

  const [showAtsTips, setShowAtsTips] = useState(false);
  const { score: atsScore, tips: atsTips } = calculateAtsScore(data);

  return (
    <div className="w-full h-full flex flex-col select-none">
      <GoogleFontLoader fontFamily={data.theme?.fontFamily || "Inter"} />
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-3.5 border-b border-slate-200 bg-slate-50/50 rounded-t-xl shrink-0 relative">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-700">Live Preview ({pagesCount} Page{pagesCount > 1 ? "s" : ""})</span>
        </div>

        {/* ATS Score Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAtsTips(!showAtsTips)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                atsScore >= 80
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : atsScore >= 50
                  ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                  : "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>ATS Score: {atsScore}%</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showAtsTips ? "rotate-180" : ""}`} />
            </button>

            {/* ATS Feedback Tips Popover */}
            {showAtsTips && (
              <div className="absolute right-0 top-9 z-30 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    ATS Optimization
                  </span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    atsScore >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {atsScore >= 80 ? "Excellent" : atsScore >= 50 ? "Good" : "Needs Work"}
                  </span>
                </div>

                {atsTips.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold py-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Your resume is fully optimized for ATS filters!</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Suggestions ({atsTips.length})</span>
                    {atsTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
            A4 Standard Layout
          </span>
        </div>
      </div>

      {/* Preview Canvas Container */}
      <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-y-auto flex flex-col items-center gap-6 min-h-[500px]">
        {Array.from({ length: pagesCount }).map((_, idx) => {
          const pageNumber = idx + 1;
          const pageData = getPageData(data, pageNumber);
          const pageLayout = data.theme?.pageLayouts?.[idx] || templateId;

          return (
            <div key={pageNumber} className="w-full max-w-[800px] flex flex-col items-center">
              {/* Canva-style page action header */}
              <div className="w-full bg-white shadow-xs border border-slate-200/80 rounded-t-lg px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-bold tracking-tight select-none print:hidden">
                <span className="text-slate-700">Page {pageNumber} of {pagesCount}</span>
                
                <div className="flex items-center gap-3">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMovePage(pageNumber, "up")}
                    disabled={pageNumber === 1}
                    className="hover:text-slate-900 cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
                    title="Move page up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  {/* Move Down */}
                  <button
                    onClick={() => handleMovePage(pageNumber, "down")}
                    disabled={pageNumber === pagesCount}
                    className="hover:text-slate-900 cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
                    title="Move page down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {/* Lock Indicator (Canva aesthetic) */}
                  <span className="text-slate-300 hover:text-slate-500 cursor-pointer" title="Lock page">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  {/* Hide Indicator (Canva aesthetic) */}
                  <span className="text-slate-300 hover:text-slate-500 cursor-pointer" title="Hide page">
                    <Eye className="h-3.5 w-3.5" />
                  </span>
                  {/* Duplicate Page */}
                  <button
                    onClick={() => handleDuplicatePage(pageNumber)}
                    className="hover:text-slate-900 cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Duplicate page"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Duplicate</span>
                  </button>
                  {/* Delete Page */}
                  <button
                    onClick={() => handleDeletePage(pageNumber)}
                    disabled={pagesCount <= 1}
                    className="text-rose-500 hover:text-rose-700 disabled:text-slate-300 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 text-[11px]"
                    title="Delete page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* A4 Sheet Mock */}
              <div
                className="cv-typography w-full shadow-md hover:shadow-lg transition-shadow border-x border-b border-slate-200/80 rounded-b-sm overflow-hidden min-h-[auto] lg:min-h-[29.7cm] print:min-h-[29.7cm] flex flex-col"
                style={{
                  ...documentTypographyStyle(pageData),
                  backgroundColor: pageData.theme?.backgroundColor || "#ffffff"
                }}
              >
                {renderTemplateForPage(pageData, pageLayout, pageNumber)}
              </div>
            </div>
          );
        })}

        {/* Add Page Button */}
        <Button
          onClick={handleAddPage}
          className="w-full max-w-[800px] border border-dashed border-slate-300 text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-700 py-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs font-semibold text-xs shrink-0 print:hidden"
        >
          <Plus className="h-4 w-4" />
          <span>Add Page</span>
        </Button>
      </div>
    </div>
  );
};
