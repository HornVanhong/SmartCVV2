import React from "react";
import { CVData } from "@/types/cv";
import { t } from "@/lib/translations";
import { formatUrl, renderMarkdownHTML } from "@/lib/utils";

interface CVTemplateTimelineProps {
  data: CVData;
}

export const CVTemplateTimeline = React.forwardRef<HTMLDivElement, CVTemplateTimelineProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    return (
      <div
        ref={ref}
        className="w-full text-slate-800 p-8 sm:p-12 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col gap-6 print:p-0"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header - Left Aligned with Accent Border */}
        <header className="flex flex-col sm:flex-row items-start gap-6 border-l-4 pl-4 py-1.5" style={{ borderColor: primaryColor }}>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {personalInfo.fullName || "Your Name"}
            </h1>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500">
              {personalInfo.jobTitle || "Professional Title"}
            </p>
            {personalInfo.targetRole && (
              <p className="text-[10px] font-bold uppercase mt-1 text-slate-400">
                {t("appliedFor", lang)}: {personalInfo.targetRole}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500 sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-150">
            {personalInfo.email && <span className="hover:underline">{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.dob && <span>{lang === "km" ? "ថ្ងៃកំណើត" : "DOB"}: {personalInfo.dob}</span>}
            {personalInfo.nationality && <span>{lang === "km" ? "សញ្ជាតិ" : "Nat."}: {personalInfo.nationality}</span>}
          </div>
        </header>

        {/* Layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main timeline column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Professional Summary */}
            {professionalSummary && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("profile", lang)}
                </h2>
                {renderMarkdownHTML(professionalSummary, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
              </section>
            )}

            {/* Work Experience */}
            {experience && experience.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("workExperience", lang)}
                </h2>
                <div className="relative border-l-2 pl-4 ml-2 space-y-5" style={{ borderColor: `${primaryColor}30` }}>
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative break-inside-avoid text-xs sm:text-sm">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border bg-white" style={{ borderColor: primaryColor }} />
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-slate-900 flex-wrap gap-1">
                          <span>{exp.position} <span className="font-medium text-slate-450">at</span> {exp.company}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{exp.startDate} – {exp.endDate || t("present", lang)}</span>
                        </div>
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
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("education", lang)}
                </h2>
                <div className="relative border-l-2 pl-4 ml-2 space-y-4" style={{ borderColor: `${primaryColor}30` }}>
                  {education.map((edu) => (
                    <div key={edu.id} className="relative break-inside-avoid text-xs sm:text-sm">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border bg-white" style={{ borderColor: primaryColor }} />
                      
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-slate-900 flex-wrap gap-1">
                          <span>{edu.major}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{edu.startDate} – {edu.endDate || t("present", lang)}</span>
                        </div>
                        <div className="text-xs text-slate-450 font-bold">{edu.school}</div>
                        {edu.description && (
                          <div className="mt-0.5">{renderMarkdownHTML(edu.description, "text-xs text-slate-650 leading-relaxed text-justify mt-1")}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column: Photo, Skills, Languages, Projects, References */}
          <div className="md:col-span-1 flex flex-col gap-6">
            {/* Photo */}
            {personalInfo.photo && (
              <div className={`overflow-hidden border border-slate-200 shadow-xs rounded-xl mx-auto shrink-0 ${
                data.theme?.photoAspectRatio === "4:6" ? "h-36 w-24" : "h-32 w-24"
              }`}>
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("skills", lang)}
                </h2>
                <div className="flex flex-wrap gap-1 pt-1">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded-sm text-[10px] font-semibold text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("languages", lang)}
                </h2>
                <div className="space-y-1.5 pt-1 text-xs">
                  {languages.map((langItem) => (
                    <div key={langItem.id} className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{langItem.name}</span>
                      <span className="text-[10px] text-slate-450 font-semibold italic">{langItem.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("projects", lang)}
                </h2>
                <div className="space-y-3 pt-1">
                  {projects.map((proj) => (
                    <div key={proj.id} className="space-y-0.5 break-inside-avoid text-xs">
                      <h4 className="font-bold text-slate-900">{proj.name}</h4>
                      {proj.link && (
                        <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-[10px] hover:underline font-semibold block" style={{ color: primaryColor }}>
                          {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                        </a>
                      )}
                      {proj.description && (
                        <div className="mt-0.5">{renderMarkdownHTML(proj.description, "text-slate-650 leading-relaxed text-justify mt-0.5")}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* References */}
            {references && references.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-450 border-b border-slate-100 pb-1">
                  {t("references", lang)}
                </h2>
                <div className="space-y-3 pt-1">
                  {references.map((ref) => (
                    <div key={ref.id} className="space-y-0.5 break-inside-avoid text-xs">
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
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CVTemplateTimeline.displayName = "CVTemplateTimeline";
