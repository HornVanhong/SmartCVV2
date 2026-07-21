import React from "react";
import { CVData } from "@/types/cv";
import { t } from "@/lib/translations";
import { formatUrl, getLinkLabel, renderMarkdownHTML } from "@/lib/utils";
import { PreviewSection, PreviewItem, PreviewField } from "@/components/PreviewInteractive";

interface CVTemplateElegantProps {
  data: CVData;
}

export const CVTemplateElegant = React.forwardRef<HTMLDivElement, CVTemplateElegantProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references, customSections } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    return (
      <div
        ref={ref}
        className="w-full text-slate-900 p-8 sm:p-12 font-serif selection:bg-slate-100 min-h-[inherit] flex flex-col print:p-0 print:font-serif"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header - Centered Serif */}
        <header className="flex flex-col items-center text-center pb-6 mb-6 border-b-3 border-double border-slate-300" style={{ borderColor: primaryColor }}>
          {personalInfo.photo && (
            <div className={`overflow-hidden border border-slate-200 shadow-xs mb-4 rounded-sm ${
              data.theme?.photoAspectRatio === "4:6" ? "h-36 w-24" : "h-32 w-24"
            }`}>
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-wide uppercase font-serif" style={{ color: primaryColor }}>
            <PreviewField path="personalInfo.fullName">
              {personalInfo.fullName || "Your Name"}
            </PreviewField>
          </h1>
          <p className="text-sm font-medium italic text-slate-500 mt-1 uppercase tracking-widest font-sans">
            <PreviewField path="personalInfo.jobTitle">
              {personalInfo.jobTitle || "Professional Title"}
            </PreviewField>
          </p>
          {personalInfo.targetRole && (
            <p className="text-xs font-bold mt-1 text-slate-400 uppercase tracking-widest font-sans">
              {t("appliedFor", lang)}:{" "}
              <PreviewField path="personalInfo.targetRole">
                {personalInfo.targetRole}
              </PreviewField>
            </p>
          )}

          {/* Clean contact row with bullet separators */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-xs font-sans text-slate-600 font-semibold">
            {personalInfo.email && (
              <span className="hover:underline">
                <PreviewField path="personalInfo.email">
                  {personalInfo.email}
                </PreviewField>
              </span>
            )}
            {personalInfo.phone && (
              <span>
                •{" "}
                <PreviewField path="personalInfo.phone">
                  {personalInfo.phone}
                </PreviewField>
              </span>
            )}
            {personalInfo.location && (
              <span>
                •{" "}
                <PreviewField path="personalInfo.location">
                  {personalInfo.location}
                </PreviewField>
              </span>
            )}
            {personalInfo.portfolio && (
              <span>
                •{" "}
                <a 
                  href={formatUrl(personalInfo.portfolio)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline"
                >
                  <PreviewField path="personalInfo.portfolio">
                    {getLinkLabel(personalInfo.portfolio)}
                  </PreviewField>
                </a>
              </span>
            )}
          </div>
        </header>

        {/* Dynamic section blocks */}
        <div className="space-y-6 flex-1">
          {/* Summary */}
          {professionalSummary && (
            <PreviewSection section="summary">
              <section className="space-y-2">
                <h2 className="text-center text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                  {t("professionalSummary", lang)}
                </h2>
                <PreviewField path="professionalSummary" className="w-full">
                  {renderMarkdownHTML(professionalSummary, "text-sm text-slate-700 leading-relaxed text-justify")}
                </PreviewField>
              </section>
            </PreviewSection>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <PreviewSection section="experience" label="Experience">
              <section className="space-y-3">
                <h2 className="text-center text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                  {t("workExperience", lang)}
                </h2>
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <PreviewItem
                      key={exp.id}
                      section="experience"
                      id={exp.id}
                      index={idx}
                      totalCount={experience.length}
                    >
                      <div className="space-y-1 break-inside-avoid w-full pr-12 sm:pr-0">
                        <div className="flex justify-between items-baseline text-sm font-bold text-slate-900">
                          <span>
                            <PreviewField path={`experience.${exp.id}.position`}>
                              {exp.position}
                            </PreviewField>{" "}
                            <span className="font-medium font-sans text-slate-500">at</span>{" "}
                            <PreviewField path={`experience.${exp.id}.company`}>
                              {exp.company}
                            </PreviewField>
                          </span>
                          <span className="text-xs font-sans text-slate-500 font-semibold">
                            <PreviewField path={`experience.${exp.id}.startDate`}>
                              {exp.startDate}
                            </PreviewField>{" "}
                            –{" "}
                            <PreviewField path={`experience.${exp.id}.endDate`}>
                              {exp.endDate || t("present", lang)}
                            </PreviewField>
                          </span>
                        </div>
                        {exp.description && (
                          <PreviewField path={`experience.${exp.id}.description`} className="w-full">
                            {renderMarkdownHTML(exp.description, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
                          </PreviewField>
                        )}
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </section>
            </PreviewSection>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <PreviewSection section="education" label="Education">
              <section className="space-y-3">
                <h2 className="text-center text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                  {t("education", lang)}
                </h2>
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <PreviewItem
                      key={edu.id}
                      section="education"
                      id={edu.id}
                      index={idx}
                      totalCount={education.length}
                    >
                      <div className="space-y-1 break-inside-avoid w-full pr-12 sm:pr-0">
                        <div className="flex justify-between items-baseline text-sm font-bold text-slate-900">
                          <span>
                            <PreviewField path={`education.${edu.id}.major`}>
                              {edu.major}
                            </PreviewField>{" "}
                            <span className="font-medium font-sans text-slate-500">at</span>{" "}
                            <PreviewField path={`education.${edu.id}.school`}>
                              {edu.school}
                            </PreviewField>
                          </span>
                          <span className="text-xs font-sans text-slate-500 font-semibold">
                            <PreviewField path={`education.${edu.id}.startDate`}>
                              {edu.startDate}
                            </PreviewField>{" "}
                            –{" "}
                            <PreviewField path={`education.${edu.id}.endDate`}>
                              {edu.endDate || t("present", lang)}
                            </PreviewField>
                          </span>
                        </div>
                        {edu.description && (
                          <PreviewField path={`education.${edu.id}.description`} className="w-full">
                            {renderMarkdownHTML(edu.description, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
                          </PreviewField>
                        )}
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </section>
            </PreviewSection>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <PreviewSection section="projects" label="Project">
              <section className="space-y-3">
                <h2 className="text-center text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                  {t("projects", lang)}
                </h2>
                <div className="space-y-3">
                  {projects.map((proj, idx) => (
                    <PreviewItem
                      key={proj.id}
                      section="projects"
                      id={proj.id}
                      index={idx}
                      totalCount={projects.length}
                    >
                      <div className="space-y-1 break-inside-avoid w-full pr-12 sm:pr-0">
                        <div className="flex justify-between items-baseline text-sm font-bold text-slate-900">
                          <span>
                            <PreviewField path={`projects.${proj.id}.name`}>
                              {proj.name}
                            </PreviewField>
                          </span>
                          {proj.link && (
                            <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-xs font-sans hover:underline font-semibold" style={{ color: primaryColor }}>
                              <PreviewField path={`projects.${proj.id}.link`}>
                                {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                              </PreviewField>
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <PreviewField path={`projects.${proj.id}.description`} className="w-full">
                            {renderMarkdownHTML(proj.description, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
                          </PreviewField>
                        )}
                        {proj.technologies && (
                          <div className="text-xs font-sans text-slate-500 font-medium">
                            <span className="text-slate-700 font-bold">Tech:</span>{" "}
                            <PreviewField path={`projects.${proj.id}.technologies`}>
                              {proj.technologies}
                            </PreviewField>
                          </div>
                        )}
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </section>
            </PreviewSection>
          )}

          {/* Skills & Languages Grid */}
          <div className="grid grid-cols-2 gap-8 break-inside-avoid">
            {skills && skills.length > 0 && (
              <PreviewSection section="skills" label="Skill">
                <section className="space-y-2">
                  <h2 className="text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                    {t("skills", lang)}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold font-sans"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </PreviewSection>
            )}

            {languages && languages.length > 0 && (
              <PreviewSection section="languages" label="Language">
                <section className="space-y-2">
                  <h2 className="text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                    {t("languages", lang)}
                  </h2>
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {languages.map((langItem, idx) => (
                      <PreviewItem
                        key={langItem.id}
                        section="languages"
                        id={langItem.id}
                        index={idx}
                        totalCount={languages.length}
                      >
                        <div className="flex justify-between items-center text-xs font-sans w-full pr-12 sm:pr-0">
                          <span className="font-bold text-slate-800">
                            <PreviewField path={`languages.${langItem.id}.name`}>
                              {langItem.name}
                            </PreviewField>
                          </span>
                          <span className="text-slate-500 font-medium italic">
                            <PreviewField path={`languages.${langItem.id}.level`}>
                              {langItem.level}
                            </PreviewField>
                          </span>
                        </div>
                      </PreviewItem>
                    ))}
                  </div>
                </section>
              </PreviewSection>
            )}
          </div>

          {/* References */}
          {references && references.length > 0 && (
            <PreviewSection section="references" label="Reference">
              <section className="space-y-3 break-inside-avoid">
                <h2 className="text-center text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                  {t("references", lang)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-1">
                  {references.map((ref, idx) => (
                    <PreviewItem
                      key={ref.id}
                      section="references"
                      id={ref.id}
                      index={idx}
                      totalCount={references.length}
                    >
                      <div className="space-y-0.5 text-xs sm:text-sm w-full pr-12 sm:pr-0">
                        <h3 className="text-slate-900 font-bold">
                          <PreviewField path={`references.${ref.id}.name`}>
                            {ref.name}
                          </PreviewField>
                        </h3>
                        {ref.relationship && ref.company ? (
                          <p className="text-slate-500 font-semibold text-[10px] leading-tight font-sans">
                            <PreviewField path={`references.${ref.id}.relationship`}>
                              {ref.relationship}
                            </PreviewField>{" "}
                            at{" "}
                            <PreviewField path={`references.${ref.id}.company`}>
                              {ref.company}
                            </PreviewField>
                          </p>
                        ) : ref.relationship || ref.company ? (
                          <p className="text-slate-500 font-semibold text-[10px] leading-tight font-sans">
                            {ref.relationship ? (
                              <PreviewField path={`references.${ref.id}.relationship`}>
                                {ref.relationship}
                              </PreviewField>
                            ) : (
                              <PreviewField path={`references.${ref.id}.company`}>
                                {ref.company}
                              </PreviewField>
                            )}
                          </p>
                        ) : null}
                        <div className="text-slate-500 text-[10px] space-y-0.5 mt-1 font-medium font-sans">
                          {ref.email && (
                            <span className="block">
                              {t("email", lang)}:{" "}
                              <PreviewField path={`references.${ref.id}.email`}>
                                {ref.email}
                              </PreviewField>
                            </span>
                          )}
                          {ref.phone && (
                            <span className="block">
                              {t("tel", lang)}:{" "}
                              <PreviewField path={`references.${ref.id}.phone`}>
                                {ref.phone}
                              </PreviewField>
                            </span>
                          )}
                        </div>
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </section>
            </PreviewSection>
          )}

          {/* Dynamic Custom Sections */}
          {customSections && customSections.map((sec) => (
            <PreviewSection key={sec.id} section={`customSections.${sec.id}`} label={sec.name}>
              <section className="space-y-3 break-inside-avoid">
                <h2 className="text-center text-sm font-bold tracking-widest uppercase border-b pb-1 font-sans" style={{ color: primaryColor, borderColor: `${primaryColor}20` }}>
                  {sec.name}
                </h2>
                <div className="space-y-3">
                  {sec.items.map((item, idx) => (
                    <PreviewItem
                      key={item.id}
                      section={`customSections.${sec.id}`}
                      id={item.id}
                      index={idx}
                      totalCount={sec.items.length}
                    >
                      <div className="space-y-1 break-inside-avoid text-xs w-full pr-12 sm:pr-0">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>
                            <PreviewField path={`customSections.${sec.id}.${item.id}.title`}>
                              {item.title || "Untitled Entry"}
                            </PreviewField>{" "}
                            {item.subtitle && (
                              <>
                                <span className="font-medium font-sans text-slate-500">at</span>{" "}
                                <PreviewField path={`customSections.${sec.id}.${item.id}.subtitle`}>
                                  {item.subtitle}
                                </PreviewField>
                              </>
                            )}
                          </span>
                          <span className="text-xs font-sans text-slate-500 font-semibold">
                            <PreviewField path={`customSections.${sec.id}.${item.id}.startDate`}>
                              {item.startDate}
                            </PreviewField>
                            {item.startDate && item.endDate && " – "}
                            <PreviewField path={`customSections.${sec.id}.${item.id}.endDate`}>
                              {item.endDate}
                            </PreviewField>
                          </span>
                        </div>
                        {item.description && (
                          <PreviewField path={`customSections.${sec.id}.${item.id}.description`} className="w-full">
                            {renderMarkdownHTML(item.description, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
                          </PreviewField>
                        )}
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </section>
            </PreviewSection>
          ))}

        </div>
      </div>
    );
  }
);

CVTemplateElegant.displayName = "CVTemplateElegant";
