import React from "react";
import { CVData } from "@/types/cv";
import { t } from "@/lib/translations";
import { formatUrl, renderMarkdownHTML } from "@/lib/utils";

interface CVTemplateFancyGridProps {
  data: CVData;
}

export const CVTemplateFancyGrid = React.forwardRef<HTMLDivElement, CVTemplateFancyGridProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    return (
      <div
        ref={ref}
        className="w-full bg-slate-50/50 text-slate-800 p-6 sm:p-8 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col gap-5 print:p-0 print:bg-white"
        style={{ boxSizing: "border-box" }}
      >
        {/* Top Header Card */}
        <header className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left print:text-left">
            {personalInfo.photo && (
              <div className={`overflow-hidden border border-slate-200 shadow-sm rounded-lg shrink-0 ${
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
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide" style={{ color: primaryColor }}>
                {personalInfo.fullName || "Your Name"}
              </h1>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-1">
                {personalInfo.jobTitle || "Professional Title"}
              </p>
              {personalInfo.targetRole && (
                <p className="text-[10px] font-extrabold uppercase mt-1 text-slate-400">
                  {t("appliedFor", lang)}: {personalInfo.targetRole}
                </p>
              )}
            </div>
          </div>

          {/* Contact coordinates list */}
          <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-650 sm:items-end text-center sm:text-right print:text-right border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto shrink-0">
            {personalInfo.email && <span className="hover:underline">{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </header>

        {/* Dashboard grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Summary, Skills, Languages */}
          <div className="md:col-span-1 flex flex-col gap-5">
            {/* Profile Summary */}
            {professionalSummary && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
                  {t("profile", lang)}
                </h3>
                {renderMarkdownHTML(professionalSummary, "text-xs text-slate-600 leading-relaxed text-justify")}
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
                  {t("skills", lang)}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 rounded-sm bg-slate-50 border border-slate-150 text-[10px] font-semibold text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
                  {t("languages", lang)}
                </h3>
                <div className="space-y-1.5 text-xs">
                  {languages.map((langItem) => (
                    <div key={langItem.id} className="flex justify-between items-center text-slate-700">
                      <span className="font-bold">{langItem.name}</span>
                      <span className="text-[10px] text-slate-450 italic font-semibold">{langItem.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2 & 3: Experience, Education, Projects, References */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Work Experience */}
            {experience && experience.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3.5" style={{ color: primaryColor }}>
                  {t("workExperience", lang)}
                </h3>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1 break-inside-avoid">
                      <div className="flex justify-between items-baseline text-xs sm:text-sm font-bold text-slate-900">
                        <span>{exp.position} <span className="font-medium text-slate-400">at</span> {exp.company}</span>
                        <span className="text-[10px] text-slate-550 font-semibold shrink-0 ml-4">{exp.startDate} – {exp.endDate || t("present", lang)}</span>
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
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3.5" style={{ color: primaryColor }}>
                  {t("education", lang)}
                </h3>
                <div className="space-y-3.5">
                  {education.map((edu) => (
                    <div key={edu.id} className="space-y-1 break-inside-avoid">
                      <div className="flex justify-between items-baseline text-xs sm:text-sm font-bold text-slate-900">
                        <span>{edu.major}</span>
                        <span className="text-[10px] text-slate-550 font-semibold shrink-0 ml-4">{edu.startDate} – {edu.endDate || t("present", lang)}</span>
                      </div>
                      <div className="text-xs text-slate-450 font-bold">{edu.school}</div>
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
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3.5" style={{ color: primaryColor }}>
                  {t("projects", lang)}
                </h3>
                <div className="space-y-3.5">
                  {projects.map((proj) => (
                    <div key={proj.id} className="space-y-1 break-inside-avoid">
                      <div className="flex justify-between items-baseline text-xs sm:text-sm font-bold text-slate-900">
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

            {/* References */}
            {references && references.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase tracking-widest border-b border-slate-100 pb-2 mb-3.5" style={{ color: primaryColor }}>
                  {t("references", lang)}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {references.map((ref) => (
                    <div key={ref.id} className="space-y-0.5 break-inside-avoid text-xs sm:text-sm">
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
      </div>
    );
  }
);

CVTemplateFancyGrid.displayName = "CVTemplateFancyGrid";
