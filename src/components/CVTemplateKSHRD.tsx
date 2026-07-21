import React from "react";
import { CVData } from "@/types/cv";
import { parseInlineMarkdown, renderMarkdownHTML } from "@/lib/utils";

interface CVTemplateKSHRDProps {
  data: CVData;
  pageNumber?: number;
}

export const CVTemplateKSHRD: React.FC<CVTemplateKSHRDProps> = ({ data, pageNumber = 1 }) => {
  const { personalInfo, education = [], experience = [], languages = [], references = [], theme } = data;
  const primaryColor = theme?.primaryColor || "#102a54";
  const photoScale = Math.min(125, Math.max(80, theme?.photoScale ?? 100)) / 100;
  const logoScale = Math.min(250, Math.max(80, theme?.logoScale ?? 100)) / 100;
  const photoDimensions = {
    width: `${112 * photoScale}px`,
    height: `${144 * photoScale}px`,
  };
  const logoDimensions = {
    // Uploaded logo files often include generous transparent/white padding.
    // Use a large canvas so the visible mark remains legible in the header.
    width: `${90 * logoScale}px`,
    height: `${90 * logoScale}px`,
  };

  // Helper to parse highlight text (wrapping ==text== in span)
  const parseHighlightHTML = (text: string | undefined): React.ReactNode => {
    if (!text) return "";
    const tokens = parseInlineMarkdown(text);
    return tokens.map((token, idx) => {
      if (token.type === "bold") {
        return <strong key={idx} className="font-bold text-slate-900">{token.content}</strong>;
      }
      if (token.type === "italic") {
        return <em key={idx} className="italic">{token.content}</em>;
      }
      if (token.type === "highlight") {
        return (
          <span key={idx} className="bg-yellow-250 px-1 py-0.5 rounded font-bold text-slate-900 mx-0.5 inline-block">
            {token.content}
          </span>
        );
      }
      return token.content;
    });
  };

  // Helper to render colons row
  const renderRow = (label: string, value: React.ReactNode, indent: boolean = false) => {
    if (!value) return null;
    const renderedValue = typeof value === "string" ? parseHighlightHTML(value) : value;
    return (
      <div className="grid grid-cols-[140px_20px_1fr] text-xs sm:text-[13px] text-slate-800 leading-relaxed items-start my-1.5 font-serif">
        <span className={`font-semibold text-slate-700 ${indent ? "pl-4 border-l border-slate-250" : ""}`}>{label}</span>
        <span className="text-center text-slate-700 font-bold">:</span>
        <span className="text-slate-800 break-words">{renderedValue}</span>
      </div>
    );
  };

  // Partition HRD items from academic and work items
  const isHRD = (name?: string) => {
    if (!name) return false;
    const lower = name.toLowerCase();
    return lower.includes("hrd") || lower.includes("korea software") || lower.includes("ksign");
  };

  const hrdTraineeItems = [
    ...education.filter(edu => isHRD(edu.school)).map(edu => ({ ...edu, type: "edu", name: edu.school })),
    ...experience.filter(exp => isHRD(exp.company)).map(exp => ({ ...exp, type: "exp", name: exp.company }))
  ];

  const academicItems = education.filter(edu => !isHRD(edu.school));
  const workItems = experience.filter(exp => !isHRD(exp.company));

  return (
    <div 
      className="p-8 sm:p-12 flex flex-col font-serif text-slate-900 min-h-full leading-normal" 
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-center gap-4 border-b-2 pb-3" style={{ borderColor: primaryColor }}>
        {/* Left: Logo Emblem */}
        <div className="flex flex-col items-center shrink-0 w-40">
          {personalInfo.logo ? (
            <img 
              src={personalInfo.logo} 
              alt="Logo" 
              className="object-contain"
              style={logoDimensions}
            />
          ) : (
            <>
              <svg viewBox="0 0 100 100" className="object-contain" style={logoDimensions}>
                <circle cx="50" cy="50" r="45" stroke="#102a54" strokeWidth="2.5" fill="none" />
                <circle cx="50" cy="50" r="32" stroke="#102a54" strokeWidth="1" fill="none" />
                <g transform="rotate(-30 50 50)">
                  <path d="M 50 20 A 15 15 0 0 0 50 50 A 15 15 0 0 1 50 80 A 30 30 0 0 1 50 20" fill="#e82c2a" />
                  <path d="M 50 20 A 30 30 0 0 0 50 80 A 15 15 0 0 1 50 50 A 15 15 0 0 0 50 20" fill="#0f4c81" />
                </g>
                <path d="M 50 5 L 50 20 M 50 80 L 50 95 M 5 50 L 20 50 M 80 50 L 95 50" stroke="#102a54" strokeWidth="2" />
              </svg>
              <span className="text-[7px] text-center font-bold text-slate-600 mt-1 leading-tight tracking-tighter">
                កូរ៉េ សូហ្វវែរ អេចអរឌី សេនធ័រ<br />
                Korea Software HRD Center
              </span>
            </>
          )}
        </div>

        {/* Center: Contact details */}
        <div className="flex-1 text-center flex flex-col items-center">
          <h2 className="text-xs sm:text-sm font-bold text-[#102a54] uppercase tracking-wide">
            Korea Software HRD Center Student&apos;s Background
          </h2>
          <p className="text-[10px] sm:text-xs text-[#102a54] font-medium mt-1">
            #12, St 323, Boeungkak II Commune, Toul Kork District, Phnom Penh.
          </p>
          <p className="text-[10px] sm:text-xs text-[#102a54] font-medium">
            Tel: (855) 23 99 13 14 / 012 99 89 19
          </p>
          <a href="http://www.kshrd.com.kh" target="_blank" rel="noreferrer" className="text-[10px] sm:text-xs text-blue-600 font-semibold underline hover:text-blue-800">
            www.kshrd.com.kh / FB: www.facebook.com/ksignhrd
          </a>
        </div>

        {/* Right: Headshot photo */}
        <div className="shrink-0">
          {personalInfo.photo ? (
            <img 
              src={personalInfo.photo} 
              alt={personalInfo.fullName} 
              className="object-cover border-2 rounded-none"
              style={{ ...photoDimensions, borderColor: primaryColor }}
            />
          ) : (
            <div className="bg-slate-100 border-2 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-semibold rounded-none" style={{ ...photoDimensions, borderColor: primaryColor }}>
              Photo (3x4)
            </div>
          )}
        </div>
      </div>

      {/* 2. TITLE SECTION */}
      <div className="text-center my-6">
        <h1 className="text-base sm:text-lg font-bold text-[#102a54] underline tracking-widest uppercase decoration-1 underline-offset-4">
          CURRICULUM VITAE
        </h1>
      </div>

      {/* 3. STUDENT NAME & BASIC CONTACT */}
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-extrabold text-[#102a54] uppercase mb-3">
          MR. {personalInfo.fullName}
        </h3>
        
        <div className="space-y-0.5">
          {renderRow("Address", personalInfo.location)}
          {renderRow("Phone", personalInfo.phone)}
          {renderRow("E-mail", personalInfo.email)}
        </div>
      </div>

      {/* 4. PERSONAL DATA */}
      <div className="mb-6">
        <h4 className="text-xs sm:text-[13px] font-bold text-[#102a54] underline uppercase tracking-wider mb-2 decoration-1 underline-offset-2">
          1. PERSONAL DATA
        </h4>
        <div className="space-y-0.5">
          {renderRow("Sex", personalInfo.gender || "Male")}
          {renderRow("Date of Birth", personalInfo.dob || "03-04-2004")}
          {renderRow("Place of Birth", personalInfo.placeOfBirth || "Kohkong")}
          {renderRow("Nationality", personalInfo.nationality || "Khmer")}
          {renderRow("Marital Status", personalInfo.maritalStatus || "Single")}
          {renderRow("Health Situation", personalInfo.health || "Excellent")}
        </div>
      </div>

      {/* 5. HRD CENTER TRAINEE */}
      <div className="mb-6">
        <h4 className="text-xs sm:text-[13px] font-bold text-[#102a54] underline uppercase tracking-wider mb-2 decoration-1 underline-offset-2">
          2. HRD CENTER TRAINEE
        </h4>
        
        {hrdTraineeItems.length > 0 ? (
          hrdTraineeItems.map((item, idx) => {
            const shouldHighlight = item.highlight !== undefined ? item.highlight : true;
            return (
              <div key={idx} className="mb-4 text-xs sm:text-[13px] space-y-2">
                <div className="grid grid-cols-[140px_20px_1fr] leading-relaxed items-start font-serif">
                  <span className="font-semibold text-slate-700">Basic Course</span>
                  <span className="text-center text-slate-700 font-bold">:</span>
                  <span>
                    {shouldHighlight ? (
                      <span className="bg-yellow-200 px-1 py-0.5 rounded font-semibold text-slate-900 inline-block">
                        {item.startDate} - {item.endDate || "Present"}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {item.startDate} - {item.endDate || "Present"}
                      </span>
                    )}
                  </span>
                </div>
              
                {item.description && (
                  <div className="pl-6 space-y-1.5 text-slate-700">
                    {item.description.split("\n").map((line, lIdx) => {
                      const colonIdx = line.indexOf(":");
                      if (colonIdx !== -1) {
                        const subject = line.substring(0, colonIdx).trim().replace(/^[➤\-\*]*/, "").trim();
                        const desc = line.substring(colonIdx + 1).trim();
                        return (
                          <div key={lIdx} className="flex gap-2 items-start text-xs sm:text-[13px]">
                            <span className="text-slate-800 font-bold shrink-0">➤</span>
                            <span className="font-bold text-slate-800 shrink-0">{parseHighlightHTML(subject)} :</span>
                            <span className="text-slate-700">{parseHighlightHTML(desc)}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={lIdx} className="flex gap-2 items-start text-xs sm:text-[13px]">
                          <span className="text-slate-800 font-bold shrink-0">➤</span>
                          <span className="text-slate-700">{parseHighlightHTML(line.replace(/^[➤\-\*]*/, "").trim())}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-xs sm:text-[13px] space-y-2">
            <div className="grid grid-cols-[140px_20px_1fr] leading-relaxed items-start font-serif">
              <span className="font-semibold text-slate-700">Basic Course</span>
              <span className="text-center text-slate-700 font-bold">:</span>
              <span>
                <span className="bg-yellow-200 px-1 py-0.5 rounded font-semibold text-slate-900">
                  February 02nd – July 09th, 2026, Mon-Fri, 7.5 hours per day, 810 hours
                </span>
              </span>
            </div>
            
            <div className="pl-6 space-y-1 text-slate-700">
              <div className="flex gap-2 items-start">
                <span className="text-slate-800 font-bold">➤</span>
                <span className="font-bold text-slate-800 shrink-0">JAVA :</span>
                <span>J2SE (Basic Java and OOP concepts), J2EE (Maven and MVC pattern)</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-slate-800 font-bold">➤</span>
                <span className="font-bold text-slate-800 shrink-0">WEB :</span>
                <span>HTML, CSS, JavaScript, CSS Flexbox, Tailwind CSS, JSON, Next.js</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-slate-800 font-bold">➤</span>
                <span className="font-bold text-slate-800 shrink-0">SPRING :</span>
                <span>Spring Boot, MyBatis Data Access, Spring RESTful Web Service, Spring Security, JSON Web Token</span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-slate-800 font-bold">➤</span>
                <span className="font-bold text-slate-800 shrink-0">Database :</span>
                <span>Data Modeling, PostgreSQL, SQL(Basic SQL)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. ACADEMIC BACKGROUND */}
      <div className="mb-6">
        <h4 className="text-xs sm:text-[13px] font-bold text-[#102a54] underline uppercase tracking-wider mb-2 decoration-1 underline-offset-2">
          3. ACADEMIC BACKGROUND
        </h4>
        <div className="space-y-2">
          {academicItems.length > 0 ? (
            academicItems.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[140px_20px_1fr] text-xs sm:text-[13px] text-slate-800 leading-relaxed items-start font-serif">
                <span className="font-semibold text-slate-700">
                  {edu.highlight ? (
                    <span className="bg-yellow-200 px-1 py-0.5 rounded font-semibold text-slate-900 inline-block">
                      {edu.startDate.substring(0, 4)}-{edu.endDate?.substring(0, 4) || "Present"}
                    </span>
                  ) : (
                    `${edu.startDate.substring(0, 4)}-${edu.endDate?.substring(0, 4) || "Present"}`
                  )}
                </span>
                <span className="text-center text-slate-700 font-bold">:</span>
                <div className="text-slate-800">
                  <span className="font-bold">{parseHighlightHTML(edu.major)}</span> at <span className="font-semibold text-slate-700">{parseHighlightHTML(edu.school)}</span>
                  {edu.description && <div className="mt-0.5">{renderMarkdownHTML(edu.description, "text-xs text-slate-500")}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-xs italic">No academic history entered.</div>
          )}
        </div>
      </div>

      {/* 7. WORK EXPERIENCE */}
      <div className="mb-6">
        <h4 className="text-xs sm:text-[13px] font-bold text-[#102a54] underline uppercase tracking-wider mb-2 decoration-1 underline-offset-2">
          4. WORK EXPERIENCE
        </h4>
        <div className="space-y-3">
          {workItems.length > 0 ? (
            workItems.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[140px_20px_1fr] text-xs sm:text-[13px] text-slate-800 leading-relaxed items-start font-serif">
                <span className="font-semibold text-slate-700">
                  {exp.highlight ? (
                    <span className="bg-yellow-200 px-1 py-0.5 rounded font-semibold text-slate-900 inline-block">
                      {exp.startDate.substring(0, 4)}-{exp.endDate?.substring(0, 4) || "Present"}
                    </span>
                  ) : (
                    `${exp.startDate.substring(0, 4)}-${exp.endDate?.substring(0, 4) || "Present"}`
                  )}
                </span>
                <span className="text-center text-slate-700 font-bold">:</span>
                <div className="text-slate-800 space-y-1">
                  <span className="font-bold">{parseHighlightHTML(exp.position)}</span> at <span className="font-semibold text-slate-700">{parseHighlightHTML(exp.company)}</span>
                  {exp.description && (
                    <div className="text-xs mt-1 text-slate-700 pl-4 border-l border-slate-200 font-serif">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-0.5">Responsibly:</span>
                      <div className="text-slate-600 leading-relaxed">{renderMarkdownHTML(exp.description, "text-xs text-slate-600")}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-xs italic">No work experience entered.</div>
          )}
        </div>
      </div>

      {/* 5. LANGUAGES */}
      {languages && languages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs sm:text-[13px] font-bold text-[#102a54] underline uppercase tracking-wider mb-2 decoration-1 underline-offset-2 font-serif">
            5. LANGUAGES
          </h4>
          <div className="space-y-0.5">
            {languages.map((langItem) => (
              <div key={langItem.id}>
                {renderRow(langItem.name, langItem.level)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REFERENCES AND AVAILABILITY */}
      {references && references.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs sm:text-[13px] font-bold text-[#102a54] underline uppercase tracking-wider mb-2 decoration-1 underline-offset-2 font-serif">
            6. REFERENCES AND AVAILABILITY
          </h4>
          <div className="space-y-4">
            {references.map((ref) => (
              <div key={ref.id} className="text-xs sm:text-[13px]">
                <h5 className="font-bold text-[#102a54] mb-1">{parseHighlightHTML(ref.name)}</h5>
                <div className="space-y-0.5">
                  {renderRow("Position", ref.relationship + (ref.company ? ` @ ${ref.company}` : ""), true)}
                  {ref.phone && renderRow("H/P", <span className="font-bold">{parseHighlightHTML(ref.phone)}</span>, true)}
                  {ref.email && renderRow("Email", <span className="text-blue-600 underline">{parseHighlightHTML(ref.email)}</span>, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to push footer down */}
      <div className="flex-1" />

      {/* FOOTER SECTION */}
      <div className="border-t border-slate-300 pt-1.5 mt-6 flex justify-between items-center text-[10px] sm:text-xs font-bold text-[#102a54] tracking-wider uppercase font-serif select-none shrink-0 print:block">
        <span>{personalInfo.fullName}</span>
        <span>{pageNumber} | Page</span>
      </div>
    </div>
  );
};
