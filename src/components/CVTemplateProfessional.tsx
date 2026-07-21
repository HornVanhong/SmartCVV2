import React from "react";
import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Calendar, Flag, Briefcase, Award, BookOpen, User } from "lucide-react";
import { t } from "@/lib/translations";
import { formatUrl, renderMarkdownHTML } from "@/lib/utils";
import { PreviewSection, PreviewItem, PreviewField } from "@/components/PreviewInteractive";

interface CVTemplateProfessionalProps {
  data: CVData;
}

export const CVTemplateProfessional = React.forwardRef<HTMLDivElement, CVTemplateProfessionalProps>(
  ({ data }, ref) => {
    const { personalInfo, professionalSummary, education, skills, projects, experience, languages, references, customSections } = data;
    const primaryColor = data.theme?.primaryColor || "#2563eb";
    const lang = data.theme?.language || "en";

    return (
      <div
        ref={ref}
        className="w-full text-slate-800 font-sans selection:bg-slate-100 min-h-[inherit] flex flex-col print:p-0"
        style={{ boxSizing: "border-box" }}
      >
        {/* Full-width Solid Header Banner */}
        <header className="relative w-full text-white px-8 py-8 sm:py-10 print:py-8 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10">
            {/* White border Photo offset */}
            {personalInfo.photo && (
              <div className={`rounded-sm overflow-hidden border-3 border-white bg-white shadow-md sm:-mb-14 print:-mb-14 ${
                data.theme?.photoAspectRatio === "4:6"
                  ? "h-36 w-24"
                  : "h-32 w-24"
              }`}>
                <img
                  src={personalInfo.photo}
                  alt={personalInfo.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="text-center sm:text-left print:text-left sm:pl-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
                <PreviewField path="personalInfo.fullName">
                  {personalInfo.fullName || "Your Name"}
                </PreviewField>
              </h1>
              <p className="text-sm font-semibold tracking-widest uppercase text-white/80 mt-1">
                <PreviewField path="personalInfo.jobTitle">
                  {personalInfo.jobTitle || "Professional Title"}
                </PreviewField>
              </p>
            </div>
          </div>
        </header>

        {/* Layout Split Container */}
        <div className="flex-1 flex flex-col sm:flex-row print:flex-row px-8 py-10 sm:pt-16 print:pt-16 sm:pb-8 print:pb-8 gap-8">
          
          {/* Left Column (Sidebar) */}
          <aside className="w-full sm:w-[260px] print:w-[240px] flex flex-col gap-6 shrink-0">
            
            {/* Contact Information block */}
            <div className="space-y-3">
              <div className="space-y-2 text-xs font-medium text-slate-700">
                {personalInfo.phone && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 shrink-0 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <PreviewField path="personalInfo.phone">
                      {personalInfo.phone}
                    </PreviewField>
                  </div>
                )}
                {personalInfo.email && (
                  <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2.5 hover:text-slate-900 transition-colors">
                    <div className="h-6 w-6 shrink-0 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <PreviewField path="personalInfo.email" className="truncate">
                      {personalInfo.email}
                    </PreviewField>
                  </a>
                )}
                {personalInfo.dob && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 shrink-0 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <span>
                      {lang === "km" ? "ថ្ងៃខែឆ្នាំកំណើត" : "Date of Birth"}:{" "}
                      <PreviewField path="personalInfo.dob">
                        {personalInfo.dob}
                      </PreviewField>
                    </span>
                  </div>
                )}
                {personalInfo.nationality && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 shrink-0 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                      <Flag className="h-3.5 w-3.5" />
                    </div>
                    <span>
                      {lang === "km" ? "សញ្ជាតិ" : "Nationality"}:{" "}
                      <PreviewField path="personalInfo.nationality">
                        {personalInfo.nationality}
                      </PreviewField>
                    </span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 shrink-0 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <PreviewField path="personalInfo.location">
                      {personalInfo.location}
                    </PreviewField>
                  </div>
                )}
              </div>
            </div>

            {/* Education Section (Solid box title) */}
            {education && education.length > 0 && (
              <PreviewSection section="education" label="Education">
                <div className="space-y-2.5">
                  <h2 className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-sm" style={{ backgroundColor: primaryColor }}>
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
                        <div className="space-y-0.5 text-xs w-full pr-12 sm:pr-0">
                          <h4 className="font-bold text-slate-900 leading-snug">
                            <PreviewField path={`education.${edu.id}.major`}>
                              {edu.major}
                            </PreviewField>
                          </h4>
                          <p className="text-slate-500 font-semibold text-[10px]">
                            <PreviewField path={`education.${edu.id}.school`}>
                              {edu.school}
                            </PreviewField>
                          </p>
                          <p className="text-slate-400 font-semibold text-[9px]">
                            <PreviewField path={`education.${edu.id}.startDate`}>
                              {edu.startDate}
                            </PreviewField>{" "}
                            -{" "}
                            <PreviewField path={`education.${edu.id}.endDate`}>
                              {edu.endDate || t("present", lang)}
                            </PreviewField>
                          </p>
                        </div>
                      </PreviewItem>
                    ))}
                  </div>
                </div>
              </PreviewSection>
            )}

            {/* Skills Section (Solid box title) */}
            {skills && skills.length > 0 && (
              <PreviewSection section="skills" label="Skill">
                <div className="space-y-2.5">
                  <h2 className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-sm" style={{ backgroundColor: primaryColor }}>
                    {t("skills", lang)}
                  </h2>
                  <ul className="list-disc pl-4 space-y-1 text-xs font-medium text-slate-700">
                    {skills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </PreviewSection>
            )}

            {/* Languages Section (Solid box title) */}
            {languages && languages.length > 0 && (
              <PreviewSection section="languages" label="Language">
                <div className="space-y-2.5">
                  <h2 className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-sm" style={{ backgroundColor: primaryColor }}>
                    {t("languages", lang)}
                  </h2>
                  <div className="space-y-1.5">
                    {languages.map((langItem, idx) => (
                      <PreviewItem
                        key={langItem.id}
                        section="languages"
                        id={langItem.id}
                        index={idx}
                        totalCount={languages.length}
                      >
                        <div className="flex justify-between items-center text-xs w-full pr-12 sm:pr-0">
                          <span className="font-bold text-slate-800">
                            <PreviewField path={`languages.${langItem.id}.name`}>
                              {langItem.name}
                            </PreviewField>
                          </span>
                          <span className="text-slate-500 font-medium italic text-[11px]">
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

          {/* Right Column (Main Panel) */}
          <main className="flex-1 flex flex-col gap-6">
            
            {/* Profile/Summary */}
            {professionalSummary && (
              <PreviewSection section="summary">
                <section className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-1" style={{ borderColor: `${primaryColor}20` }}>
                    <User className="h-4.5 w-4.5" style={{ color: primaryColor }} />
                    {t("profile", lang)}
                  </h2>
                  <PreviewField path="professionalSummary" className="w-full">
                    {renderMarkdownHTML(professionalSummary, "text-xs sm:text-sm text-slate-650 leading-relaxed text-justify")}
                  </PreviewField>
                </section>
              </PreviewSection>
            )}

            {/* Work Experience */}
            {experience && experience.length > 0 && (
              <PreviewSection section="experience" label="Experience">
                <section className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-1" style={{ borderColor: `${primaryColor}20` }}>
                    <Briefcase className="h-4.5 w-4.5" style={{ color: primaryColor }} />
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
                        <div className="flex flex-col sm:flex-row print:flex-row gap-2 sm:gap-4 print:gap-4 break-inside-avoid w-full pr-12 sm:pr-0">
                          {/* Left dates column */}
                          <div className="w-[120px] shrink-0 text-xs font-bold text-slate-500 whitespace-nowrap">
                            <PreviewField path={`experience.${exp.id}.startDate`}>
                              {exp.startDate}
                            </PreviewField>{" "}
                            –{" "}
                            <PreviewField path={`experience.${exp.id}.endDate`}>
                              {exp.endDate || t("present", lang)}
                            </PreviewField>
                          </div>
                          {/* Right desc column */}
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              <PreviewField path={`experience.${exp.id}.position`}>
                                {exp.position}
                              </PreviewField>{" "}
                              at{" "}
                              <span className="font-semibold text-slate-700">
                                <PreviewField path={`experience.${exp.id}.company`}>
                                  {exp.company}
                                </PreviewField>
                              </span>
                            </h4>
                            {exp.description && (
                              <PreviewField path={`experience.${exp.id}.description`} className="w-full">
                                {renderMarkdownHTML(exp.description, "text-xs sm:text-sm text-slate-650 leading-relaxed whitespace-pre-line text-justify")}
                              </PreviewField>
                            )}
                          </div>
                        </div>
                      </PreviewItem>
                    ))}
                  </div>
                </section>
              </PreviewSection>
            )}

            {/* Projects / Training Courses */}
            {projects && projects.length > 0 && (
              <PreviewSection section="projects" label="Project">
                <section className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-1" style={{ borderColor: `${primaryColor}20` }}>
                    <Award className="h-4.5 w-4.5" style={{ color: primaryColor }} />
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
                        <div className="space-y-1 break-inside-avoid text-xs w-full pr-12 sm:pr-0">
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <PreviewField path={`projects.${proj.id}.name`}>
                              {proj.name}
                            </PreviewField>
                            {proj.link && (
                              <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-[10px] hover:underline font-semibold" style={{ color: primaryColor }}>
                                (
                                <PreviewField path={`projects.${proj.id}.link`}>
                                  {proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}
                                </PreviewField>
                                )
                              </a>
                            )}
                          </h4>
                          {proj.description && (
                            <PreviewField path={`projects.${proj.id}.description`} className="w-full">
                              {renderMarkdownHTML(proj.description, "text-slate-650 leading-relaxed text-justify")}
                            </PreviewField>
                          )}
                          {proj.technologies && (
                            <div className="text-[10px] text-slate-500 font-medium">
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

            {/* References */}
            {references && references.length > 0 && (
              <PreviewSection section="references" label="Reference">
                <section className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-1" style={{ borderColor: `${primaryColor}20` }}>
                    <BookOpen className="h-4.5 w-4.5" style={{ color: primaryColor }} />
                    {t("references", lang)}
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
                        <div className="space-y-0.5 break-inside-avoid text-xs w-full pr-12 sm:pr-0">
                          <h3 className="text-slate-900 font-bold">
                            <PreviewField path={`references.${ref.id}.name`}>
                              {ref.name}
                            </PreviewField>
                          </h3>
                          {ref.relationship && ref.company ? (
                            <p className="text-slate-600 font-semibold text-[10px] leading-tight">
                              <PreviewField path={`references.${ref.id}.relationship`}>
                                {ref.relationship}
                              </PreviewField>{" "}
                              at{" "}
                              <PreviewField path={`references.${ref.id}.company`}>
                                {ref.company}
                              </PreviewField>
                            </p>
                          ) : ref.relationship || ref.company ? (
                            <p className="text-slate-600 font-semibold text-[10px] leading-tight">
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
                          <div className="text-slate-500 text-[10px] space-y-0.5 mt-1 font-medium">
                            {ref.email && (
                              <a href={`mailto:${ref.email}`} className="hover:text-slate-955 transition-colors block">
                                {t("email", lang)}:{" "}
                                <PreviewField path={`references.${ref.id}.email`}>
                                  {ref.email}
                                </PreviewField>
                              </a>
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
                <section className="space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b pb-1" style={{ borderColor: `${primaryColor}20` }}>
                    <Award className="h-4.5 w-4.5" style={{ color: primaryColor }} />
                    {sec.name}
                  </h2>
                  <div className="space-y-4">
                    {sec.items.map((item, idx) => (
                      <PreviewItem
                        key={item.id}
                        section={`customSections.${sec.id}`}
                        id={item.id}
                        index={idx}
                        totalCount={sec.items.length}
                      >
                        <div className="flex flex-col sm:flex-row print:flex-row gap-2 sm:gap-4 print:gap-4 break-inside-avoid w-full pr-12 sm:pr-0">
                          {/* Left dates column */}
                          <div className="w-[120px] shrink-0 text-xs font-bold text-slate-500 whitespace-nowrap">
                            <PreviewField path={`customSections.${sec.id}.${item.id}.startDate`}>
                              {item.startDate}
                            </PreviewField>
                            {item.startDate && item.endDate && " – "}
                            <PreviewField path={`customSections.${sec.id}.${item.id}.endDate`}>
                              {item.endDate}
                            </PreviewField>
                          </div>
                          {/* Right desc column */}
                          <div className="flex-1 space-y-1 text-xs">
                            <h4 className="font-bold text-slate-900 leading-snug">
                              <PreviewField path={`customSections.${sec.id}.${item.id}.title`}>
                                {item.title || "Untitled Entry"}
                              </PreviewField>{" "}
                              {item.subtitle && (
                                <>
                                  at{" "}
                                  <span className="font-semibold text-slate-700">
                                    <PreviewField path={`customSections.${sec.id}.${item.id}.subtitle`}>
                                      {item.subtitle}
                                    </PreviewField>
                                  </span>
                                </>
                              )}
                            </h4>
                            {item.description && (
                              <PreviewField path={`customSections.${sec.id}.${item.id}.description`} className="w-full">
                                {renderMarkdownHTML(item.description, "text-xs sm:text-sm text-slate-650 leading-relaxed whitespace-pre-line text-justify")}
                              </PreviewField>
                            )}
                          </div>
                        </div>
                      </PreviewItem>
                    ))}
                  </div>
                </section>
              </PreviewSection>
            ))}

          </main>
        </div>
      </div>
    );
  }
);

CVTemplateProfessional.displayName = "CVTemplateProfessional";
