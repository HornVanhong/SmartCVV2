import React from "react";
import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Github, Linkedin, Globe } from "lucide-react";
import { t } from "@/lib/translations";
import { formatUrl, getLinkLabel, renderMarkdownHTML } from "@/lib/utils";
import { PreviewSection, PreviewItem, PreviewField } from "@/components/PreviewInteractive";

interface CVTemplateMinimalistProps {
  data: CVData;
}

export const CVTemplateMinimalist = React.forwardRef<HTMLDivElement, CVTemplateMinimalistProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references, customSections } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    // Helper functions to render sections so they don't have to be repeated completely twice
    const renderEducationSection = () => (
      education && education.length > 0 && (
        <PreviewSection section="education" label="Education">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
              {t("education", lang)}
            </h2>
            <div className="space-y-3 print:space-y-2">
              {education.map((edu, idx) => (
                <PreviewItem
                  key={edu.id}
                  section="education"
                  id={edu.id}
                  index={idx}
                  totalCount={education.length}
                >
                  <div className="space-y-1 break-inside-avoid">
                    <div className="flex justify-between items-baseline text-xs sm:text-sm">
                      <h3 className="text-slate-900 font-bold">
                        <PreviewField path={`education.${edu.id}.major`}>
                          {edu.major}
                        </PreviewField>
                      </h3>
                      <span className="text-slate-500 font-medium whitespace-nowrap text-xs">
                        <PreviewField path={`education.${edu.id}.startDate`}>
                          {edu.startDate}
                        </PreviewField>{" "}
                        –{" "}
                        <PreviewField path={`education.${edu.id}.endDate`}>
                          {edu.endDate || t("present", lang)}
                        </PreviewField>
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold">
                      <PreviewField path={`education.${edu.id}.school`}>
                        {edu.school}
                      </PreviewField>
                    </div>
                    {edu.description && (
                      <PreviewField path={`education.${edu.id}.description`} className="w-full">
                        {renderMarkdownHTML(edu.description, "text-xs text-slate-500")}
                      </PreviewField>
                    )}
                  </div>
                </PreviewItem>
              ))}
            </div>
          </section>
        </PreviewSection>
      )
    );

    const renderProjectsSection = () => (
      projects && projects.length > 0 && (
        <PreviewSection section="projects" label="Project">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
              {t("projects", lang)}
            </h2>
            <div className="space-y-3 print:space-y-2">
              {projects.map((proj, idx) => (
                <PreviewItem
                  key={proj.id}
                  section="projects"
                  id={proj.id}
                  index={idx}
                  totalCount={projects.length}
                >
                  <div className="space-y-1 break-inside-avoid">
                    <div className="flex justify-between items-baseline text-xs sm:text-sm">
                      <h3 className="text-slate-900 font-bold flex items-center gap-1.5">
                        <PreviewField path={`projects.${proj.id}.name`}>
                          {proj.name}
                        </PreviewField>
                        {proj.link && (
                          <span className="text-slate-400 font-normal text-xs print:hidden">
                            (
                            <PreviewField path={`projects.${proj.id}.link`}>
                              {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                            </PreviewField>
                            )
                          </span>
                        )}
                      </h3>
                      {proj.link && (
                        <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline font-medium print:block hidden" style={{ color: primaryColor }}>
                          {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <PreviewField path={`projects.${proj.id}.description`} className="w-full">
                        {renderMarkdownHTML(proj.description, "text-xs sm:text-sm text-slate-660")}
                      </PreviewField>
                    )}
                    {proj.technologies && (
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        <span className="text-slate-700 font-semibold">Tech:</span>{" "}
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
      )
    );

    const renderExperienceSection = () => (
      experience && experience.length > 0 && (
        <PreviewSection section="experience" label="Experience">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
              {t("workExperience", lang)}
            </h2>
            <div className="space-y-4 print:space-y-3">
              {experience.map((exp, idx) => (
                <PreviewItem
                  key={exp.id}
                  section="experience"
                  id={exp.id}
                  index={idx}
                  totalCount={experience.length}
                >
                  <div className="space-y-1 break-inside-avoid">
                    <div className="flex justify-between items-baseline text-xs sm:text-sm">
                      <h3 className="text-slate-900 font-bold">
                        <PreviewField path={`experience.${exp.id}.position`}>
                          {exp.position}
                        </PreviewField>{" "}
                        <span className="text-slate-400 font-normal">at</span>{" "}
                        <PreviewField path={`experience.${exp.id}.company`}>
                          {exp.company}
                        </PreviewField>
                      </h3>
                      <span className="text-slate-500 font-medium whitespace-nowrap text-xs">
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
                        {renderMarkdownHTML(exp.description, "text-xs sm:text-sm text-slate-650")}
                      </PreviewField>
                    )}
                  </div>
                </PreviewItem>
              ))}
            </div>
          </section>
        </PreviewSection>
      )
    );

    return (
      <div
        ref={ref}
        className="w-full text-slate-855 p-8 sm:p-12 font-sans selection:bg-slate-100 print:p-16 animate-in fade-in duration-300"
        style={{ boxSizing: "border-box", backgroundColor: data.theme?.backgroundColor || "#ffffff" }}
      >
        {/* Header - Centered */}
        <header className="flex flex-col items-center text-center border-b pb-6 mb-6" style={{ borderColor: primaryColor }}>
          {personalInfo.photo && (
            <div className={`overflow-hidden border border-slate-200 shadow-xs mb-4 ${
              data.theme?.photoAspectRatio === "4:6"
                ? "h-36 w-24 rounded-xl"
                : "h-32 w-24 rounded-xl"
            }`}>
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            <PreviewField path="personalInfo.fullName">
              {personalInfo.fullName || "Your Name"}
            </PreviewField>
          </h1>
          <p className="text-md font-semibold tracking-wide mt-1 uppercase" style={{ color: primaryColor }}>
            <PreviewField path="personalInfo.jobTitle">
              {personalInfo.jobTitle || "Professional Title"}
            </PreviewField>
          </p>
          {personalInfo.targetRole && (
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {t("appliedFor", lang)}:{" "}
              <PreviewField path="personalInfo.targetRole">
                {personalInfo.targetRole}
              </PreviewField>
            </p>
          )}

          {/* Contact details inline */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600 w-full mt-4">
            {personalInfo.email && (
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                <Mail className="h-3.5 w-3.5 text-slate-400 print:hidden" />
                <PreviewField path="personalInfo.email">
                  {personalInfo.email}
                </PreviewField>
              </a>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400 print:hidden" />
                <PreviewField path="personalInfo.phone">
                  {personalInfo.phone}
                </PreviewField>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 print:hidden" />
                <PreviewField path="personalInfo.location">
                  {personalInfo.location}
                </PreviewField>
              </div>
            )}
          </div>

          {/* Social Links inline */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 mt-2">
            {personalInfo.github && (
              <a href={formatUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                <Github className="h-3 w-3 print:hidden" />
                <PreviewField path="personalInfo.github">
                  {getLinkLabel(personalInfo.github)}
                </PreviewField>
              </a>
            )}
            {personalInfo.linkedin && (
              <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                <Linkedin className="h-3 w-3 print:hidden" />
                <PreviewField path="personalInfo.linkedin">
                  {getLinkLabel(personalInfo.linkedin)}
                </PreviewField>
              </a>
            )}
            {personalInfo.portfolio && (
              <a href={formatUrl(personalInfo.portfolio)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                <Globe className="h-3 w-3 print:hidden" />
                <PreviewField path="personalInfo.portfolio">
                  {getLinkLabel(personalInfo.portfolio)}
                </PreviewField>
              </a>
            )}
          </div>
        </header>

        {/* Content sections */}
        <div className="space-y-6 print:space-y-4">
          
          {/* Professional Summary */}
          {professionalSummary && (
            <PreviewSection section="summary">
              <section className="space-y-2">
                <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
                  {t("professionalSummary", lang)}
                </h2>
                <PreviewField path="professionalSummary" className="w-full">
                  {renderMarkdownHTML(professionalSummary, "text-xs sm:text-sm text-slate-650")}
                </PreviewField>
              </section>
            </PreviewSection>
          )}

          {/* Career Focus & Objective Pitch */}
          {data.theme?.showPitch && data.theme?.professionalPitch && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
                {t("careerObjective", lang)}
              </h2>
              <div 
                className="p-3 rounded-lg text-xs sm:text-sm text-slate-700 leading-relaxed text-justify"
                style={{ backgroundColor: `${primaryColor}03` }}
              >
                {data.theme.professionalPitch}
              </div>
            </section>
          )}

          {data.theme?.experienceLevel === "entry" ? (
            <>
              {renderEducationSection()}
              {renderProjectsSection()}
              {renderExperienceSection()}
            </>
          ) : (
            <>
              {renderExperienceSection()}
              {renderEducationSection()}
              {renderProjectsSection()}
            </>
          )}

          {/* Skills & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 break-inside-avoid">
            {skills && skills.length > 0 && (
              <PreviewSection section="skills" label="Skill">
                <section className="space-y-2">
                  <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
                    {t("skills", lang)}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded text-xs font-medium border"
                        style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08`, color: primaryColor }}
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
                  <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
                    {t("languages", lang)}
                  </h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                    {languages.map((langItem, idx) => (
                      <PreviewItem
                        key={langItem.id}
                        section="languages"
                        id={langItem.id}
                        index={idx}
                        totalCount={languages.length}
                      >
                        <div className="flex justify-between items-center text-xs w-full pr-14 sm:pr-0">
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
              <section className="space-y-3 pt-2">
                <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
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
                      <div className="space-y-0.5 break-inside-avoid text-xs sm:text-sm">
                        <h3 className="text-slate-900 font-bold">
                          <PreviewField path={`references.${ref.id}.name`}>
                            {ref.name}
                          </PreviewField>
                        </h3>
                        {ref.relationship && ref.company ? (
                          <p className="text-slate-655 font-medium text-xs">
                            <PreviewField path={`references.${ref.id}.relationship`}>
                              {ref.relationship}
                            </PreviewField>{" "}
                            at{" "}
                            <PreviewField path={`references.${ref.id}.company`}>
                              {ref.company}
                            </PreviewField>
                          </p>
                        ) : ref.relationship || ref.company ? (
                          <p className="text-slate-655 font-medium text-xs">
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
                        <div className="text-slate-500 text-xs flex flex-wrap gap-x-2 mt-0.5 font-medium">
                          {ref.email && (
                            <a href={`mailto:${ref.email}`} className="hover:text-slate-900 transition-colors">
                              {t("email", lang)}:{" "}
                              <PreviewField path={`references.${ref.id}.email`}>
                                {ref.email}
                              </PreviewField>
                            </a>
                          )}
                          {ref.email && ref.phone && <span className="text-slate-300">•</span>}
                          {ref.phone && (
                            <span>
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
              <section className="space-y-3 pt-2 break-inside-avoid">
                <h2 className="text-xs font-bold tracking-wider uppercase border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
                  {sec.name}
                </h2>
                <div className="space-y-3 print:space-y-2">
                  {sec.items.map((item, idx) => (
                    <PreviewItem
                      key={item.id}
                      section={`customSections.${sec.id}`}
                      id={item.id}
                      index={idx}
                      totalCount={sec.items.length}
                    >
                      <div className="space-y-1 break-inside-avoid text-xs sm:text-sm">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-slate-900 font-bold">
                            <PreviewField path={`customSections.${sec.id}.${item.id}.title`}>
                              {item.title || "Untitled Entry"}
                            </PreviewField>
                          </h3>
                          <span className="text-slate-500 font-medium whitespace-nowrap text-xs">
                            <PreviewField path={`customSections.${sec.id}.${item.id}.startDate`}>
                              {item.startDate}
                            </PreviewField>
                            {item.startDate && item.endDate && " – "}
                            <PreviewField path={`customSections.${sec.id}.${item.id}.endDate`}>
                              {item.endDate}
                            </PreviewField>
                          </span>
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-slate-600 font-semibold">
                            <PreviewField path={`customSections.${sec.id}.${item.id}.subtitle`}>
                              {item.subtitle}
                            </PreviewField>
                          </div>
                        )}
                        {item.description && (
                          <PreviewField path={`customSections.${sec.id}.${item.id}.description`} className="w-full">
                            {renderMarkdownHTML(item.description, "text-xs sm:text-sm text-slate-655")}
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

CVTemplateMinimalist.displayName = "CVTemplateMinimalist";
