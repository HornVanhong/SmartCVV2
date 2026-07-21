import React from "react";
import { CVData } from "@/types/cv";
import { t } from "@/lib/translations";
import { formatUrl, renderMarkdownHTML } from "@/lib/utils";

interface CVTemplatePortfolioProps {
  data: CVData;
}

export const CVTemplatePortfolio = React.forwardRef<HTMLDivElement, CVTemplatePortfolioProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    const getInitials = (name: string) => {
      const cleanName = name || "Your Name";
      const parts = cleanName.trim().split(/\s+/);
      if (parts.length === 0 || !parts[0]) return "YN";
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
    };

    return (
      <div
        ref={ref}
        className="w-full text-slate-800 p-8 sm:p-12 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col gap-6 print:p-0"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header - Initials Badge branding */}
        <header className="flex flex-col sm:flex-row items-center gap-6 justify-between border-b pb-6" style={{ borderColor: `${primaryColor}20` }}>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left print:text-left">
            {/* Initials Badge or profile photo */}
            {personalInfo.photo ? (
              <div className={`overflow-hidden border border-slate-200 shadow-xs rounded-full shrink-0 ${
                data.theme?.photoAspectRatio === "4:6" ? "h-24 w-24" : "h-24 w-24"
              }`}>
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-black shrink-0 tracking-wider shadow-inner" style={{ backgroundColor: primaryColor }}>
                {getInitials(personalInfo.fullName)}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
                {personalInfo.fullName || "Your Name"}
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mt-1" style={{ color: primaryColor }}>
                {personalInfo.jobTitle || "Professional Title"}
              </p>
              {personalInfo.targetRole && (
                <p className="text-[10px] font-bold uppercase mt-1 text-slate-400">
                  {t("appliedFor", lang)}: {personalInfo.targetRole}
                </p>
              )}
            </div>
          </div>

          {/* Contact coordinates */}
          <div className="flex flex-wrap sm:flex-col gap-1.5 sm:gap-1 text-[11px] font-semibold text-slate-500 justify-center sm:items-end text-center sm:text-right print:text-right">
            {personalInfo.email && <span className="hover:underline">{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </header>

        {/* Dynamic section blocks */}
        <div className="space-y-6 flex-1">
          {/* Summary */}
          {professionalSummary && (
            <section className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t("profile", lang)}
              </h2>
              {renderMarkdownHTML(professionalSummary, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
            </section>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t("workExperience", lang)}
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="flex flex-col sm:flex-row print:flex-row gap-2 sm:gap-6 print:gap-6 break-inside-avoid text-xs sm:text-sm">
                    <div className="w-[120px] shrink-0 text-xs font-bold text-slate-500 whitespace-nowrap">
                      {exp.startDate} – {exp.endDate || t("present", lang)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-slate-900 leading-snug">
                        {exp.position} <span className="font-medium text-slate-450">at</span> {exp.company}
                      </h4>
                      {exp.description && (
                        <div className="mt-0.5">{renderMarkdownHTML(exp.description, "text-xs text-slate-650 leading-relaxed text-justify")}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t("education", lang)}
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="flex flex-col sm:flex-row print:flex-row gap-2 sm:gap-6 print:gap-6 break-inside-avoid text-xs sm:text-sm">
                    <div className="w-[120px] shrink-0 text-xs font-bold text-slate-500 whitespace-nowrap">
                      {edu.startDate} – {edu.endDate || t("present", lang)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-slate-900 leading-snug">
                        {edu.major} <span className="font-medium text-slate-450">at</span> {edu.school}
                      </h4>
                      {edu.description && (
                        <div className="mt-0.5">{renderMarkdownHTML(edu.description, "text-xs text-slate-650 leading-relaxed text-justify")}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t("projects", lang)}
              </h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="flex flex-col sm:flex-row print:flex-row gap-2 sm:gap-6 print:gap-6 break-inside-avoid text-xs sm:text-sm">
                    <div className="w-[120px] shrink-0 text-xs font-bold text-slate-500 whitespace-nowrap">
                      {proj.link ? (
                        <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="hover:underline font-bold" style={{ color: primaryColor }}>
                          {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                        </a>
                      ) : (
                        <span className="font-bold">Project</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-slate-900 leading-snug">{proj.name}</h4>
                      {proj.description && (
                        <div className="mt-0.5">{renderMarkdownHTML(proj.description, "text-xs text-slate-650 leading-relaxed text-justify")}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills & Languages split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 break-inside-avoid">
            {skills && skills.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {t("skills", lang)}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 border border-slate-150 bg-slate-50 rounded text-xs font-semibold text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {languages && languages.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {t("languages", lang)}
                </h2>
                <div className="space-y-1.5 text-xs">
                  {languages.map((langItem) => (
                    <div key={langItem.id} className="flex justify-between items-center font-semibold">
                      <span className="text-slate-800">{langItem.name}</span>
                      <span className="text-slate-450 italic">{langItem.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* References */}
          {references && references.length > 0 && (
            <section className="space-y-3 break-inside-avoid">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                {t("references", lang)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {references.map((ref) => (
                  <div key={ref.id} className="space-y-0.5 text-xs sm:text-sm">
                    <h3 className="text-slate-900 font-bold">{ref.name}</h3>
                    {ref.relationship && ref.company ? (
                      <p className="text-slate-500 font-semibold text-[10px] leading-tight">{ref.relationship} at {ref.company}</p>
                    ) : ref.relationship || ref.company ? (
                      <p className="text-slate-500 font-semibold text-[10px] leading-tight">{ref.relationship || ref.company}</p>
                    ) : null}
                    <div className="text-slate-500 text-[10px] space-y-0.5 mt-1 font-medium">
                      {ref.email && <span className="block">{t("email", lang)}: {ref.email}</span>}
                      {ref.phone && <span className="block">{t("tel", lang)}: {ref.phone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    );
  }
);

CVTemplatePortfolio.displayName = "CVTemplatePortfolio";
