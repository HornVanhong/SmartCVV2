import React from "react";
import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { t } from "@/lib/translations";
import { formatUrl, getLinkLabel, isLightColor, renderMarkdownHTML } from "@/lib/utils";

interface CVTemplateCanvaColumnProps {
  data: CVData;
}

// Extract rating levels from skill titles
const parseSkill = (skill: string) => {
  const regex = /(.*?)\s*[-:(]\s*(expert|advanced|intermediate|basic|beginner|\d+\/\d+|\d+%|\d)\s*\)?$/i;
  const match = skill.match(regex);
  if (match) {
    const name = match[1].trim();
    const levelStr = match[2].trim().toLowerCase();
    
    let dots = 4; // default
    if (levelStr === "expert" || levelStr === "5" || levelStr.includes("5/5") || levelStr.includes("100%")) {
      dots = 5;
    } else if (levelStr === "advanced" || levelStr === "4" || levelStr.includes("4/5") || levelStr.includes("80%")) {
      dots = 4;
    } else if (levelStr === "intermediate" || levelStr === "3" || levelStr.includes("3/5") || levelStr.includes("60%")) {
      dots = 3;
    } else if (levelStr === "basic" || levelStr === "2" || levelStr.includes("2/5") || levelStr.includes("40%")) {
      dots = 2;
    } else if (levelStr === "beginner" || levelStr === "1" || levelStr.includes("1/5") || levelStr.includes("20%")) {
      dots = 1;
    } else if (levelStr.includes("%")) {
      const pct = parseInt(levelStr);
      dots = Math.round((pct / 100) * 5);
    } else if (levelStr.includes("/")) {
      const parts = levelStr.split("/");
      const val = parseFloat(parts[0]);
      const total = parseFloat(parts[1]);
      dots = Math.round((val / total) * 5);
    }
    return { name, dots: Math.min(5, Math.max(1, dots)) };
  }
  return { name: skill, dots: 4 }; // default 4 dots
};

// Parse language levels to progress percentages
const parseLanguageLevel = (level: string): number => {
  const cleanLevel = level.trim().toLowerCase();
  if (cleanLevel.includes("native") || cleanLevel.includes("5/5") || cleanLevel.includes("100%") || cleanLevel === "c2") {
    return 100;
  }
  if (cleanLevel.includes("fluent") || cleanLevel.includes("professional") || cleanLevel.includes("4/5") || cleanLevel.includes("80%") || cleanLevel === "c1") {
    return 85;
  }
  if (cleanLevel.includes("upper intermediate") || cleanLevel.includes("b2")) {
    return 75;
  }
  if (cleanLevel.includes("intermediate") || cleanLevel.includes("3/5") || cleanLevel.includes("60%") || cleanLevel === "b1") {
    return 60;
  }
  if (cleanLevel.includes("elementary") || cleanLevel.includes("basic") || cleanLevel.includes("2/5") || cleanLevel.includes("40%") || cleanLevel === "a2") {
    return 40;
  }
  if (cleanLevel.includes("beginner") || cleanLevel.includes("1/5") || cleanLevel.includes("20%") || cleanLevel === "a1") {
    return 20;
  }
  if (cleanLevel.includes("%")) {
    return parseInt(cleanLevel) || 80;
  }
  if (cleanLevel.includes("/")) {
    const parts = cleanLevel.split("/");
    const val = parseFloat(parts[0]);
    const total = parseFloat(parts[1]);
    return Math.round((val / total) * 100) || 80;
  }
  return 80; // default to 80% if unspecified
};

export const CVTemplateCanvaColumn = React.forwardRef<HTMLDivElement, CVTemplateCanvaColumnProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, experience, languages, references, projects } = data;
    
    // Default Navy blue color from Canva palette if not configured
    const primaryColor = data.theme?.primaryColor && data.theme.primaryColor !== "#2563eb" 
      ? data.theme.primaryColor 
      : "#0f2954";
    
    // Top banner header color (desaturated lighter steel blue)
    const bannerColor = data.theme?.primaryColor && data.theme.primaryColor !== "#2563eb"
      ? `${data.theme.primaryColor}dd` // slightly transparent/lighter shade of custom color
      : "#3f5c80"; // default steel blue
      
    const lang = data.theme?.language || "en";

    const sidebarBg = data.theme?.sidebarBackgroundColor || primaryColor;
    const isLight = isLightColor(sidebarBg);
    const textNameClass = isLight ? "text-slate-900" : "text-white";
    const textBodyClass = isLight ? "text-slate-700" : "text-white/90";
    const textMutedClass = isLight ? "text-slate-500" : "text-white/60";
    const borderClass = isLight ? "border-slate-300" : "border-white/20";
    const iconColor = isLight ? primaryColor : "#ffffff";

    return (
      <div
        ref={ref}
        className="w-full text-slate-800 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col sm:flex-row print:flex-row"
        style={{ boxSizing: "border-box" }}
      >
        {/* Left Sidebar */}
        <aside 
          className="w-full sm:w-[280px] print:w-[260px] p-6 sm:p-8 print:p-8 flex flex-col gap-6 shrink-0" 
          style={{ backgroundColor: sidebarBg }}
        >
          {/* Circular Photo with border */}
          {personalInfo.photo && (
            <div className={`mx-auto rounded-full overflow-hidden border-4 shadow-md h-32 w-32 shrink-0 ${isLight ? "border-slate-300" : "border-white"}`}>
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* CONTACT SECTION */}
          <div className="space-y-4">
            <div 
              className="text-center font-bold tracking-wider py-1 rounded-full text-xs uppercase"
              style={{ 
                backgroundColor: isLight ? primaryColor : "#ffffff", 
                color: isLight ? "#ffffff" : primaryColor 
              }}
            >
              {t("contact", lang)}
            </div>
            
            <div className="space-y-3 text-xs">
              {personalInfo.phone && (
                <div className={`flex items-center gap-3 ${isLight ? "text-slate-800" : "text-white/95"}`}>
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${isLight ? "border-slate-300 bg-slate-100" : "border-white bg-white/5"}`}>
                    <Phone className="h-3 w-3" style={{ color: iconColor }} />
                  </div>
                  <span className="break-all">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className={`flex items-center gap-3 ${isLight ? "text-slate-800" : "text-white/95"}`}>
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${isLight ? "border-slate-300 bg-slate-100" : "border-white bg-white/5"}`}>
                    <Mail className="h-3 w-3" style={{ color: iconColor }} />
                  </div>
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className={`flex items-center gap-3 ${isLight ? "text-slate-800" : "text-white/95"}`}>
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${isLight ? "border-slate-300 bg-slate-100" : "border-white bg-white/5"}`}>
                    <MapPin className="h-3 w-3" style={{ color: iconColor }} />
                  </div>
                  <span className="break-all">{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.portfolio && (
                <a 
                  href={formatUrl(personalInfo.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 ${isLight ? "text-slate-800 hover:underline" : "text-white/95 hover:underline"}`}
                >
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${isLight ? "border-slate-300 bg-slate-100" : "border-white bg-white/5"}`}>
                    <Globe className="h-3 w-3" style={{ color: iconColor }} />
                  </div>
                  <span className="break-all truncate">
                    {getLinkLabel(personalInfo.portfolio)}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* EDUCATION SECTION */}
          {education && education.length > 0 && (
            <div className="space-y-4">
              <div 
                className="text-center font-bold tracking-wider py-1 rounded-full text-xs uppercase"
                style={{ 
                  backgroundColor: isLight ? primaryColor : "#ffffff", 
                  color: isLight ? "#ffffff" : primaryColor 
                }}
              >
                {t("education", lang)}
              </div>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className={`space-y-1 text-xs break-inside-avoid ${edu.pageBreakBefore ? "page-break-before" : ""}`}>
                    {edu.pageBreakBefore && (
                      <div className="w-full flex items-center gap-2 my-4 print:hidden">
                        <div className={`flex-1 border-t border-dashed ${isLight ? "border-slate-300" : "border-white/20"}`} />
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${isLight ? "text-slate-650 bg-slate-100 border-slate-300" : "text-white/50 bg-white/10 border-white/10"}`}>
                          Page Break
                        </span>
                        <div className={`flex-1 border-t border-dashed ${isLight ? "border-slate-300" : "border-white/20"}`} />
                      </div>
                    )}
                    <p className={`font-bold leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>{edu.major}</p>
                    <p className={isLight ? "text-slate-700 font-medium" : "text-white/80 font-medium"}>{edu.school}</p>
                    <p className={`text-[10px] font-semibold ${isLight ? "text-slate-500" : "text-white/60"}`}>
                      {edu.startDate} – {edu.endDate || t("present", lang)}
                    </p>
                    {edu.description && (
                      <p className={`text-[10px] leading-relaxed pt-0.5 ${isLight ? "text-slate-600" : "text-white/70"}`}>{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGE SECTION */}
          {languages && languages.length > 0 && (
            <div className="space-y-4">
              <div 
                className="text-center font-bold tracking-wider py-1 rounded-full text-xs uppercase"
                style={{ 
                  backgroundColor: isLight ? primaryColor : "#ffffff", 
                  color: isLight ? "#ffffff" : primaryColor 
                }}
              >
                {t("languages", lang)}
              </div>
              <div className="space-y-3">
                {languages.map((langItem) => {
                  const percentage = parseLanguageLevel(langItem.level);
                  return (
                    <div key={langItem.id} className="space-y-1 break-inside-avoid">
                      <div className={`flex justify-between items-center text-xs ${isLight ? "text-slate-800" : "text-white"}`}>
                        <span className="font-bold">{langItem.name}</span>
                        <span className={`text-[10px] italic ${isLight ? "text-slate-500" : "text-white/75"}`}>{langItem.level}</span>
                      </div>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/20"}`}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: isLight ? primaryColor : "#ffffff" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REFERENCE SECTION */}
          {references && references.length > 0 && (
            <div className="space-y-4">
              <div 
                className="text-center font-bold tracking-wider py-1 rounded-full text-xs uppercase"
                style={{ 
                  backgroundColor: isLight ? primaryColor : "#ffffff", 
                  color: isLight ? "#ffffff" : primaryColor 
                }}
              >
                {t("references", lang)}
              </div>
              <div className="space-y-4">
                {references.map((ref) => (
                  <div key={ref.id} className={`space-y-1 text-xs break-inside-avoid ${ref.pageBreakBefore ? "page-break-before" : ""}`}>
                    {ref.pageBreakBefore && (
                      <div className="w-full flex items-center gap-2 my-4 print:hidden">
                        <div className={`flex-1 border-t border-dashed ${isLight ? "border-slate-300" : "border-white/20"}`} />
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${isLight ? "text-slate-650 bg-slate-100 border-slate-300" : "text-white/50 bg-white/10 border-white/10"}`}>
                          Page Break
                        </span>
                        <div className={`flex-1 border-t border-dashed ${isLight ? "border-slate-300" : "border-white/20"}`} />
                      </div>
                    )}
                    <p className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{ref.name}</p>
                    {ref.relationship || ref.company ? (
                      <p className={`font-medium text-[10px] leading-tight ${isLight ? "text-slate-700" : "text-white/80"}`}>
                        {ref.relationship} {ref.relationship && ref.company ? "at" : ""} {ref.company}
                      </p>
                    ) : null}
                    <div className={`text-[10px] space-y-0.5 pt-0.5 ${isLight ? "text-slate-500" : "text-white/60"}`}>
                      {ref.email && <p className="truncate">Email: {ref.email}</p>}
                      {ref.phone && <p>Tel: {ref.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col min-h-full">
          {/* Top Header Banner */}
          <header 
            className="w-full text-white px-8 py-8 sm:py-10 print:py-8 flex flex-col justify-center" 
            style={{ backgroundColor: bannerColor }}
          >
            <h1 className="text-3xl font-extrabold tracking-wide uppercase leading-tight font-sans">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/90 mt-1">
              {personalInfo.jobTitle || "Professional Title"}
            </p>
            {personalInfo.targetRole && (
              <p className="text-xs font-bold mt-1 text-white/70 uppercase tracking-widest">
                {t("appliedFor", lang)}: {personalInfo.targetRole}
              </p>
            )}
          </header>

          {/* Main content body */}
          <div className="p-8 sm:p-10 flex-1 space-y-6">
            {/* ABOUT ME SECTION */}
            {professionalSummary && (
              <section className="space-y-3">
                <div 
                  className="text-white text-center font-bold tracking-wider py-1 px-4 rounded-full text-xs uppercase inline-block"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("professionalSummary", lang)}
                </div>
                {renderMarkdownHTML(professionalSummary, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
              </section>
            )}

            {/* EXPERIENCE SECTION */}
            {experience && experience.length > 0 && (
              <section className="space-y-4">
                <div 
                  className="text-white text-center font-bold tracking-wider py-1 px-4 rounded-full text-xs uppercase inline-block"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("workExperience", lang)}
                </div>
                
                {/* Timeline wrapper */}
                <div className="relative border-l-1.5 pl-6 ml-3 space-y-5" style={{ borderColor: primaryColor }}>
                  {experience.map((exp) => (
                    <div key={exp.id} className={`relative break-inside-avoid text-xs sm:text-sm ${exp.pageBreakBefore ? "page-break-before" : ""}`}>
                      {exp.pageBreakBefore && (
                        <div className="w-full flex items-center gap-2 pb-4 -ml-6 print:hidden">
                          <div className="flex-1 border-t border-dashed border-slate-350" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Page Break
                          </span>
                          <div className="flex-1 border-t border-dashed border-slate-350" />
                        </div>
                      )}
                      
                      {/* Circle dot on line */}
                      <div 
                        className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full border border-white"
                        style={{ backgroundColor: primaryColor }}
                      />
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                          <p className="text-[11px] font-bold text-slate-500">
                            {exp.startDate} – {exp.endDate || t("present", lang)}
                          </p>
                        </div>
                        
                        <p className="font-semibold text-slate-600 leading-tight">
                          {exp.company}
                        </p>
                        
                        <p className="font-extrabold text-xs sm:text-sm" style={{ color: primaryColor }}>
                          {exp.position}
                        </p>

                        {exp.description && (
                          <div className="text-xs text-slate-650 leading-relaxed pt-1 text-justify">
                            {exp.description.includes("\n") || exp.description.startsWith("-") || exp.description.startsWith("•") ? (
                              <ul className="list-disc pl-4 space-y-0.5">
                                {exp.description
                                  .split("\n")
                                  .filter((line) => line.trim())
                                  .map((line, idx) => (
                                    <li key={idx}>{line.replace(/^[-•*]\s*/, "")}</li>
                                  ))}
                              </ul>
                            ) : (
                              renderMarkdownHTML(exp.description, "text-xs text-slate-700")
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

             {/* PROJECTS SECTION */}
            {projects && projects.length > 0 && (
              <section className="space-y-4">
                <div 
                  className="text-white text-center font-bold tracking-wider py-1 px-4 rounded-full text-xs uppercase inline-block"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("projects", lang)}
                </div>
                <div className="space-y-4">
                  {projects.map((proj) => (
                    <div key={proj.id} className={`space-y-1.5 break-inside-avoid text-xs sm:text-sm ${proj.pageBreakBefore ? "page-break-before" : ""}`}>
                      {proj.pageBreakBefore && (
                        <div className="w-full flex items-center gap-2 my-4 print:hidden">
                          <div className="flex-1 border-t border-dashed border-slate-300" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Page Break
                          </span>
                          <div className="flex-1 border-t border-dashed border-slate-350" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-baseline font-bold flex-wrap gap-1">
                        <span className="text-slate-800 font-bold">{proj.name}</span>
                        {proj.link && (
                          <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline font-semibold" style={{ color: primaryColor }}>
                            {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                          </a>
                        )}
                      </div>
                      
                      {proj.technologies && (
                        <p className="text-[10px] font-semibold text-slate-500">Tech: {proj.technologies}</p>
                      )}
                      
                      {proj.description && (
                        <div className="mt-0.5">{renderMarkdownHTML(proj.description, "text-xs text-slate-650 leading-relaxed text-justify mt-0.5")}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SKILLS SECTION */}
            {skills && skills.length > 0 && (
              <section className="space-y-4">
                <div 
                  className="text-white text-center font-bold tracking-wider py-1 px-4 rounded-full text-xs uppercase inline-block"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("skills", lang)}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
                  {skills.map((skill, index) => {
                    const { name, dots } = parseSkill(skill);
                    return (
                      <div key={index} className="flex justify-between items-center text-xs break-inside-avoid">
                        <span className="font-bold text-slate-700">{name}</span>
                        <div className="flex gap-1.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((d) => (
                            <div
                              key={d}
                              className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                                d <= dots ? "border-transparent" : "border-slate-300 bg-slate-100"
                              }`}
                              style={{ 
                                backgroundColor: d <= dots ? primaryColor : undefined,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    );
  }
);

CVTemplateCanvaColumn.displayName = "CVTemplateCanvaColumn";
