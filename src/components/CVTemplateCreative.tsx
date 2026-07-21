import React from "react";
import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Github, Linkedin, Globe } from "lucide-react";
import { t, getSectionName } from "@/lib/translations";
import { formatUrl, getLinkLabel, isLightColor, renderMarkdownHTML, getSocialIcon } from "@/lib/utils";
import { PreviewSection, PreviewItem, PreviewField } from "@/components/PreviewInteractive";

interface CVTemplateCreativeProps {
  data: CVData;
}

export const CVTemplateCreative = React.forwardRef<HTMLDivElement, CVTemplateCreativeProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references, customSections } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";
    
    const isLight = !data.theme?.sidebarBackgroundColor || isLightColor(data.theme.sidebarBackgroundColor);
    const textNameClass = isLight ? "text-slate-900" : "text-white";
    const textTitleClass = data.theme?.primaryColor ? "text-slate-550" : "text-slate-300";
    const textHeaderClass = isLight ? "text-slate-400" : "text-white/60";
    const textBodyClass = isLight ? "text-slate-655" : "text-slate-200/90";
    const textMutedClass = isLight ? "text-slate-500" : "text-slate-300";
    const borderClass = isLight ? "border-slate-200/60" : "border-white/15";
    const sidebarBg = data.theme?.sidebarBackgroundColor || "rgba(241, 245, 249, 0.7)";

    // Helpers to render sections
    const renderEducationSection = () => (
      education && education.length > 0 && (
        <PreviewSection section="education" label="Education">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
              {getSectionName("education", data)}
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
                      <span className="text-slate-500 font-semibold whitespace-nowrap text-xs pl-2">
                        <PreviewField path={`education.${edu.id}.startDate`}>
                          {edu.startDate}
                        </PreviewField>{" "}
                        –{" "}
                        <PreviewField path={`education.${edu.id}.endDate`}>
                          {edu.endDate || t("present", lang)}
                        </PreviewField>
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-bold">
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
            <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
              {getSectionName("projects", data)}
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
                      <h3 className="text-slate-900 font-bold flex items-center gap-1.5 leading-snug">
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
                        <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline font-semibold print:block hidden shrink-0 pl-2" style={{ color: primaryColor }}>
                          {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <PreviewField path={`projects.${proj.id}.description`} className="w-full">
                        {renderMarkdownHTML(proj.description, "text-xs sm:text-sm text-slate-650")}
                      </PreviewField>
                    )}
                    {proj.technologies && (
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
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
      )
    );

    const renderExperienceSection = () => (
      experience && experience.length > 0 && (
        <PreviewSection section="experience" label="Experience">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
              {getSectionName("workExperience", data)}
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
                    <div className="flex justify-between items-start text-xs sm:text-sm">
                      <h3 className="text-slate-900 font-bold leading-snug">
                        <PreviewField path={`experience.${exp.id}.position`}>
                          {exp.position}
                        </PreviewField>{" "}
                        <span className="text-slate-400 font-normal">at</span>{" "}
                        <PreviewField path={`experience.${exp.id}.company`}>
                          {exp.company}
                        </PreviewField>
                      </h3>
                      <span className="text-slate-500 font-semibold whitespace-nowrap text-xs pl-2">
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
        className="w-full text-slate-800 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col sm:flex-row print:flex-row"
        style={{ boxSizing: "border-box", backgroundColor: data.theme?.backgroundColor || "#ffffff" }}
      >
        {/* Left Sidebar */}
        <aside 
          className="w-full sm:w-[280px] print:w-[260px] border-r p-6 sm:p-8 print:p-8 flex flex-col gap-6 shrink-0"
          style={{ boxSizing: "border-box", backgroundColor: sidebarBg, borderColor: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.1)" }}
        >
          {/* Profile Photo */}
          {personalInfo.photo && (
            <div className={`rounded-2xl overflow-hidden border shadow-xs mx-auto shrink-0 ${
              data.theme?.photoAspectRatio === "4:6"
                ? "h-36 w-24"
                : "h-32 w-24"
            }`}
            style={{ borderColor: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.15)" }}
            >
              <img
                src={personalInfo.photo}
                alt={personalInfo.fullName}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Name & Title */}
          <div className="text-center sm:text-left print:text-left space-y-1">
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${textNameClass}`}>
              <PreviewField path="personalInfo.fullName">
                {personalInfo.fullName || "Your Name"}
              </PreviewField>
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
              <PreviewField path="personalInfo.jobTitle">
                {personalInfo.jobTitle || "Professional Title"}
              </PreviewField>
            </p>
            {personalInfo.targetRole && (
              <p className={`text-[10px] font-bold uppercase tracking-widest pt-0.5 ${textMutedClass}`}>
                {t("appliedFor", lang)}:{" "}
                <PreviewField path="personalInfo.targetRole">
                  {personalInfo.targetRole}
                </PreviewField>
              </p>
            )}
          </div>
 
          {/* Contact Details */}
          <div className={`space-y-3 pt-2 border-t ${borderClass}`}>
            <h3 className={`text-[10px] font-extrabold uppercase tracking-widest ${textHeaderClass}`}>{t("contact", lang)}</h3>
            <div className={`space-y-2 text-xs ${textBodyClass}`}>
              {personalInfo.email && (
                <a href={`mailto:${personalInfo.email}`} className={`flex items-center gap-2 transition-colors ${isLight ? "hover:text-slate-950" : "hover:text-white"}`}>
                  <Mail className={`h-3.5 w-3.5 shrink-0 ${isLight ? "text-slate-400" : "text-slate-350"}`} />
                  <PreviewField path="personalInfo.email" className="truncate flex-1">
                    {personalInfo.email}
                  </PreviewField>
                </a>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className={`h-3.5 w-3.5 shrink-0 ${isLight ? "text-slate-400" : "text-slate-350"}`} />
                  <PreviewField path="personalInfo.phone">
                    {personalInfo.phone}
                  </PreviewField>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className={`h-3.5 w-3.5 shrink-0 ${isLight ? "text-slate-400" : "text-slate-350"}`} />
                  <PreviewField path="personalInfo.location">
                    {personalInfo.location}
                  </PreviewField>
                </div>
              )}
            </div>
          </div>
 
          {/* Social Links */}
          <div className={`space-y-3 pt-2 border-t ${borderClass}`}>
            <h3 className={`text-[10px] font-extrabold uppercase tracking-widest ${textHeaderClass}`}>Socials</h3>
            <div className={`space-y-2 text-xs ${textBodyClass}`}>
              {personalInfo.github && (
                <a href={formatUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isLight ? "hover:text-slate-955" : "hover:text-white"}`}>
                  {getSocialIcon(personalInfo.github, `h-3.5 w-3.5 shrink-0 ${isLight ? "text-slate-400" : "text-slate-350"}`)}
                  <PreviewField path="personalInfo.github" className="truncate flex-1">
                    {getLinkLabel(personalInfo.github)}
                  </PreviewField>
                </a>
              )}
              {personalInfo.linkedin && (
                <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isLight ? "hover:text-slate-955" : "hover:text-white"}`}>
                  {getSocialIcon(personalInfo.linkedin, `h-3.5 w-3.5 shrink-0 ${isLight ? "text-slate-400" : "text-slate-350"}`)}
                  <PreviewField path="personalInfo.linkedin" className="truncate flex-1">
                    {getLinkLabel(personalInfo.linkedin)}
                  </PreviewField>
                </a>
              )}
              {personalInfo.portfolio && (
                <a href={formatUrl(personalInfo.portfolio)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 transition-colors ${isLight ? "hover:text-slate-955" : "hover:text-white"}`}>
                  {getSocialIcon(personalInfo.portfolio, `h-3.5 w-3.5 shrink-0 ${isLight ? "text-slate-400" : "text-slate-350"}`)}
                  <PreviewField path="personalInfo.portfolio" className="truncate flex-1">
                    {getLinkLabel(personalInfo.portfolio)}
                  </PreviewField>
                </a>
              )}
            </div>
          </div>
 
          {/* Skills */}
          {skills && skills.length > 0 && (
            <PreviewSection section="skills" label="Skill">
              <div className={`space-y-3 pt-2 border-t ${borderClass}`}>
                <h3 className={`text-[10px] font-extrabold uppercase tracking-widest ${textHeaderClass}`}>{getSectionName("skills", data)}</h3>
                <div className="space-y-2 text-xs">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                      <span className={`font-semibold text-[11px] ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </PreviewSection>
          )}
 
          {/* Languages */}
          {languages && languages.length > 0 && (
            <PreviewSection section="languages" label="Language">
              <div className={`space-y-3 pt-2 border-t ${borderClass}`}>
                <h3 className={`text-[10px] font-extrabold uppercase tracking-widest ${textHeaderClass}`}>{getSectionName("languages", data)}</h3>
                <div className="space-y-1.5">
                  {languages.map((langItem, idx) => (
                    <PreviewItem
                      key={langItem.id}
                      section="languages"
                      id={langItem.id}
                      index={idx}
                      totalCount={languages.length}
                    >
                      <div className={`flex justify-between items-center text-xs w-full pr-8 sm:pr-0`}>
                        <span className={`font-bold ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                          <PreviewField path={`languages.${langItem.id}.name`}>
                            {langItem.name}
                          </PreviewField>
                        </span>
                        <span className={`font-medium italic text-[11px] ${textMutedClass}`}>
                          <PreviewField path={`languages.${langItem.id}.level`}>
                            {langItem.level}
                          </PreviewField>
                        </span>
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </div>
            </PreviewSection>
          )}
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 p-6 sm:p-8 print:p-8 space-y-6">
          
          {/* Professional Summary */}
          {professionalSummary && (
            <PreviewSection section="summary">
              <section className="space-y-2">
                <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
                  {getSectionName("professionalSummary", data)}
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
              <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
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

          {/* Dynamic Section Ordering */}
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

          {/* References inside main panel */}
          {references && references.length > 0 && (
            <PreviewSection section="references" label="Reference">
              <section className="space-y-3">
                <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
                  {getSectionName("references", data)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
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
                          <p className="text-slate-650 font-semibold text-xs leading-none">
                            <PreviewField path={`references.${ref.id}.relationship`}>
                              {ref.relationship}
                            </PreviewField>{" "}
                            at{" "}
                            <PreviewField path={`references.${ref.id}.company`}>
                              {ref.company}
                            </PreviewField>
                          </p>
                        ) : ref.relationship || ref.company ? (
                          <p className="text-slate-655 font-semibold text-xs leading-none">
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
                            <a href={`mailto:${ref.email}`} className="hover:text-slate-950 transition-colors">
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
              <section className="space-y-3 break-inside-avoid">
                <h2 className="text-xs font-bold tracking-wider uppercase border-b-2 pb-1 text-slate-900" style={{ borderColor: primaryColor }}>
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
                          <span className="text-slate-500 font-semibold whitespace-nowrap text-xs pl-2">
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
                          <div className="text-xs text-slate-600 font-bold">
                            <PreviewField path={`customSections.${sec.id}.${item.id}.subtitle`}>
                              {item.subtitle}
                            </PreviewField>
                          </div>
                        )}
                        {item.description && (
                          <PreviewField path={`customSections.${sec.id}.${item.id}.description`} className="w-full">
                            {renderMarkdownHTML(item.description, "text-xs sm:text-sm text-slate-650")}
                          </PreviewField>
                        )}
                      </div>
                    </PreviewItem>
                  ))}
                </div>
              </section>
            </PreviewSection>
          ))}
        </main>
      </div>
    );
  }
);

CVTemplateCreative.displayName = "CVTemplateCreative";
