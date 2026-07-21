import React from "react";
import { CVData } from "@/types/cv";
import { t } from "@/lib/translations";
import { formatUrl, renderMarkdownHTML } from "@/lib/utils";

interface CVTemplateSimpleLeftProps {
  data: CVData;
}

export const CVTemplateSimpleLeft = React.forwardRef<HTMLDivElement, CVTemplateSimpleLeftProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    return (
      <div
        ref={ref}
        className="w-full text-slate-800 p-8 sm:p-12 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col gap-8 print:p-0"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header - Simple clean top */}
        <header className="flex flex-col sm:flex-row items-center gap-6 justify-between border-b pb-6" style={{ borderColor: `${primaryColor}20` }}>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left print:text-left">
            {personalInfo.photo && (
              <div className={`overflow-hidden border border-slate-250 shadow-xs rounded-sm shrink-0 ${
                data.theme?.photoAspectRatio === "4:6" ? "h-24 w-16" : "h-20 w-16"
              }`}>
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {personalInfo.fullName || "Your Name"}
              </h1>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest mt-1" style={{ color: primaryColor }}>
                {personalInfo.jobTitle || "Professional Title"}
              </p>
              {personalInfo.targetRole && (
                <p className="text-[10px] font-bold uppercase mt-1 text-slate-400">
                  {t("appliedFor", lang)}: {personalInfo.targetRole}
                </p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500 sm:items-end text-center sm:text-right print:text-right">
            {personalInfo.email && <span className="hover:underline">{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </header>

        {/* Left-Aligned sections */}
        <div className="space-y-6 flex-1">
          {/* Summary */}
          {professionalSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 break-inside-avoid">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("profile", lang)}
              </div>
              <div className="sm:col-span-3 text-xs sm:text-sm text-slate-650 leading-relaxed text-justify">
                {professionalSummary}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("workExperience", lang)}
              </div>
              <div className="sm:col-span-3 space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1 break-inside-avoid text-xs sm:text-sm">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{exp.position} <span className="font-medium text-slate-400">at</span> {exp.company}</span>
                      <span className="text-xs text-slate-450 font-semibold shrink-0 ml-4">{exp.startDate} – {exp.endDate || t("present", lang)}</span>
                    </div>
                    {exp.description && (
                      <div className="mt-0.5">{renderMarkdownHTML(exp.description, "text-xs text-slate-650 leading-relaxed text-justify")}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("education", lang)}
              </div>
              <div className="sm:col-span-3 space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-1 break-inside-avoid text-xs sm:text-sm">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{edu.major}</span>
                      <span className="text-xs text-slate-450 font-semibold shrink-0 ml-4">{edu.startDate} – {edu.endDate || t("present", lang)}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold">{edu.school}</div>
                    {edu.description && (
                      <div className="mt-0.5">{renderMarkdownHTML(edu.description, "text-xs text-slate-650 leading-relaxed text-justify mt-0.5")}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("projects", lang)}
              </div>
              <div className="sm:col-span-3 space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-1 break-inside-avoid text-xs sm:text-sm">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{proj.name}</span>
                      {proj.link && (
                        <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold hover:underline shrink-0 ml-4" style={{ color: primaryColor }}>
                          {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <div className="mt-0.5">{renderMarkdownHTML(proj.description, "text-xs text-slate-650 leading-relaxed text-justify")}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 break-inside-avoid">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("skills", lang)}
              </div>
              <div className="sm:col-span-3 flex flex-wrap gap-1.5 pt-0.5">
                {skills.map((skill, index) => (
                  <span key={index} className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 break-inside-avoid">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("languages", lang)}
              </div>
              <div className="sm:col-span-3 grid grid-cols-2 gap-4 pt-0.5">
                {languages.map((langItem) => (
                  <div key={langItem.id} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">{langItem.name}</span>
                    <span className="text-slate-450 italic">{langItem.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 break-inside-avoid">
              <div className="sm:col-span-1 text-xs font-black uppercase tracking-widest text-slate-500 sm:text-right pt-0.5">
                {t("references", lang)}
              </div>
              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-0.5">
                {references.map((ref) => (
                  <div key={ref.id} className="space-y-0.5 text-xs sm:text-sm">
                    <h4 className="font-bold text-slate-900">{ref.name}</h4>
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
            </div>
          )}
        </div>
      </div>
    );
  }
);

CVTemplateSimpleLeft.displayName = "CVTemplateSimpleLeft";
