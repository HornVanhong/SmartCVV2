import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Link, Svg, Circle, Path, G } from "@react-pdf/renderer";
import { CVData, CustomSection } from "@/types/cv";
import { t, getSectionName } from "@/lib/translations";
import { getPageData } from "@/lib/page-utils";
import { formatUrl, isLightColor, parseInlineMarkdown } from "@/lib/utils";

const renderMarkdownPDF = (text?: string, isBoldBase = false, customStyle?: any) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const renderLineContentPDF = (lineText: string) => {
    const tokens = parseInlineMarkdown(lineText);
    return tokens.map((token, idx) => {
      const isBold = token.type === "bold" || isBoldBase;
      const isItalic = token.type === "italic";
      const isHighlight = token.type === "highlight";
      return (
        <Text 
          key={idx} 
          style={[
            { 
              fontFamily: isBold ? "Helvetica-Bold" : "Helvetica",
              fontStyle: isItalic ? "italic" : "normal"
            },
            isHighlight ? { backgroundColor: "#fef08a", color: "#1e293b", paddingHorizontal: 2 } : {}
          ]}
        >
          {token.content}
        </Text>
      );
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList.length > 0) {
        elements.push(
          <View key={`list-${lineIdx}`} style={{ marginLeft: 8, marginTop: 1, marginBottom: 1, gap: 2 }}>
            {currentList}
          </View>
        );
        currentList = [];
      }
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      currentList.push(
        <View key={`li-${lineIdx}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, marginTop: 1 }}>
          <Text style={{ fontSize: 7, color: "#64748b" }}>•</Text>
          <Text style={[{ fontSize: 7.5, color: "#334155", flex: 1, lineHeight: 1.25 }, customStyle]}>
            {renderLineContentPDF(bulletMatch[1])}
          </Text>
        </View>
      );
    } else {
      if (currentList.length > 0) {
        elements.push(
          <View key={`list-${lineIdx}`} style={{ marginLeft: 8, marginTop: 1, marginBottom: 1, gap: 2 }}>
            {currentList}
          </View>
        );
        currentList = [];
      }
      elements.push(
        <Text key={`p-${lineIdx}`} style={[{ fontSize: 7.5, color: "#334155", marginBottom: 2.5, lineHeight: 1.25, textAlign: "justify" }, customStyle]}>
          {renderLineContentPDF(trimmed)}
        </Text>
      );
    }
  });

  if (currentList.length > 0) {
    elements.push(
      <View key="list-final" style={{ marginLeft: 8, marginTop: 1, marginBottom: 1, gap: 2 }}>
        {currentList}
      </View>
    );
  }

  return <View style={{ gap: 0.5 }}>{elements}</View>;
};

const renderCustomSectionsPDF = (customSections: CustomSection[] | undefined, primaryColor: string, styles: any, lang: string) => {
  if (!customSections || customSections.length === 0) return null;
  return customSections.map((sec) => (
    <View key={sec.id} style={[styles.section, { marginTop: 12 }]} wrap={false}>
      <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: withPdfAlpha(primaryColor, 0.2) }]}>
        {sec.name}
      </Text>
      <View style={{ gap: 6, marginTop: 4 }}>
        {sec.items.map((item) => (
          <View key={item.id} style={{ marginBottom: 4 }} break={item.pageBreakBefore}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
                {item.title || "Untitled Entry"}
              </Text>
              <Text style={{ fontSize: 7.5, color: "#64748b", fontFamily: "Helvetica" }}>
                {item.startDate} {item.endDate ? `– ${item.endDate}` : ""}
              </Text>
            </View>
            {item.subtitle ? (
              <Text style={{ fontSize: 8, color: "#475569", fontFamily: "Helvetica-Bold", marginTop: 1 }}>
                {item.subtitle}
              </Text>
            ) : null}
            {item.description ? (
              <View style={{ marginTop: 2 }}>
                {renderMarkdownPDF(item.description, false, { fontSize: 7.5, color: "#475569" })}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  ));
};

const renderCustomSectionsPDFWhite = (customSections: CustomSection[] | undefined, primaryColor: string) => {
  if (!customSections || customSections.length === 0) return null;
  return customSections.map((sec) => (
    <View key={sec.id} style={{ marginBottom: 12 }} wrap={false}>
      <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
        {sec.name}
      </Text>
      <View style={{ gap: 6 }}>
        {sec.items.map((item) => (
          <View key={item.id} style={{ gap: 2, fontFamily: "Times-Roman" }} wrap={false} break={item.pageBreakBefore}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={{ fontSize: 8, fontFamily: "Times-Bold", color: "#102a54" }}>
                {item.title || "Untitled Entry"}
              </Text>
              <Text style={{ fontSize: 8, color: "#1e293b", fontFamily: "Times-Roman" }}>
                {item.startDate} {item.endDate ? `– ${item.endDate}` : ""}
              </Text>
            </View>
            {item.subtitle ? (
              <Text style={{ fontSize: 8, color: "#334155", fontFamily: "Times-Bold" }}>
                {item.subtitle}
              </Text>
            ) : null}
            {item.description ? (
              <View style={{ marginTop: 2 }}>
                {renderMarkdownPDF(item.description, false, { fontSize: 7.5, color: "#334155", fontFamily: "Times-Roman" })}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  ));
};

// React-PDF does not reliably render the CSS-style 8-digit hex values used by
// the browser preview (for example, #2563eb20). Convert those to rgba instead.
const withPdfAlpha = (color: string, opacity: number) => {
  const hex = color.replace("#", "");
  if (/^[\da-f]{3}$/i.test(hex)) {
    const [r, g, b] = hex.split("").map((part) => parseInt(part + part, 16));
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (/^[\da-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Create styles mimicking templates
const styles = StyleSheet.create({
  page: {
    padding: 0, // 0 padding for full-bleed layouts, templates handle padding individually
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#334155", // slate-700
    lineHeight: 1.45,
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f172a", // slate-900
    paddingBottom: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
  },
  photo: {
    width: 66,
    height: 88, // 3:4 aspect ratio
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1", // slate-300
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nameTitleContainer: {
    flex: 1,
    flexDirection: "column",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a", // slate-950
    lineHeight: 1.15,
  },
  title: {
    fontSize: 11,
    color: "#475569", // slate-600
    marginTop: 4,
    lineHeight: 1.2,
  },
  targetRole: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    textTransform: "uppercase",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  contactContainer: {
    alignItems: "flex-end",
    fontSize: 8.5,
    color: "#475569",
    gap: 2,
  },
  contactText: {
    color: "#475569",
    textDecoration: "none",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.8,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.4,
    textAlign: "justify",
  },
  itemContainer: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  itemDate: {
    fontSize: 8,
    color: "#64748b", // slate-500
  },
  itemSubtitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 8.5,
    color: "#475569",
    lineHeight: 1.35,
    textAlign: "justify",
  },
  skillsLanguagesGrid: {
    flexDirection: "row",
    gap: 20,
  },
  skillsColumn: {
    flex: 1,
  },
  languagesColumn: {
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#f1f5f9", // slate-100
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    fontSize: 7.5,
    color: "#1e293b", // slate-800
    fontFamily: "Helvetica-Bold",
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    fontSize: 8.5,
  },
  languageName: {
    fontFamily: "Helvetica-Bold",
    color: "#334155",
  },
  languageLevel: {
    color: "#64748b",
    fontStyle: "italic",
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  projectNameContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  projectLink: {
    fontSize: 7.5,
    color: "#2563eb", // blue-600
    textDecoration: "none",
  },
  techsUsed: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2.5,
  },
  techsLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#475569",
  },
  referencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginTop: 4,
  },
  referenceItem: {
    width: "48%",
    marginBottom: 6,
  },
  referenceName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  referenceSub: {
    fontSize: 8,
    color: "#475569",
    fontFamily: "Helvetica-Bold",
  },
  referenceContact: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 1,
  },

  // Minimalist & Creative Specific Styles
  centeredHeader: {
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 15,
    marginBottom: 15,
  },
  inlineContactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    fontSize: 8,
    color: "#475569",
  },
  splitLayout: {
    flexDirection: "row",
    gap: 20,
    height: "100%",
  },
  sidebarColumn: {
    width: 150,
    borderRightWidth: 0.8,
    borderRightColor: "#cbd5e1",
    paddingRight: 15,
  },
  mainColumn: {
    flex: 1,
  },
  creativeSplitLayout: {
    flexDirection: "row",
    flexGrow: 1,
    width: "100%",
  },
  creativeSidebarColumn: {
    width: 190,
    borderRightWidth: 0.8,
    borderRightColor: "#cbd5e1",
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 20,
    paddingRight: 16,
  },
  creativeMainColumn: {
    flex: 1,
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 18,
    paddingRight: 20,
  },
  sidebarSection: {
    marginBottom: 15,
  },
  sidebarSectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 2,
  },
  sidebarContactText: {
    fontSize: 8,
    color: "#475569",
    marginBottom: 3,
  },
  sidebarContactLink: {
    fontSize: 8,
    textDecoration: "none",
    marginBottom: 3,
  },
});

const MailIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6l-10 7L2 6"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MapPinIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={12}
      cy={10}
      r={3}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
    />
  </Svg>
);

const GithubIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LinkedinIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 9h4v12H2V9z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={4}
      cy={4}
      r={2}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
    />
  </Svg>
);

const GlobeIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Circle
      cx={12}
      cy={12}
      r={10}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FacebookIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TwitterIcon = ({ color }: { color: string }) => (
  <Svg viewBox="0 0 24 24" style={{ width: 7.5, height: 7.5 }}>
    <Path
      d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const renderSocialIconPDF = (val: string | undefined | null, color: string) => {
  if (!val) return <GlobeIcon color={color} />;
  const trimmed = val.toLowerCase();
  if (trimmed.includes("github") || trimmed.includes("git")) return <GithubIcon color={color} />;
  if (trimmed.includes("linkedin")) return <LinkedinIcon color={color} />;
  if (trimmed.includes("facebook") || trimmed.includes("fb")) return <FacebookIcon color={color} />;
  if (trimmed.includes("twitter") || trimmed.includes("x.com")) return <TwitterIcon color={color} />;
  return <GlobeIcon color={color} />;
};

interface CVDocumentPDFProps {
  data: CVData;
}

export const CVDocumentPDF: React.FC<CVDocumentPDFProps> = ({ data }) => {
  let { personalInfo, professionalSummary, education, skills, projects, experience, languages, references, customSections } = data;
  const primaryColor = data.theme?.primaryColor || "#2563eb";
  const templateId = data.theme?.templateId || "modern";
  const lang = data.theme?.language || "en";

  const cleanLink = (url: string) => {
    if (!url) return "";
    const index = url.indexOf("|");
    if (index !== -1) {
      return url.substring(0, index).trim();
    }
    const mdMatch = url.match(/^\[(.*?)\]\((.*?)\)$/);
    if (mdMatch) {
      return mdMatch[1].trim();
    }
    return url.replace(/^(https?:\/\/)?(www\.)?/, "");
  };

  // Render Modern Layout
  const renderModern = () => (
    <View style={{ padding: 36 }}>
      {/* Header */}
      <View style={styles.header}>
        {personalInfo.photo ? (
          <Image
            src={personalInfo.photo}
            style={[
              styles.photo,
              data.theme?.photoAspectRatio === "4:6"
                ? { width: 60, height: 90 }
                : { width: 66, height: 88 }
            ]}
          />
        ) : null}
        
        <View style={styles.headerTextContainer}>
          <View style={styles.nameTitleContainer}>
            <Text style={styles.name}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={styles.title}>{personalInfo.jobTitle || "Professional Title"}</Text>
            {personalInfo.targetRole ? (
              <Text style={[styles.targetRole, { color: primaryColor }]}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
            ) : null}
          </View>
          
          <View style={styles.contactContainer}>
            {personalInfo.email ? (
              <Link src={`mailto:${personalInfo.email}`} style={styles.contactText}>
                <Text>{personalInfo.email}</Text>
              </Link>
            ) : null}
            
            {personalInfo.phone ? (
              <Text style={styles.contactText}>{personalInfo.phone}</Text>
            ) : null}
            
            {personalInfo.location ? (
              <Text style={styles.contactText}>{personalInfo.location}</Text>
            ) : null}

            {personalInfo.portfolio ? (
              <Link src={formatUrl(personalInfo.portfolio)} style={styles.contactText}>
                <Text>{cleanLink(personalInfo.portfolio)}</Text>
              </Link>
            ) : null}

            {personalInfo.github ? (
              <Link src={formatUrl(personalInfo.github)} style={styles.contactText}>
                <Text>github: {cleanLink(personalInfo.github)}</Text>
              </Link>
            ) : null}

            {personalInfo.linkedin ? (
              <Link src={formatUrl(personalInfo.linkedin)} style={styles.contactText}>
                <Text>linkedin: {cleanLink(personalInfo.linkedin)}</Text>
              </Link>
            ) : null}
          </View>
        </View>
      </View>

      {/* Summary */}
      {professionalSummary ? (
        <View style={styles.section} wrap={false}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {getSectionName("professionalSummary", data)}
          </Text>
          <Text style={styles.summaryText}>{professionalSummary}</Text>
        </View>
      ) : null}

      {/* Experience */}
      {experience && experience.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {getSectionName("workExperience", data)}
          </Text>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.itemContainer} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {exp.position} <Text style={{ fontFamily: "Helvetica", color: "#94a3b8" }}>at</Text> {exp.company}
                </Text>
                <Text style={styles.itemDate}>{exp.startDate} – {exp.endDate || t("present", lang)}</Text>
              </View>
              {exp.description ? (
                <Text style={styles.itemDescription}>{exp.description}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* Education */}
      {education && education.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {getSectionName("education", data)}
          </Text>
          {education.map((edu) => (
            <View key={edu.id} style={styles.itemContainer} wrap={false}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{edu.major}</Text>
                <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate || t("present", lang)}</Text>
              </View>
              <Text style={styles.itemSubtitle}>{edu.school}</Text>
              {edu.description ? (
                <Text style={styles.itemDescription}>{edu.description}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* Projects */}
      {projects && projects.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {getSectionName("projects", data)}
          </Text>
          {projects.map((proj) => (
            <View key={proj.id} style={styles.itemContainer} wrap={false}>
              <View style={styles.projectHeader}>
                <View style={styles.projectNameContainer}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                </View>
                {proj.link ? (
                  <Link src={formatUrl(proj.link)} style={[styles.projectLink, { color: primaryColor }]}>
                    <Text>{cleanLink(proj.link)}</Text>
                  </Link>
                ) : null}
              </View>
              {proj.description ? (
                <Text style={styles.itemDescription}>{proj.description}</Text>
              ) : null}
              {proj.technologies ? (
                <Text style={styles.techsUsed}>
                  <Text style={styles.techsLabel}>Technologies:</Text> {proj.technologies}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* Grid layout for Skills & Languages */}
      <View style={styles.skillsLanguagesGrid} wrap={false}>
        {/* Skills */}
        {skills && skills.length > 0 ? (
          <View style={styles.skillsColumn}>
            <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
              {getSectionName("skills", data)}
            </Text>
            <View style={styles.badgeContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={[styles.badge, { borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08`, color: primaryColor }]}>{skill}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Languages */}
        {languages && languages.length > 0 ? (
          <View style={styles.languagesColumn}>
            <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
              {getSectionName("languages", data)}
            </Text>
            <View>
              {languages.map((lang) => (
                <View key={lang.id} style={styles.languageRow}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageLevel}>{lang.level}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* References */}
      {references && references.length > 0 ? (
        <View style={[styles.section, { marginTop: 12 }]} wrap={false}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {t("references", lang)}
          </Text>
          <View style={styles.referencesGrid}>
            {references.map((ref) => (
              <View key={ref.id} style={styles.referenceItem}>
                <Text style={styles.referenceName}>{ref.name}</Text>
                {ref.relationship && ref.company ? (
                  <Text style={styles.referenceSub}>{ref.relationship} at {ref.company}</Text>
                ) : ref.relationship || ref.company ? (
                  <Text style={styles.referenceSub}>{ref.relationship || ref.company}</Text>
                ) : null}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 1 }}>
                  {ref.email ? (
                    <Text style={styles.referenceContact}>{ref.email}</Text>
                  ) : null}
                  {ref.email && ref.phone ? (
                    <Text style={[styles.referenceContact, { color: "#cbd5e1" }]}>|</Text>
                  ) : null}
                  {ref.phone ? (
                    <Text style={styles.referenceContact}>{ref.phone}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Dynamic Custom Sections */}
      {renderCustomSectionsPDF(customSections, primaryColor, styles, lang)}
    </View>
  );

  // Render Minimalist Layout
  const renderMinimalist = () => (
    <View style={{ padding: 36 }}>
      {/* Centered Header */}
      <View style={[styles.centeredHeader, { borderBottomColor: primaryColor }]}>
        {personalInfo.photo ? (
          <Image
            src={personalInfo.photo}
            style={[
              styles.photo,
              { borderRadius: 6, marginBottom: 8 },
              data.theme?.photoAspectRatio === "4:6"
                ? { width: 60, height: 90 }
                : { width: 66, height: 88 }
            ]}
          />
        ) : null}
        <Text style={styles.name}>{personalInfo.fullName || "Your Name"}</Text>
        <Text style={[styles.title, { fontFamily: "Helvetica-Bold", color: primaryColor, fontSize: 10, textTransform: "uppercase" }]}>
          {personalInfo.jobTitle || "Professional Title"}
        </Text>
        {personalInfo.targetRole ? (
          <Text style={{ fontSize: 7.5, color: "#64748b", textTransform: "uppercase", marginTop: 2, letterSpacing: 0.5 }}>
            {t("appliedFor", lang)}: {personalInfo.targetRole}
          </Text>
        ) : null}

        {/* Dynamic inline contacts row */}
        <View style={styles.inlineContactRow}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>•   {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>•   {personalInfo.location}</Text> : null}
        </View>
        <View style={[styles.inlineContactRow, { marginTop: 3 }]}>
          {personalInfo.portfolio ? <Text>{cleanLink(personalInfo.portfolio)}</Text> : null}
          {personalInfo.github ? <Text>•   github: {cleanLink(personalInfo.github)}</Text> : null}
          {personalInfo.linkedin ? <Text>•   linkedin: {cleanLink(personalInfo.linkedin)}</Text> : null}
        </View>
      </View>

      {/* Summary */}
      {professionalSummary ? (
        <View style={styles.section} wrap={false}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {t("professionalSummary", lang)}
          </Text>
          <Text style={styles.summaryText}>{professionalSummary}</Text>
        </View>
      ) : null}

      {/* Career Focus & Objective Pitch */}
      {data.theme?.showPitch && data.theme?.professionalPitch ? (
        <View style={styles.section} wrap={false}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {t("careerObjective", lang)}
          </Text>
          <View style={{ padding: 8, borderRadius: 6, backgroundColor: `${primaryColor}03` }}>
            <Text style={styles.summaryText}>{data.theme.professionalPitch}</Text>
          </View>
        </View>
      ) : null}

      {/* Dynamic Section Ordering */}
      {data.theme?.experienceLevel === "entry" ? (
        <>
          {/* Education */}
          {education && education.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
                {t("education", lang)}
              </Text>
              {education.map((edu) => (
                <View key={edu.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{edu.major}</Text>
                    <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate || t("present", lang)}</Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{edu.school}</Text>
                  {edu.description ? (
                    <Text style={styles.itemDescription}>{edu.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Projects */}
          {projects && projects.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
                {t("projects", lang)}
              </Text>
              {projects.map((proj) => (
                <View key={proj.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.itemTitle}>{proj.name}</Text>
                    {proj.link ? (
                      <Link src={formatUrl(proj.link)} style={[styles.projectLink, { color: primaryColor }]}>
                        <Text>{cleanLink(proj.link)}</Text>
                      </Link>
                    ) : null}
                  </View>
                  {proj.description ? (
                    <Text style={styles.itemDescription}>{proj.description}</Text>
                  ) : null}
                  {proj.technologies ? (
                    <Text style={styles.techsUsed}>
                      <Text style={styles.techsLabel}>Technologies:</Text> {proj.technologies}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Experience */}
          {experience && experience.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
                {t("workExperience", lang)}
              </Text>
              {experience.map((exp) => (
                <View key={exp.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {exp.position} <Text style={{ fontFamily: "Helvetica", color: "#94a3b8" }}>at</Text> {exp.company}
                    </Text>
                    <Text style={styles.itemDate}>{exp.startDate} – {exp.endDate || t("present", lang)}</Text>
                  </View>
                  {exp.description ? (
                    <Text style={styles.itemDescription}>{exp.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <>
          {/* Experience */}
          {experience && experience.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
                {t("workExperience", lang)}
              </Text>
              {experience.map((exp) => (
                <View key={exp.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {exp.position} <Text style={{ fontFamily: "Helvetica", color: "#94a3b8" }}>at</Text> {exp.company}
                    </Text>
                    <Text style={styles.itemDate}>{exp.startDate} – {exp.endDate || t("present", lang)}</Text>
                  </View>
                  {exp.description ? (
                    <Text style={styles.itemDescription}>{exp.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Education */}
          {education && education.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
                {t("education", lang)}
              </Text>
              {education.map((edu) => (
                <View key={edu.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{edu.major}</Text>
                    <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate || t("present", lang)}</Text>
                  </View>
                  <Text style={styles.itemSubtitle}>{edu.school}</Text>
                  {edu.description ? (
                    <Text style={styles.itemDescription}>{edu.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Projects */}
          {projects && projects.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
                {t("projects", lang)}
              </Text>
              {projects.map((proj) => (
                <View key={proj.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.itemTitle}>{proj.name}</Text>
                    {proj.link ? (
                      <Link src={formatUrl(proj.link)} style={[styles.projectLink, { color: primaryColor }]}>
                        <Text>{cleanLink(proj.link)}</Text>
                      </Link>
                    ) : null}
                  </View>
                  {proj.description ? (
                    <Text style={styles.itemDescription}>{proj.description}</Text>
                  ) : null}
                  {proj.technologies ? (
                    <Text style={styles.techsUsed}>
                      <Text style={styles.techsLabel}>Technologies:</Text> {proj.technologies}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}

      {/* Skills & Languages Grid */}
      <View style={styles.skillsLanguagesGrid} wrap={false}>
        {skills && skills.length > 0 ? (
          <View style={styles.skillsColumn}>
            <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
              {t("skills", lang)}
            </Text>
            <View style={styles.badgeContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={[styles.badge, { borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08`, color: primaryColor }]}>{skill}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {languages && languages.length > 0 ? (
          <View style={styles.languagesColumn}>
            <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
              {t("languages", lang)}
            </Text>
            <View>
              {languages.map((lang) => (
                <View key={lang.id} style={styles.languageRow}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageLevel}>{lang.level}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* References */}
      {references && references.length > 0 ? (
        <View style={[styles.section, { marginTop: 12 }]} wrap={false}>
          <Text style={[styles.sectionTitle, { color: primaryColor, borderBottomColor: `${primaryColor}20` }]}>
            {t("references", lang)}
          </Text>
          <View style={styles.referencesGrid}>
            {references.map((ref) => (
              <View key={ref.id} style={styles.referenceItem}>
                <Text style={styles.referenceName}>{ref.name}</Text>
                {ref.relationship && ref.company ? (
                  <Text style={styles.referenceSub}>{ref.relationship} at {ref.company}</Text>
                ) : ref.relationship || ref.company ? (
                  <Text style={styles.referenceSub}>{ref.relationship || ref.company}</Text>
                ) : null}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 1 }}>
                  {ref.email ? (
                    <Text style={styles.referenceContact}>{ref.email}</Text>
                  ) : null}
                  {ref.email && ref.phone ? (
                    <Text style={[styles.referenceContact, { color: "#cbd5e1" }]}>|</Text>
                  ) : null}
                  {ref.phone ? (
                    <Text style={styles.referenceContact}>{ref.phone}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Dynamic Custom Sections */}
      {renderCustomSectionsPDF(customSections, primaryColor, styles, lang)}
    </View>
  );

  // Render Creative Split Layout
  const renderCreative = () => {
    const sidebarBg = data.theme?.sidebarBackgroundColor || "rgba(241, 245, 249, 0.7)";
    const isLight = !data.theme?.sidebarBackgroundColor || isLightColor(data.theme.sidebarBackgroundColor);
    const textNameColor = isLight ? "#0f172a" : "#ffffff";
    const textHeaderColor = isLight ? "#64748b" : "rgba(255, 255, 255, 0.6)";
    const textBodyColor = isLight ? "#334155" : "rgba(255, 255, 255, 0.85)";
    const textMutedColor = isLight ? "#64748b" : "rgba(255, 255, 255, 0.55)";
    const borderBottomColor = isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.15)";
    const creativeSectionTitleStyle = [
      styles.sectionTitle,
      { 
        color: "#0f172a", 
        borderBottomColor: primaryColor,
        fontSize: 9,
        marginBottom: 4,
        paddingBottom: 2
      }
    ];

    return (
      <View style={styles.creativeSplitLayout}>
        {/* Sidebar Column */}
        <View style={[styles.creativeSidebarColumn, { backgroundColor: sidebarBg, borderColor: isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)" }]}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={[
                styles.photo,
                { borderRadius: 6, marginBottom: 12, marginLeft: "auto", marginRight: "auto" },
                data.theme?.photoAspectRatio === "4:6"
                  ? { width: 60, height: 90 }
                  : { width: 66, height: 88 }
              ]}
            />
          ) : null}

          <View style={{ marginBottom: 15 }}>
            <Text style={[styles.name, { fontSize: 14, fontFamily: "Helvetica-Bold", color: textNameColor }]}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: primaryColor, marginTop: 2, textTransform: "uppercase" }}>
              {personalInfo.jobTitle || "Professional Title"}
            </Text>
            {personalInfo.targetRole ? (
              <Text style={{ fontSize: 7, color: textMutedColor, textTransform: "uppercase", marginTop: 2 }}>
                {t("appliedFor", lang)}: {personalInfo.targetRole}
              </Text>
            ) : null}
          </View>

          {/* Contact info block */}
          <View style={[styles.sidebarSection, { marginBottom: 10 }]}>
            <Text style={[styles.sidebarSectionTitle, { color: textHeaderColor, borderBottomColor }]}>{t("contact", lang)}</Text>
            {personalInfo.email ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
                <View style={{ width: 10, alignItems: "center", justifyContent: "center", marginRight: 4, marginTop: -1 }}>
                  <MailIcon color={isLight ? "#94a3b8" : "rgba(255, 255, 255, 0.55)"} />
                </View>
                <Link src={`mailto:${personalInfo.email}`} style={[styles.sidebarContactLink, { color: isLight ? primaryColor : "#ffffff", marginBottom: 0, lineHeight: 1 }]}>
                  {personalInfo.email}
                </Link>
              </View>
            ) : null}
            {personalInfo.phone ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
                <View style={{ width: 10, alignItems: "center", justifyContent: "center", marginRight: 4, marginTop: -1 }}>
                  <PhoneIcon color={isLight ? "#94a3b8" : "rgba(255, 255, 255, 0.55)"} />
                </View>
                <Text style={[styles.sidebarContactText, { color: textBodyColor, marginBottom: 0, lineHeight: 1 }]}>{personalInfo.phone}</Text>
              </View>
            ) : null}
            {personalInfo.location ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
                <View style={{ width: 10, alignItems: "center", justifyContent: "center", marginRight: 4, marginTop: -1 }}>
                  <MapPinIcon color={isLight ? "#94a3b8" : "rgba(255, 255, 255, 0.55)"} />
                </View>
                <Text style={[styles.sidebarContactText, { color: textBodyColor, marginBottom: 0, lineHeight: 1 }]}>{personalInfo.location}</Text>
              </View>
            ) : null}
          </View>

          {/* Socials block */}
          <View style={[styles.sidebarSection, { marginBottom: 10 }]}>
            <Text style={[styles.sidebarSectionTitle, { color: textHeaderColor, borderBottomColor }]}>{t("socials", lang)}</Text>
            {personalInfo.portfolio ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
                <View style={{ width: 10, alignItems: "center", justifyContent: "center", marginRight: 4, marginTop: -1 }}>
                  {renderSocialIconPDF(personalInfo.portfolio, isLight ? "#94a3b8" : "rgba(255, 255, 255, 0.55)")}
                </View>
                <Link src={formatUrl(personalInfo.portfolio)} style={[styles.sidebarContactLink, { color: isLight ? primaryColor : "#ffffff", marginBottom: 0, lineHeight: 1 }]}>
                  {cleanLink(personalInfo.portfolio)}
                </Link>
              </View>
            ) : null}
            {personalInfo.github ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
                <View style={{ width: 10, alignItems: "center", justifyContent: "center", marginRight: 4, marginTop: -1 }}>
                  {renderSocialIconPDF(personalInfo.github, isLight ? "#94a3b8" : "rgba(255, 255, 255, 0.55)")}
                </View>
                <Link src={formatUrl(personalInfo.github)} style={[styles.sidebarContactLink, { color: isLight ? primaryColor : "#ffffff", marginBottom: 0, lineHeight: 1 }]}>
                  {cleanLink(personalInfo.github)}
                </Link>
              </View>
            ) : null}
            {personalInfo.linkedin ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
                <View style={{ width: 10, alignItems: "center", justifyContent: "center", marginRight: 4, marginTop: -1 }}>
                  {renderSocialIconPDF(personalInfo.linkedin, isLight ? "#94a3b8" : "rgba(255, 255, 255, 0.55)")}
                </View>
                <Link src={formatUrl(personalInfo.linkedin)} style={[styles.sidebarContactLink, { color: isLight ? primaryColor : "#ffffff", marginBottom: 0, lineHeight: 1 }]}>
                  {cleanLink(personalInfo.linkedin)}
                </Link>
              </View>
            ) : null}
          </View>

          {/* Skills Block */}
          {skills && skills.length > 0 ? (
            <View style={[styles.sidebarSection, { marginBottom: 10 }]}>
              <Text style={[styles.sidebarSectionTitle, { color: textHeaderColor, borderBottomColor }]}>{t("skills", lang)}</Text>
              <View style={{ gap: 4 }}>
                {skills.map((skill, index) => (
                  <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: primaryColor, marginTop: 1 }} />
                    <Text style={{ fontSize: 8, color: textBodyColor, lineHeight: 1.1 }}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Languages Block */}
          {languages && languages.length > 0 ? (
            <View style={[styles.sidebarSection, { marginBottom: 10 }]}>
              <Text style={[styles.sidebarSectionTitle, { color: textHeaderColor, borderBottomColor }]}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={[styles.languageRow, { borderBottomColor }]}>
                  <Text style={[styles.languageName, { fontSize: 8, color: textNameColor }]}>{langItem.name}</Text>
                  <Text style={[styles.languageLevel, { fontSize: 7.5, color: textMutedColor }]}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

      {/* Main Column */}
      <View style={styles.creativeMainColumn}>
        {/* Professional Summary */}
        {professionalSummary ? (
          <View style={[styles.section, { marginBottom: 9 }]} wrap={false}>
            <Text style={creativeSectionTitleStyle}>
              {t("professionalSummary", lang)}
            </Text>
            <Text style={styles.summaryText}>{professionalSummary}</Text>
          </View>
        ) : null}

        {/* Career Focus & Objective Pitch */}
        {data.theme?.showPitch && data.theme?.professionalPitch ? (
          <View style={[styles.section, { marginBottom: 9 }]} wrap={false}>
            <Text style={creativeSectionTitleStyle}>
              {t("careerObjective", lang)}
            </Text>
            <View style={{ padding: 8, borderRadius: 6, backgroundColor: withPdfAlpha(primaryColor, 0.02) }}>
              <Text style={styles.summaryText}>{data.theme.professionalPitch}</Text>
            </View>
          </View>
        ) : null}

        {/* Dynamic Section Ordering */}
        {data.theme?.experienceLevel === "entry" ? (
          <>
            {/* Education */}
            {education && education.length > 0 ? (
              <View style={[styles.section, { marginBottom: 9 }]}>
                <Text style={creativeSectionTitleStyle}>
                  {t("education", lang)}
                </Text>
                {education.map((edu) => (
                  <View key={edu.id} style={[styles.itemContainer, { marginBottom: 5 }]} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{edu.major}</Text>
                      <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate || t("present", lang)}</Text>
                    </View>
                    <Text style={styles.itemSubtitle}>{edu.school}</Text>
                    {edu.description ? (
                      <Text style={[styles.itemDescription, { fontSize: 8, lineHeight: 1.25 }]}>{edu.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Projects */}
            {projects && projects.length > 0 ? (
              <View style={[styles.section, { marginBottom: 9 }]}>
                <Text style={creativeSectionTitleStyle}>
                  {getSectionName("projects", data)}
                </Text>
                {projects.map((proj) => (
                  <View key={proj.id} style={[styles.itemContainer, { marginBottom: 5 }]} wrap={false}>
                    <View style={styles.projectHeader}>
                      <Text style={styles.itemTitle}>{proj.name}</Text>
                      {proj.link ? (
                        <Link src={formatUrl(proj.link)} style={[styles.projectLink, { color: primaryColor }]}>
                          <Text>{cleanLink(proj.link)}</Text>
                        </Link>
                      ) : null}
                    </View>
                    {proj.description ? (
                      <Text style={[styles.itemDescription, { fontSize: 8, lineHeight: 1.25 }]}>{proj.description}</Text>
                    ) : null}
                    {proj.technologies ? (
                      <Text style={styles.techsUsed}>
                        <Text style={styles.techsLabel}>Technologies:</Text> {proj.technologies}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Work Experience */}
            {experience && experience.length > 0 ? (
              <View style={[styles.section, { marginBottom: 9 }]}>
                <Text style={creativeSectionTitleStyle}>
                  {getSectionName("workExperience", data)}
                </Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={[styles.itemContainer, { marginBottom: 5 }]} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        {exp.position} <Text style={{ fontFamily: "Helvetica", color: "#94a3b8" }}>at</Text> {exp.company}
                      </Text>
                      <Text style={styles.itemDate}>{exp.startDate} – {exp.endDate || t("present", lang)}</Text>
                    </View>
                    {exp.description ? (
                      <Text style={[styles.itemDescription, { fontSize: 8, lineHeight: 1.25 }]}>{exp.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <>
            {/* Work Experience */}
            {experience && experience.length > 0 ? (
              <View style={[styles.section, { marginBottom: 9 }]}>
                <Text style={creativeSectionTitleStyle}>
                  {getSectionName("workExperience", data)}
                </Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={[styles.itemContainer, { marginBottom: 5 }]} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>
                        {exp.position} <Text style={{ fontFamily: "Helvetica", color: "#94a3b8" }}>at</Text> {exp.company}
                      </Text>
                      <Text style={{ fontSize: 8, color: "#64748b" }}>{exp.startDate} – {exp.endDate || t("present", lang)}</Text>
                    </View>
                    {exp.description ? (
                      <Text style={[styles.itemDescription, { fontSize: 8, lineHeight: 1.25 }]}>{exp.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Education */}
            {education && education.length > 0 ? (
              <View style={[styles.section, { marginBottom: 9 }]}>
                <Text style={creativeSectionTitleStyle}>
                  {getSectionName("education", data)}
                </Text>
                {education.map((edu) => (
                  <View key={edu.id} style={[styles.itemContainer, { marginBottom: 5 }]} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{edu.major}</Text>
                      <Text style={{ fontSize: 8, color: "#64748b" }}>{edu.startDate} – {edu.endDate || t("present", lang)}</Text>
                    </View>
                    <Text style={styles.itemSubtitle}>{edu.school}</Text>
                    {edu.description ? (
                      <Text style={[styles.itemDescription, { fontSize: 8, lineHeight: 1.25 }]}>{edu.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Projects */}
            {projects && projects.length > 0 ? (
              <View style={[styles.section, { marginBottom: 9 }]}>
                <Text style={creativeSectionTitleStyle}>
                  {getSectionName("projects", data)}
                </Text>
                {projects.map((proj) => (
                  <View key={proj.id} style={[styles.itemContainer, { marginBottom: 5 }]} wrap={false}>
                    <View style={styles.projectHeader}>
                      <Text style={styles.itemTitle}>{proj.name}</Text>
                      {proj.link ? (
                        <Link src={formatUrl(proj.link)} style={[styles.projectLink, { color: primaryColor }]}>
                          <Text>{cleanLink(proj.link)}</Text>
                        </Link>
                      ) : null}
                    </View>
                    {proj.description ? (
                      <Text style={[styles.itemDescription, { fontSize: 8, lineHeight: 1.25 }]}>{proj.description}</Text>
                    ) : null}
                    {proj.technologies ? (
                      <Text style={styles.techsUsed}>
                        <Text style={styles.techsLabel}>Technologies:</Text> {proj.technologies}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}

        {/* References */}
        {references && references.length > 0 ? (
          <View style={[styles.section, { marginTop: 6, marginBottom: 0 }]} wrap={false}>
            <Text style={creativeSectionTitleStyle}>
              {getSectionName("references", data)}
            </Text>
            <View style={styles.referencesGrid}>
              {references.map((ref) => (
                <View key={ref.id} style={styles.referenceItem}>
                  <Text style={styles.referenceName}>{ref.name}</Text>
                  {ref.relationship && ref.company ? (
                    <Text style={styles.referenceSub}>{ref.relationship} at {ref.company}</Text>
                  ) : ref.relationship || ref.company ? (
                    <Text style={styles.referenceSub}>{ref.relationship || ref.company}</Text>
                  ) : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 1 }}>
                    {ref.email ? (
                      <Text style={styles.referenceContact}>{ref.email}</Text>
                    ) : null}
                    {ref.email && ref.phone ? (
                      <Text style={[styles.referenceContact, { color: "#cbd5e1" }]}>|</Text>
                    ) : null}
                    {ref.phone ? (
                      <Text style={styles.referenceContact}>{ref.phone}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

  // Render Professional Layout (Top Banner, Solid boxes)
  const renderProfessional = () => (
    <View style={{ flex: 1 }}>
      {/* Full-bleed Top Banner */}
      <View style={{ backgroundColor: primaryColor, paddingHorizontal: 36, paddingVertical: 20, flexDirection: "row", alignItems: "center", gap: 15 }}>
        {personalInfo.photo ? (
          <Image
            src={personalInfo.photo}
            style={[
              styles.photo,
              { borderWidth: 3, borderColor: "#ffffff", borderRadius: 2, zIndex: 10 },
              data.theme?.photoAspectRatio === "4:6"
                ? { width: 60, height: 90, marginBottom: -46 }
                : { width: 66, height: 88, marginBottom: -42 }
            ]}
          />
        ) : null}
        <View style={{ flex: 1, marginLeft: personalInfo.photo ? 15 : 0 }}>
          <Text style={[styles.name, { color: "#ffffff", textTransform: "uppercase" }]}>{personalInfo.fullName || "Your Name"}</Text>
          <Text style={[styles.title, { color: "#f1f5f9", fontSize: 10, textTransform: "uppercase", marginTop: 2, fontFamily: "Helvetica-Bold" }]}>
            {personalInfo.jobTitle || "Professional Title"}
          </Text>
          {personalInfo.targetRole ? (
            <Text style={{ fontSize: 7.5, color: "#cbd5e1", textTransform: "uppercase", marginTop: 2, letterSpacing: 0.5 }}>
              {t("appliedFor", lang)}: {personalInfo.targetRole}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Main split content below banner */}
      <View style={{ paddingHorizontal: 36, paddingTop: 35, paddingBottom: 20, flex: 1, flexDirection: "row", gap: 20 }}>
        {/* Left Sidebar */}
        <View style={styles.sidebarColumn}>
          {/* Contacts with small primary color icon box equivalent */}
          <View style={[styles.sidebarSection, { marginTop: 10 }]}>
            {personalInfo.phone ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <View style={{ width: 14, height: 14, backgroundColor: primaryColor, borderRadius: 2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" }}>P</Text>
                </View>
                <Text style={{ fontSize: 8, color: "#475569" }}>{personalInfo.phone}</Text>
              </View>
            ) : null}
            {personalInfo.email ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <View style={{ width: 14, height: 14, backgroundColor: primaryColor, borderRadius: 2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" }}>E</Text>
                </View>
                <Text style={{ fontSize: 8, color: "#475569" }}>{personalInfo.email}</Text>
              </View>
            ) : null}
            {personalInfo.dob ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <View style={{ width: 14, height: 14, backgroundColor: primaryColor, borderRadius: 2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" }}>D</Text>
                </View>
                <Text style={{ fontSize: 8, color: "#475569" }}>{lang === "km" ? "ថ្ងៃកំណើត" : "DOB"}: {personalInfo.dob}</Text>
              </View>
            ) : null}
            {personalInfo.nationality ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <View style={{ width: 14, height: 14, backgroundColor: primaryColor, borderRadius: 2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" }}>N</Text>
                </View>
                <Text style={{ fontSize: 8, color: "#475569" }}>{lang === "km" ? "សញ្ជាតិ" : "Nat."}: {personalInfo.nationality}</Text>
              </View>
            ) : null}
            {personalInfo.location ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <View style={{ width: 14, height: 14, backgroundColor: primaryColor, borderRadius: 2, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" }}>L</Text>
                </View>
                <Text style={{ fontSize: 8, color: "#475569" }}>{personalInfo.location}</Text>
              </View>
            ) : null}
          </View>

          {/* Education */}
          {education && education.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { backgroundColor: primaryColor, color: "#ffffff", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, borderBottomWidth: 0 }]}>{t("education", lang)}</Text>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e293b" }}>{edu.major}</Text>
                  <Text style={{ fontSize: 7.5, color: "#475569" }}>{edu.school}</Text>
                  <Text style={{ fontSize: 7, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Skills */}
          {skills && skills.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { backgroundColor: primaryColor, color: "#ffffff", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, borderBottomWidth: 0 }]}>{t("skills", lang)}</Text>
              <View style={{ gap: 2 }}>
                {skills.map((skill, index) => (
                  <Text key={index} style={{ fontSize: 8, color: "#475569" }}>• {skill}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Languages */}
          {languages && languages.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { backgroundColor: primaryColor, color: "#ffffff", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, borderBottomWidth: 0 }]}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={[styles.languageRow, { borderBottomColor: "#cbd5e1" }]}>
                  <Text style={[styles.languageName, { fontSize: 8 }]}>{langItem.name}</Text>
                  <Text style={[styles.languageLevel, { fontSize: 7.5 }]}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Right Main Column */}
        <View style={styles.mainColumn}>
          {/* Profile */}
          {professionalSummary ? (
            <View style={styles.section} wrap={false}>
              <Text style={[styles.sectionTitle, { color: "#0f172a", borderBottomColor: `${primaryColor}20`, fontFamily: "Helvetica-Bold" }]}>{t("profile", lang)}</Text>
              <Text style={styles.summaryText}>{professionalSummary}</Text>
            </View>
          ) : null}

          {/* Work Experience */}
          {experience && experience.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: "#0f172a", borderBottomColor: `${primaryColor}20`, fontFamily: "Helvetica-Bold" }]}>{t("workExperience", lang)}</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={{ flexDirection: "row", gap: 10, marginBottom: 8 }} wrap={false}>
                  <View style={{ width: 90, flexShrink: 0 }}>
                    <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#64748b" }}>{exp.startDate} – {exp.endDate || t("present", lang)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
                      {exp.position} <Text style={{ fontFamily: "Helvetica", color: "#94a3b8" }}>at</Text> {exp.company}
                    </Text>
                    {exp.description ? (
                      <Text style={[styles.itemDescription, { marginTop: 2 }]}>{exp.description}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* Projects */}
          {projects && projects.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: "#0f172a", borderBottomColor: `${primaryColor}20`, fontFamily: "Helvetica-Bold" }]}>{t("projects", lang)}</Text>
              {projects.map((proj) => (
                <View key={proj.id} style={styles.itemContainer} wrap={false}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.itemTitle}>{proj.name}</Text>
                    {proj.link ? (
                      <Link src={formatUrl(proj.link)} style={[styles.projectLink, { color: primaryColor }]}>
                        <Text>{cleanLink(proj.link)}</Text>
                      </Link>
                    ) : null}
                  </View>
                  {proj.description ? (
                    <Text style={styles.itemDescription}>{proj.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* References */}
          {references && references.length > 0 ? (
            <View style={[styles.section, { marginTop: 8 }]} wrap={false}>
              <Text style={[styles.sectionTitle, { color: "#0f172a", borderBottomColor: `${primaryColor}20`, fontFamily: "Helvetica-Bold" }]}>{t("references", lang)}</Text>
              <View style={styles.referencesGrid}>
                {references.map((ref) => (
                  <View key={ref.id} style={styles.referenceItem}>
                    <Text style={styles.referenceName}>{ref.name}</Text>
                    {ref.relationship && ref.company ? (
                      <Text style={styles.referenceSub}>{ref.relationship} at {ref.company}</Text>
                    ) : ref.relationship || ref.company ? (
                      <Text style={styles.referenceSub}>{ref.relationship || ref.company}</Text>
                    ) : null}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 1 }}>
                      {ref.email ? (
                        <Text style={styles.referenceContact}>{t("email", lang)}: {ref.email}</Text>
                      ) : null}
                      {ref.email && ref.phone ? (
                        <Text style={[styles.referenceContact, { color: "#cbd5e1" }]}>|</Text>
                      ) : null}
                      {ref.phone ? (
                        <Text style={styles.referenceContact}>{t("tel", lang)}: {ref.phone}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  // Render Elegant Layout
  const renderElegant = () => (
    <View style={{ padding: 36 }}>
      {/* Centered serif-style header */}
      <View style={{ alignItems: "center", borderBottomWidth: 2, borderBottomColor: primaryColor, paddingBottom: 15, marginBottom: 15 }}>
        {personalInfo.photo ? (
          <Image
            src={personalInfo.photo}
            style={[
              styles.photo,
              { borderRadius: 2, marginBottom: 8 },
              data.theme?.photoAspectRatio === "4:6" ? { width: 60, height: 90 } : { width: 66, height: 88 }
            ]}
          />
        ) : null}
        <Text style={{ fontSize: 22, color: primaryColor, fontFamily: "Helvetica-Bold", textTransform: "uppercase" }}>{personalInfo.fullName || "Your Name"}</Text>
        <Text style={{ fontSize: 10, color: "#64748b", marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>{personalInfo.jobTitle || "Professional Title"}</Text>
        {personalInfo.targetRole ? (
          <Text style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", marginTop: 2, letterSpacing: 0.5 }}>
            {t("appliedFor", lang)}: {personalInfo.targetRole}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 10, fontSize: 8, color: "#475569" }}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>• {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>• {personalInfo.location}</Text> : null}
        </View>
      </View>

      <View style={{ gap: 15 }}>
        {professionalSummary ? (
          <View style={{ gap: 4 }} wrap={false}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("professionalSummary", lang)}</Text>
            <Text style={styles.summaryText}>{professionalSummary}</Text>
          </View>
        ) : null}

        {experience && experience.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("workExperience", lang)}</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{exp.position} at {exp.company}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                </View>
                {exp.description ? <Text style={styles.itemDescription}>{exp.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {education && education.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("education", lang)}</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{edu.major} at {edu.school}</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                </View>
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {projects && projects.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("projects", lang)}</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                  {proj.link ? <Text style={{ fontSize: 8, color: primaryColor }}>{cleanLink(proj.link)}</Text> : null}
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
          {skills && skills.length > 0 ? (
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("skills", lang)}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {skills.map((skill, idx) => (
                  <Text key={idx} style={{ fontSize: 8, paddingHorizontal: 4, paddingVertical: 1, backgroundColor: "#f1f5f9", color: "#475569", borderRadius: 2 }}>{skill}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {languages && languages.length > 0 ? (
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 8, marginBottom: 2 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#334155" }}>{langItem.name}</Text>
                  <Text style={{ color: "#64748b", fontStyle: "italic" }}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {references && references.length > 0 ? (
          <View style={{ gap: 6 }} wrap={false}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("references", lang)}</Text>
            <View style={{ flexDirection: "row", gap: 15 }}>
              {references.map((ref) => (
                <View key={ref.id} style={{ flex: 1, fontSize: 8 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{ref.name}</Text>
                  {ref.relationship || ref.company ? <Text style={{ color: "#64748b" }}>{ref.relationship} {ref.company ? `at ${ref.company}` : ""}</Text> : null}
                  {ref.email ? <Text>{t("email", lang)}: {ref.email}</Text> : null}
                  {ref.phone ? <Text>{t("tel", lang)}: {ref.phone}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  // Render Executive Layout
  const renderExecutive = () => {
    const sidebarBg = data.theme?.sidebarBackgroundColor || primaryColor;
    const isSidebarLight = isLightColor(sidebarBg);
    const sidebarTextColor = isSidebarLight ? "#1e293b" : "#ffffff";
    const sidebarMutedColor = isSidebarLight ? "#475569" : "#f1f5f9";
    const sidebarSubMutedColor = isSidebarLight ? "#64748b" : "#e2e8f0";
    const borderBottomColor = isSidebarLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)";

    return (
      <View style={{ flexDirection: "row", height: "100%" }}>
        {/* Left Sidebar */}
        <View style={{ width: 170, backgroundColor: sidebarBg, padding: 20, color: sidebarTextColor }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={[
                styles.photo,
                { borderRadius: 6, borderWidth: 2, borderColor: isSidebarLight ? "rgba(0,0,0,0.1)" : "#ffffff", marginLeft: "auto", marginRight: "auto", marginBottom: 12 },
                data.theme?.photoAspectRatio === "4:6" ? { width: 60, height: 90 } : { width: 66, height: 88 }
              ]}
            />
          ) : null}
          <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: sidebarTextColor, textTransform: "uppercase", textAlign: "center" }}>{personalInfo.fullName || "Your Name"}</Text>
          <Text style={{ fontSize: 8, color: sidebarMutedColor, textAlign: "center", marginTop: 2, textTransform: "uppercase" }}>{personalInfo.jobTitle || "Professional Title"}</Text>
          
          <View style={{ marginTop: 20, gap: 10, fontSize: 7.5 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: sidebarSubMutedColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: borderBottomColor, paddingBottom: 2 }}>{t("contact", lang)}</Text>
            {personalInfo.phone ? <Text style={{ color: sidebarTextColor }}>P: {personalInfo.phone}</Text> : null}
            {personalInfo.email ? <Text style={{ color: sidebarTextColor }}>E: {personalInfo.email}</Text> : null}
            {personalInfo.location ? <Text style={{ color: sidebarTextColor }}>L: {personalInfo.location}</Text> : null}
            {personalInfo.dob ? <Text style={{ color: sidebarTextColor }}>D: {personalInfo.dob}</Text> : null}
            {personalInfo.nationality ? <Text style={{ color: sidebarTextColor }}>N: {personalInfo.nationality}</Text> : null}
          </View>
  
          {skills && skills.length > 0 ? (
            <View style={{ marginTop: 20, gap: 6 }}>
              <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: sidebarSubMutedColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: borderBottomColor, paddingBottom: 2 }}>{t("skills", lang)}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                {skills.map((skill, idx) => (
                  <Text 
                    key={idx} 
                    style={{ 
                      fontSize: 7, 
                      paddingHorizontal: 3, 
                      paddingVertical: 1, 
                      backgroundColor: isSidebarLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.15)", 
                      color: sidebarTextColor, 
                      borderRadius: 2,
                      borderWidth: isSidebarLight ? 0.5 : 0,
                      borderColor: isSidebarLight ? "rgba(0,0,0,0.08)" : "transparent"
                    }}
                  >
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}
  
          {languages && languages.length > 0 ? (
            <View style={{ marginTop: 20, gap: 4, fontSize: 7.5 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", color: sidebarSubMutedColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: borderBottomColor, paddingBottom: 2 }}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: sidebarTextColor }}>{langItem.name}</Text>
                  <Text style={{ color: sidebarMutedColor }}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

      {/* Right Column */}
      <View style={{ flex: 1, padding: 25, gap: 15 }}>
        {personalInfo.targetRole ? (
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
        ) : null}

        {professionalSummary ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 }}>{t("profile", lang)}</Text>
            <Text style={styles.summaryText}>{professionalSummary}</Text>
          </View>
        ) : null}

        {experience && experience.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 }}>{t("workExperience", lang)}</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{exp.position} at {exp.company}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                </View>
                {exp.description ? <Text style={styles.itemDescription}>{exp.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {education && education.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 }}>{t("education", lang)}</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{edu.major} at {edu.school}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                </View>
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {projects && projects.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 }}>{t("projects", lang)}</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 4 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                  {proj.link ? <Text style={{ fontSize: 7.5, color: primaryColor }}>{cleanLink(proj.link)}</Text> : null}
                </View>
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {references && references.length > 0 ? (
          <View style={{ gap: 6 }} wrap={false}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 2 }}>{t("references", lang)}</Text>
            <View style={{ flexDirection: "row", gap: 15 }}>
              {references.map((ref) => (
                <View key={ref.id} style={{ flex: 1, fontSize: 8 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{ref.name}</Text>
                  {ref.relationship || ref.company ? <Text style={{ color: "#64748b" }}>{ref.relationship} {ref.company ? `at ${ref.company}` : ""}</Text> : null}
                  {ref.email ? <Text>{t("email", lang)}: {ref.email}</Text> : null}
                  {ref.phone ? <Text>{t("tel", lang)}: {ref.phone}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

  // Render Fancy Grid Layout
  const renderFancyGrid = () => (
    <View style={{ padding: 25, backgroundColor: "#f8fafc", gap: 15 }}>
      {/* Top Header Card */}
      <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={[
                styles.photo,
                { borderRadius: 6 },
                data.theme?.photoAspectRatio === "4:6" ? { width: 50, height: 75 } : { width: 55, height: 73 }
              ]}
            />
          ) : null}
          <View>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase", marginTop: 2 }}>{personalInfo.jobTitle || "Professional Title"}</Text>
            {personalInfo.targetRole ? (
              <Text style={{ fontSize: 7, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
            ) : null}
          </View>
        </View>
        <View style={{ fontSize: 7.5, color: "#475569", alignItems: "flex-end" }}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
        </View>
      </View>

      {/* Main split grid */}
      <View style={{ flexDirection: "row", gap: 15 }}>
        {/* Left column */}
        <View style={{ width: 160, gap: 15 }}>
          {professionalSummary ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 4 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("profile", lang)}</Text>
              <Text style={{ fontSize: 7.5, color: "#475569" }}>{professionalSummary}</Text>
            </View>
          ) : null}

          {skills && skills.length > 0 ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 6 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("skills", lang)}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                {skills.map((skill, idx) => (
                  <Text key={idx} style={{ fontSize: 7, paddingHorizontal: 3, paddingVertical: 1, backgroundColor: "#f1f5f9", color: "#475569", borderRadius: 2 }}>{skill}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {languages && languages.length > 0 ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 4 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 7.5 }}>
                  <Text style={{ color: "#334155", fontFamily: "Helvetica-Bold" }}>{langItem.name}</Text>
                  <Text style={{ color: "#64748b" }}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Right column */}
        <View style={{ flex: 1, gap: 15 }}>
          {experience && experience.length > 0 ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 6 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("workExperience", lang)}</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{exp.position} at {exp.company}</Text>
                    <Text style={{ fontSize: 7, color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                  </View>
                  {exp.description ? <Text style={{ fontSize: 7.5, color: "#475569" }}>{exp.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {education && education.length > 0 ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 6 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("education", lang)}</Text>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{edu.major}</Text>
                    <Text style={{ fontSize: 7, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                  </View>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{edu.school}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {projects && projects.length > 0 ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 6 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("projects", lang)}</Text>
              {projects.map((proj) => (
                <View key={proj.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                    {proj.link ? <Text style={{ fontSize: 7, color: primaryColor }}>{cleanLink(proj.link)}</Text> : null}
                  </View>
                  {proj.description ? <Text style={{ fontSize: 7.5, color: "#475569" }}>{proj.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {references && references.length > 0 ? (
            <View style={{ backgroundColor: "#ffffff", borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 8, padding: 12, gap: 6 }} wrap={false}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase" }}>{t("references", lang)}</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {references.map((ref) => (
                  <View key={ref.id} style={{ flex: 1, fontSize: 7.5 }}>
                    <Text style={{ fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{ref.name}</Text>
                    {ref.relationship || ref.company ? <Text style={{ color: "#64748b" }}>{ref.relationship} {ref.company ? `at ${ref.company}` : ""}</Text> : null}
                    {ref.email ? <Text>{ref.email}</Text> : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  // Render Simple Left Layout
  const renderSimpleLeft = () => (
    <View style={{ padding: 36, gap: 20 }}>
      {/* Header simple top */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={[
                styles.photo,
                { borderRadius: 2 },
                data.theme?.photoAspectRatio === "4:6" ? { width: 50, height: 75 } : { width: 55, height: 73 }
              ]}
            />
          ) : null}
          <View>
            <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", marginTop: 2 }}>{personalInfo.jobTitle || "Professional Title"}</Text>
            {personalInfo.targetRole ? (
              <Text style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
            ) : null}
          </View>
        </View>
        <View style={{ fontSize: 8, color: "#64748b", alignItems: "flex-end" }}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
        </View>
      </View>

      {/* Row layout sections */}
      <View style={{ gap: 15 }}>
        {professionalSummary ? (
          <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("profile", lang)}</Text>
            <Text style={[styles.summaryText, { flex: 1 }]}>{professionalSummary}</Text>
          </View>
        ) : null}

        {experience && experience.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 20 }}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("workExperience", lang)}</Text>
            <View style={{ flex: 1, gap: 8 }}>
              {experience.map((exp) => (
                <View key={exp.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{exp.position} at {exp.company}</Text>
                    <Text style={{ fontSize: 8, color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                  </View>
                  {exp.description ? <Text style={styles.itemDescription}>{exp.description}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {education && education.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 20 }}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("education", lang)}</Text>
            <View style={{ flex: 1, gap: 8 }}>
              {education.map((edu) => (
                <View key={edu.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{edu.major}</Text>
                    <Text style={{ fontSize: 8, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                  </View>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{edu.school}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {projects && projects.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 20 }}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("projects", lang)}</Text>
            <View style={{ flex: 1, gap: 8 }}>
              {projects.map((proj) => (
                <View key={proj.id} style={{ marginBottom: 4 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                    {proj.link ? <Text style={{ fontSize: 8, color: primaryColor }}>{cleanLink(proj.link)}</Text> : null}
                  </View>
                  {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {skills && skills.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("skills", lang)}</Text>
            <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
              {skills.map((skill, idx) => (
                <Text key={idx} style={{ fontSize: 8, paddingHorizontal: 5, paddingVertical: 1.5, backgroundColor: "#f1f5f9", color: "#475569", borderRadius: 2 }}>{skill}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {languages && languages.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("languages", lang)}</Text>
            <View style={{ flex: 1, flexDirection: "row", gap: 15 }}>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", gap: 4, fontSize: 8 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#334155" }}>{langItem.name}</Text>
                  <Text style={{ color: "#64748b" }}>({langItem.level})</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {references && references.length > 0 ? (
          <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
            <Text style={{ width: 100, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" }}>{t("references", lang)}</Text>
            <View style={{ flex: 1, flexDirection: "row", gap: 15 }}>
              {references.map((ref) => (
                <View key={ref.id} style={{ flex: 1, fontSize: 8 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{ref.name}</Text>
                  {ref.relationship || ref.company ? <Text style={{ color: "#64748b" }}>{ref.relationship} {ref.company ? `at ${ref.company}` : ""}</Text> : null}
                  {ref.email ? <Text>{ref.email}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  // Render Timeline Layout
  const renderTimeline = () => (
    <View style={{ padding: 36, gap: 15 }}>
      {/* Header left border */}
      <View style={{ borderLeftWidth: 3, borderLeftColor: primaryColor, paddingLeft: 12, marginBottom: 10 }}>
        <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0f172a", textTransform: "uppercase" }}>{personalInfo.fullName || "Your Name"}</Text>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase", marginTop: 2 }}>{personalInfo.jobTitle || "Professional Title"}</Text>
        {personalInfo.targetRole ? (
          <Text style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
        ) : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8, fontSize: 7.5, color: "#64748b" }}>
          {personalInfo.email ? <Text>Email: {personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>Tel: {personalInfo.phone}</Text> : null}
          {personalInfo.location ? <Text>Location: {personalInfo.location}</Text> : null}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 20 }}>
        {/* Left column */}
        <View style={{ flex: 2, gap: 15 }}>
          {professionalSummary ? (
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("profile", lang)}</Text>
              <Text style={styles.summaryText}>{professionalSummary}</Text>
            </View>
          ) : null}

          {experience && experience.length > 0 ? (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("workExperience", lang)}</Text>
              <View style={{ borderLeftWidth: 1, borderLeftColor: `${primaryColor}40`, paddingLeft: 10, marginLeft: 3, gap: 8 }}>
                {experience.map((exp) => (
                  <View key={exp.id} wrap={false}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                      <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{exp.position} at {exp.company}</Text>
                      <Text style={{ fontSize: 7.5, color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                    </View>
                    {exp.description ? <Text style={styles.itemDescription}>{exp.description}</Text> : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {education && education.length > 0 ? (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("education", lang)}</Text>
              <View style={{ borderLeftWidth: 1, borderLeftColor: `${primaryColor}40`, paddingLeft: 10, marginLeft: 3, gap: 8 }}>
                {education.map((edu) => (
                  <View key={edu.id} wrap={false}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                      <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{edu.major}</Text>
                      <Text style={{ fontSize: 7.5, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                    </View>
                    <Text style={{ fontSize: 7.5, color: "#64748b" }}>{edu.school}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Right column */}
        <View style={{ flex: 1, gap: 15 }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={[
                styles.photo,
                { borderRadius: 6, marginBottom: 5 },
                data.theme?.photoAspectRatio === "4:6" ? { width: 60, height: 90 } : { width: 66, height: 88 }
              ]}
            />
          ) : null}

          {skills && skills.length > 0 ? (
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("skills", lang)}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                {skills.map((skill, idx) => (
                  <Text key={idx} style={{ fontSize: 7, paddingHorizontal: 3, paddingVertical: 1, backgroundColor: "#f1f5f9", color: "#475569", borderRadius: 2 }}>{skill}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {languages && languages.length > 0 ? (
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 7.5 }}>
                  <Text style={{ color: "#334155", fontFamily: "Helvetica-Bold" }}>{langItem.name}</Text>
                  <Text style={{ color: "#64748b" }}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {projects && projects.length > 0 ? (
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("projects", lang)}</Text>
              {projects.map((proj) => (
                <View key={proj.id} style={{ fontSize: 7.5, marginBottom: 4 }} wrap={false}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                  {proj.link ? <Text style={{ color: primaryColor }}>{cleanLink(proj.link)}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {references && references.length > 0 ? (
            <View style={{ gap: 4 }} wrap={false}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2 }}>{t("references", lang)}</Text>
              {references.map((ref) => (
                <View key={ref.id} style={{ fontSize: 7, marginBottom: 4 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{ref.name}</Text>
                  <Text style={{ color: "#64748b" }}>{ref.email}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  // Helper for Initials
  const getInitials = (name: string) => {
    const cleanName = name || "Your Name";
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "YN";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
  };

  // Render Portfolio Layout
  const renderPortfolio = () => (
    <View style={{ padding: 36, gap: 15 }}>
      {/* Header initials badge */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingBottom: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={[
                styles.photo,
                { borderRadius: 50 },
                data.theme?.photoAspectRatio === "4:6" ? { width: 60, height: 60 } : { width: 60, height: 60 }
              ]}
            />
          ) : (
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: primaryColor, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: "Helvetica-Bold" }}>{getInitials(personalInfo.fullName)}</Text>
            </View>
          )}
          <View>
            <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: primaryColor, textTransform: "uppercase", marginTop: 2 }}>{personalInfo.jobTitle || "Professional Title"}</Text>
            {personalInfo.targetRole ? (
              <Text style={{ fontSize: 7.5, color: "#94a3b8", textTransform: "uppercase", marginTop: 2 }}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
            ) : null}
          </View>
        </View>
        <View style={{ fontSize: 8, color: "#64748b", alignItems: "flex-end" }}>
          {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
          {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
        </View>
      </View>

      <View style={{ gap: 15 }}>
        {professionalSummary ? (
          <View style={{ gap: 4 }} wrap={false}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("profile", lang)}</Text>
            <Text style={styles.summaryText}>{professionalSummary}</Text>
          </View>
        ) : null}

        {experience && experience.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("workExperience", lang)}</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ flexDirection: "row", gap: 15, marginBottom: 4 }} wrap={false}>
                <Text style={{ width: 100, fontSize: 8, color: "#64748b", fontFamily: "Helvetica-Bold" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{exp.position} at {exp.company}</Text>
                  {exp.description ? <Text style={styles.itemDescription}>{exp.description}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {education && education.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("education", lang)}</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ flexDirection: "row", gap: 15, marginBottom: 4 }} wrap={false}>
                <Text style={{ width: 100, fontSize: 8, color: "#64748b", fontFamily: "Helvetica-Bold" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{edu.major} at {edu.school}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {projects && projects.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("projects", lang)}</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ flexDirection: "row", gap: 15, marginBottom: 4 }} wrap={false}>
                <Text style={{ width: 100, fontSize: 8, color: primaryColor, fontFamily: "Helvetica-Bold" }}>{proj.link ? cleanLink(proj.link) : "Project"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                  {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
          {skills && skills.length > 0 ? (
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("skills", lang)}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                {skills.map((skill, idx) => (
                  <Text key={idx} style={{ fontSize: 7.5, paddingHorizontal: 4, paddingVertical: 1, backgroundColor: "#f1f5f9", color: "#475569", borderRadius: 2 }}>{skill}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {languages && languages.length > 0 ? (
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("languages", lang)}</Text>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 7.5 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{langItem.name}</Text>
                  <Text style={{ color: "#64748b" }}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {references && references.length > 0 ? (
          <View style={{ gap: 6 }} wrap={false}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase" }}>{t("references", lang)}</Text>
            <View style={{ flexDirection: "row", gap: 15 }}>
              {references.map((ref) => (
                <View key={ref.id} style={{ flex: 1, fontSize: 8 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{ref.name}</Text>
                  {ref.relationship || ref.company ? <Text style={{ color: "#64748b" }}>{ref.relationship} {ref.company ? `at ${ref.company}` : ""}</Text> : null}
                  {ref.email ? <Text>{ref.email}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderCanvaColumn = () => {
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

    const localPrimaryColor = data.theme?.primaryColor && data.theme.primaryColor !== "#2563eb"
      ? data.theme.primaryColor
      : "#0f2954";

    const localBannerColor = data.theme?.primaryColor && data.theme.primaryColor !== "#2563eb"
      ? `${data.theme.primaryColor}dd`
      : "#3f5c80";

    const localSidebarBg = data.theme?.sidebarBackgroundColor || localPrimaryColor;
    const isSidebarLight = isLightColor(localSidebarBg);
    const sidebarTextColor = isSidebarLight ? "#1e293b" : "#ffffff";
    const sidebarMutedColor = isSidebarLight ? "#475569" : "#cbd5e1";
    const sidebarSubMutedColor = isSidebarLight ? "#64748b" : "#94a3b8";

    return (
      <View style={{ flexDirection: "row", height: "100%" }}>
        {/* Left Sidebar */}
        <View style={{ width: 170, backgroundColor: localSidebarBg, padding: 15, color: sidebarTextColor }}>
          {personalInfo.photo ? (
            <Image
              src={personalInfo.photo}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                borderWidth: 2,
                borderColor: isSidebarLight ? "rgba(0,0,0,0.15)" : "#ffffff",
                alignSelf: "center",
                marginBottom: 15,
                objectFit: "cover"
              }}
            />
          ) : null}

          {/* CONTACT */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ backgroundColor: isSidebarLight ? localPrimaryColor : "#ffffff", paddingVertical: 2.5, borderRadius: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: isSidebarLight ? "#ffffff" : localPrimaryColor, textAlign: "center", textTransform: "uppercase" }}>{t("contact", lang)}</Text>
            </View>
            <View style={{ gap: 6 }}>
              {personalInfo.phone ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 0.5, borderColor: isSidebarLight ? "rgba(0,0,0,0.2)" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 6, color: isSidebarLight ? localPrimaryColor : "#ffffff", fontFamily: "Helvetica-Bold", lineHeight: 1 }}>P</Text>
                  </View>
                  <Text style={{ fontSize: 7.5, color: sidebarTextColor, flex: 1, lineHeight: 1 }}>{personalInfo.phone}</Text>
                </View>
              ) : null}
              {personalInfo.email ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 0.5, borderColor: isSidebarLight ? "rgba(0,0,0,0.2)" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 6, color: isSidebarLight ? localPrimaryColor : "#ffffff", fontFamily: "Helvetica-Bold", lineHeight: 1 }}>E</Text>
                  </View>
                  <Text style={{ fontSize: 7.5, color: sidebarTextColor, flex: 1, lineHeight: 1 }}>{personalInfo.email}</Text>
                </View>
              ) : null}
              {personalInfo.location ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 0.5, borderColor: isSidebarLight ? "rgba(0,0,0,0.2)" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 6, color: isSidebarLight ? localPrimaryColor : "#ffffff", fontFamily: "Helvetica-Bold", lineHeight: 1 }}>L</Text>
                  </View>
                  <Text style={{ fontSize: 7.5, color: sidebarTextColor, flex: 1, lineHeight: 1 }}>{personalInfo.location}</Text>
                </View>
              ) : null}
              {personalInfo.portfolio ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 0.5, borderColor: isSidebarLight ? "rgba(0,0,0,0.2)" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 6, color: isSidebarLight ? localPrimaryColor : "#ffffff", fontFamily: "Helvetica-Bold", lineHeight: 1 }}>W</Text>
                  </View>
                  <Text style={{ fontSize: 7.5, color: sidebarTextColor, flex: 1, lineHeight: 1 }}>{cleanLink(personalInfo.portfolio)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* EDUCATION */}
          {education && education.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <View style={{ backgroundColor: isSidebarLight ? localPrimaryColor : "#ffffff", paddingVertical: 2.5, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: isSidebarLight ? "#ffffff" : localPrimaryColor, textAlign: "center", textTransform: "uppercase" }}>{t("education", lang)}</Text>
              </View>
              <View style={{ gap: 6 }}>
                {education.map((edu) => (
                  <View key={edu.id} style={{ gap: 1 }} wrap={false} break={edu.pageBreakBefore}>
                    <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: sidebarTextColor }}>{edu.major}</Text>
                    <Text style={{ fontSize: 7, color: sidebarMutedColor }}>{edu.school}</Text>
                    <Text style={{ fontSize: 6.5, color: sidebarSubMutedColor }}>{edu.startDate} – {edu.endDate || t("present", lang)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* LANGUAGES */}
          {languages && languages.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <View style={{ backgroundColor: isSidebarLight ? localPrimaryColor : "#ffffff", paddingVertical: 2.5, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: isSidebarLight ? "#ffffff" : localPrimaryColor, textAlign: "center", textTransform: "uppercase" }}>{t("languages", lang)}</Text>
              </View>
              <View style={{ gap: 5 }}>
                {languages.map((langItem) => {
                  const percentage = parseLanguageLevel(langItem.level);
                  return (
                    <View key={langItem.id} style={{ gap: 2 }} wrap={false}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 7 }}>
                        <Text style={{ fontFamily: "Helvetica-Bold", color: sidebarTextColor }}>{langItem.name}</Text>
                        <Text style={{ color: sidebarMutedColor, fontStyle: "italic" }}>{langItem.level}</Text>
                      </View>
                      <View style={{ height: 3, backgroundColor: isSidebarLight ? "rgba(0,0,0,0.06)" : "rgba(255, 255, 255, 0.2)", borderRadius: 1.5, overflow: "hidden" }}>
                        <View style={{ height: 3, width: `${percentage}%`, backgroundColor: isSidebarLight ? localPrimaryColor : "#ffffff", borderRadius: 1.5 }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* REFERENCES */}
          {references && references.length > 0 ? (
            <View style={{ marginBottom: 12 }}>
              <View style={{ backgroundColor: isSidebarLight ? localPrimaryColor : "#ffffff", paddingVertical: 2.5, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: isSidebarLight ? "#ffffff" : localPrimaryColor, textAlign: "center", textTransform: "uppercase" }}>{t("references", lang)}</Text>
              </View>
              <View style={{ gap: 6 }}>
                {references.map((ref) => (
                  <View key={ref.id} style={{ gap: 1 }} wrap={false} break={ref.pageBreakBefore}>
                    <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: sidebarTextColor }}>{ref.name}</Text>
                    {ref.relationship || ref.company ? (
                      <Text style={{ fontSize: 6.5, color: sidebarMutedColor }}>{ref.relationship} {ref.company ? `at ${ref.company}` : ""}</Text>
                    ) : null}
                    {ref.email ? <Text style={{ fontSize: 6, color: sidebarSubMutedColor }}>{ref.email}</Text> : null}
                    {ref.phone ? <Text style={{ fontSize: 6, color: sidebarSubMutedColor }}>{ref.phone}</Text> : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Right main column */}
        <View style={{ flex: 1, backgroundColor: data.theme?.backgroundColor || "#ffffff", flexDirection: "column" }}>
          {/* Top Banner */}
          <View style={{ backgroundColor: localBannerColor, padding: 20 }}>
            <Text style={{ fontSize: 24, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase", lineHeight: 1.15 }}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase", marginTop: 4, letterSpacing: 0.8 }}>{personalInfo.jobTitle || "Professional Title"}</Text>
            {personalInfo.targetRole ? (
              <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginTop: 4 }}>{t("appliedFor", lang)}: {personalInfo.targetRole}</Text>
            ) : null}
          </View>

          {/* Content Body */}
          <View style={{ padding: 20, gap: 15 }}>
            {/* ABOUT ME */}
            {professionalSummary ? (
              <View style={{ gap: 4 }} wrap={false}>
                <View style={{ alignSelf: "flex-start", backgroundColor: localPrimaryColor, paddingVertical: 2.5, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 }}>
                  <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase" }}>{t("professionalSummary", lang)}</Text>
                </View>
                <Text style={styles.summaryText}>{professionalSummary}</Text>
              </View>
            ) : null}

            {/* EXPERIENCE */}
            {experience && experience.length > 0 ? (
              <View style={{ gap: 4 }}>
                <View style={{ alignSelf: "flex-start", backgroundColor: localPrimaryColor, paddingVertical: 2.5, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 }}>
                  <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase" }}>{t("workExperience", lang)}</Text>
                </View>
                <View style={{ borderLeftWidth: 1, borderLeftColor: localPrimaryColor, marginLeft: 5, paddingLeft: 12, gap: 8 }}>
                  {experience.map((exp) => (
                    <View key={exp.id} style={{ position: "relative", marginBottom: 4 }} wrap={false} break={exp.pageBreakBefore}>
                      {/* Timeline dot */}
                      <View style={{ position: "absolute", left: -15, top: 2, width: 5, height: 5, borderRadius: 2.5, backgroundColor: localPrimaryColor }} />
                      <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                      <Text style={{ fontSize: 8, color: "#475569", fontFamily: "Helvetica-Bold", marginTop: 1 }}>{exp.company}</Text>
                      <Text style={{ fontSize: 8.5, color: localPrimaryColor, fontFamily: "Helvetica-Bold", marginTop: 1 }}>{exp.position}</Text>
                      {exp.description ? <Text style={[styles.itemDescription, { marginTop: 2 }]}>{exp.description}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* PROJECTS */}
            {projects && projects.length > 0 ? (
              <View style={{ gap: 4 }}>
                <View style={{ alignSelf: "flex-start", backgroundColor: localPrimaryColor, paddingVertical: 2.5, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 }}>
                  <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase" }}>{t("projects", lang)}</Text>
                </View>
                <View style={{ gap: 6 }}>
                  {projects.map((proj) => (
                    <View key={proj.id} style={{ gap: 1 }} wrap={false} break={proj.pageBreakBefore}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>{proj.name}</Text>
                        {proj.link ? (
                          <Text style={{ fontSize: 7.5, color: localPrimaryColor, fontFamily: "Helvetica-Bold" }}>{proj.link.replace(/^(https?:\/\/)?(www\.)?/, "")}</Text>
                        ) : null}
                      </View>
                      {proj.technologies ? (
                        <Text style={{ fontSize: 7, color: "#64748b", fontFamily: "Helvetica-Bold" }}>Tech: {proj.technologies}</Text>
                      ) : null}
                      {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* SKILLS */}
            {skills && skills.length > 0 ? (
              <View style={{ gap: 4 }}>
                <View style={{ alignSelf: "flex-start", backgroundColor: localPrimaryColor, paddingVertical: 2.5, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 }}>
                  <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase" }}>{t("skills", lang)}</Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: "8px" }}>
                  {skills.map((skill, idx) => {
                    const { name, dots } = parseSkill(skill);
                    return (
                      <View key={idx} style={{ width: "47%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }} wrap={false}>
                        <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#334155" }}>{name}</Text>
                        <View style={{ flexDirection: "row", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((d) => (
                            <View
                              key={d}
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: 2.5,
                                backgroundColor: d <= dots ? localPrimaryColor : "#e2e8f0"
                              }}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderWhitePage = () => {
    const isEmpty = !professionalSummary && 
      (!education || education.length === 0) &&
      (!experience || experience.length === 0) &&
      (!projects || projects.length === 0) &&
      (!languages || languages.length === 0) &&
      (!references || references.length === 0) &&
      (!skills || skills.length === 0);

    if (isEmpty) {
      return <View style={{ backgroundColor: "#ffffff", height: "100%" }} />;
    }

    return (
      <View style={{ padding: 40, gap: 14 }}>
        {professionalSummary ? (
          <View style={{ gap: 4 }} wrap={false}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("professionalSummary", lang)}</Text>
            <Text style={styles.summaryText}>{professionalSummary}</Text>
          </View>
        ) : null}

        {experience && experience.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("workExperience", lang)}</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ gap: 1 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#1e293b" }}>{exp.position}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{exp.startDate} - {exp.endDate || t("present", lang)}</Text>
                </View>
                <Text style={{ fontSize: 7.5, color: "#475569", fontFamily: "Helvetica-Bold" }}>{exp.company}</Text>
                {exp.description ? <Text style={styles.itemDescription}>{exp.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {education && education.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("education", lang)}</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ gap: 1 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#1e293b" }}>{edu.major}</Text>
                  <Text style={{ fontSize: 7.5, color: "#64748b" }}>{edu.startDate} - {edu.endDate || t("present", lang)}</Text>
                </View>
                <Text style={{ fontSize: 7.5, color: "#475569", fontFamily: "Helvetica-Bold" }}>{edu.school}</Text>
                {edu.description ? <Text style={styles.itemDescription}>{edu.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {projects && projects.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("projects", lang)}</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ gap: 1 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#1e293b" }}>{proj.name}</Text>
                  {proj.link ? <Text style={{ fontSize: 7.5, color: primaryColor }}>{proj.link}</Text> : null}
                </View>
                {proj.technologies ? <Text style={{ fontSize: 7, color: "#64748b", fontFamily: "Helvetica-Bold" }}>Tech: {proj.technologies}</Text> : null}
                {proj.description ? <Text style={styles.itemDescription}>{proj.description}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {skills && skills.length > 0 ? (
          <View style={{ gap: 4 }} wrap={false}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("skills", lang)}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              {skills.map((skill, idx) => (
                <Text key={idx} style={{ fontSize: 7.5, backgroundColor: "#f1f5f9", paddingVertical: 2.5, paddingHorizontal: 6, borderRadius: 3, color: "#334155" }}>{skill}</Text>
              ))}
            </View>
          </View>
        ) : null}

        {languages && languages.length > 0 ? (
          <View style={{ gap: 4 }} wrap={false}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("languages", lang)}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {languages.map((langItem) => (
                <View key={langItem.id} style={{ flexDirection: "row", gap: 5 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#334155" }}>{langItem.name}:</Text>
                  <Text style={{ fontSize: 8, color: "#64748b" }}>{langItem.level}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {references && references.length > 0 ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: primaryColor, borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1", paddingBottom: 2, textTransform: "uppercase" }}>{t("references", lang)}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 15 }}>
              {references.map((ref) => (
                <View key={ref.id} style={{ gap: 1, width: "45%" }} wrap={false}>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e293b" }}>{ref.name}</Text>
                  <Text style={{ fontSize: 7, color: "#475569" }}>{ref.relationship} {ref.company ? `@ ${ref.company}` : ""}</Text>
                  {ref.email ? <Text style={{ fontSize: 6.5, color: "#64748b" }}>Email: {ref.email}</Text> : null}
                  {ref.phone ? <Text style={{ fontSize: 6.5, color: "#64748b" }}>Tel: {ref.phone}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  };
  const renderKSHRD = (pageNumber: number = 1) => {
    const localPrimaryColor = primaryColor || "#102a54";
    const photoScale = Math.min(125, Math.max(80, data.theme?.photoScale ?? 100)) / 100;
    const photoDimensions = { width: 70 * photoScale, height: 90 * photoScale };

    const parseHighlightPDF = (text: string | undefined) => {
      if (!text) return "";
      const parts = text.split("==");
      return parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return (
            <Text key={idx} style={{ backgroundColor: "#fef08a", fontFamily: "Times-Bold", color: "#1e293b", paddingHorizontal: 2 }}>
              {part}
            </Text>
          );
        }
        return part;
      });
    };

    const renderPDFRow = (label: string, value: string | undefined, indent: boolean = false) => {
      if (!value) return null;
      return (
        <View style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1, fontFamily: "Times-Roman" }} wrap={false}>
          {indent ? (
            <View style={{ width: 100, borderLeftWidth: 0.5, borderLeftColor: "#cbd5e1", paddingLeft: 6 }}>
              <Text style={{ fontFamily: "Times-Bold", color: "#334155" }}>{label}</Text>
            </View>
          ) : (
            <Text style={{ width: 100, fontFamily: "Times-Bold", color: "#334155" }}>{label}</Text>
          )}
          <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
          <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Times-Roman" }}>{parseHighlightPDF(value)}</Text>
        </View>
      );
    };

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
      <View style={{ padding: 40, flex: 1, flexDirection: "column", height: "100%", backgroundColor: "#ffffff", fontFamily: "Times-Roman" }}>
        {/* Header Block */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1.5, borderBottomColor: localPrimaryColor, paddingBottom: 6 }}>
          <View style={{ width: 140, alignItems: "center" }}>
            {personalInfo.logo ? (
              <Image 
                src={personalInfo.logo} 
                style={{ width: 90 * (Math.min(250, Math.max(80, data.theme?.logoScale ?? 100)) / 100), height: 90 * (Math.min(250, Math.max(80, data.theme?.logoScale ?? 100)) / 100), objectFit: "contain" }}
              />
            ) : (
              <>
                <Svg viewBox="0 0 100 100" style={{ width: 90 * (Math.min(250, Math.max(80, data.theme?.logoScale ?? 100)) / 100), height: 90 * (Math.min(250, Math.max(80, data.theme?.logoScale ?? 100)) / 100) }}>
                  <Circle cx={50} cy={50} r={45} stroke="#102a54" strokeWidth={2.5} fill="none" />
                  <Circle cx={50} cy={50} r={32} stroke="#102a54" strokeWidth={1} fill="none" />
                  <G transform="rotate(-30, 50, 50)">
                    <Path d="M 50 20 A 15 15 0 0 0 50 50 A 15 15 0 0 1 50 80 A 30 30 0 0 1 50 20" fill="#e82c2a" />
                    <Path d="M 50 20 A 30 30 0 0 0 50 80 A 15 15 0 0 1 50 50 A 15 15 0 0 0 50 20" fill="#0f4c81" />
                  </G>
                  <Path d="M 50 5 L 50 20 M 50 80 L 50 95 M 5 50 L 20 50 M 80 50 L 95 50" stroke="#102a54" strokeWidth={2} />
                </Svg>
                <Text style={{ fontSize: 3.8, textAlign: "center", fontFamily: "Times-Bold", color: "#475569", marginTop: 2, lineHeight: 1.2 }}>
                  KOREA SOFTWARE{"\n"}HRD CENTER
                </Text>
              </>
            )}
          </View>

          <View style={{ flex: 1, alignItems: "center", marginHorizontal: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: "Times-Bold", color: "#102a54", textTransform: "uppercase", textAlign: "center" }}>
              Korea Software HRD Center Student{"'"}s Background
            </Text>
            <Text style={{ fontSize: 7, color: "#102a54", marginTop: 1, textAlign: "center" }}>
              #12, St 323, Boeungkak II Commune, Toul Kork District, Phnom Penh.
            </Text>
            <Text style={{ fontSize: 7, color: "#102a54", textAlign: "center" }}>
              Tel: (855) 23 99 13 14 / 012 99 89 19
            </Text>
            <Text style={{ fontSize: 7, color: "#2563eb", fontFamily: "Times-Bold", textDecoration: "underline", textAlign: "center" }}>
              www.kshrd.com.kh / FB: www.facebook.com/ksignhrd
            </Text>
          </View>

          <View>
            {personalInfo.photo ? (
              <Image 
                src={personalInfo.photo} 
                style={{ ...photoDimensions, borderWidth: 1.5, borderColor: localPrimaryColor, objectFit: "cover" }}
              />
            ) : (
              <View style={{ ...photoDimensions, borderWidth: 1.5, borderColor: localPrimaryColor, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 7, color: "#94a3b8", fontFamily: "Times-Bold" }}>PHOTO (3x4)</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <View style={{ alignItems: "center", marginVertical: 12 }}>
          <Text style={{ fontSize: 12, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", letterSpacing: 1.5 }}>
            CURRICULUM VITAE
          </Text>
        </View>

        {/* Name & Basic rows */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 10, fontFamily: "Times-Bold", color: "#102a54", textTransform: "uppercase", marginBottom: 4 }}>
            MR. {personalInfo.fullName}
          </Text>
          {renderPDFRow("Address", personalInfo.location)}
          {renderPDFRow("Phone", personalInfo.phone)}
          {renderPDFRow("E-mail", personalInfo.email)}
        </View>

        {/* 1. Personal Data */}
        <View style={{ marginBottom: 12 }} wrap={false}>
          <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
            1. PERSONAL DATA
          </Text>
          {renderPDFRow("Sex", personalInfo.gender || "Male")}
          {renderPDFRow("Date of Birth", personalInfo.dob || "03-04-2004")}
          {renderPDFRow("Place of Birth", personalInfo.placeOfBirth || "Kohkong")}
          {renderPDFRow("Nationality", personalInfo.nationality || "Khmer")}
          {renderPDFRow("Marital Status", personalInfo.maritalStatus || "Single")}
          {renderPDFRow("Health Situation", personalInfo.health || "Excellent")}
        </View>

        {/* 2. HRD Center Trainee */}
        <View style={{ marginBottom: 12 }} wrap={false}>
          <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
            2. HRD CENTER TRAINEE
          </Text>
          
          {hrdTraineeItems.length > 0 ? (
            hrdTraineeItems.map((item, idx) => {
              const shouldHighlight = item.highlight !== undefined ? item.highlight : true;
              return (
                <View key={idx} style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1, fontFamily: "Times-Roman" }}>
                    <Text style={{ width: 100, fontFamily: "Times-Bold", color: "#334155" }}>Basic Course</Text>
                    <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
                    <View style={{ flex: 1 }}>
                      {shouldHighlight ? (
                        <Text style={{ fontFamily: "Times-Bold", backgroundColor: "#fef08a", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, color: "#1e293b", alignSelf: "flex-start" }}>
                          {item.startDate} - {item.endDate || "Present"}
                        </Text>
                      ) : (
                        <Text style={{ fontFamily: "Times-Bold", color: "#1e293b" }}>
                          {item.startDate} - {item.endDate || "Present"}
                        </Text>
                      )}
                    </View>
                  </View>

                  {item.description ? (
                    <View style={{ paddingLeft: 12, gap: 2 }}>
                      {item.description.split("\n").map((line, lIdx) => {
                        const colonIdx = line.indexOf(":");
                        if (colonIdx !== -1) {
                          const subject = line.substring(0, colonIdx).trim().replace(/^[➤\-\*]*/, "").trim();
                          const desc = line.substring(colonIdx + 1).trim();
                          return (
                            <View key={lIdx} style={{ flexDirection: "row", fontSize: 8, color: "#334155", fontFamily: "Times-Roman" }}>
                              <Text style={{ color: "#102a54", marginRight: 4, fontFamily: "Times-Bold" }}>-</Text>
                              <Text style={{ fontFamily: "Times-Bold", color: "#102a54" }}>{parseHighlightPDF(subject)} : </Text>
                              <Text style={{ flex: 1 }}>{parseHighlightPDF(desc)}</Text>
                            </View>
                          );
                        }
                        return (
                          <View key={lIdx} style={{ flexDirection: "row", fontSize: 8, color: "#334155", fontFamily: "Times-Roman" }}>
                            <Text style={{ color: "#102a54", marginRight: 4, fontFamily: "Times-Bold" }}>-</Text>
                            <Text style={{ flex: 1 }}>{parseHighlightPDF(line.replace(/^[➤\-\*]*/, "").trim())}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })
          ) : (
            <View style={{ gap: 4, fontFamily: "Times-Roman" }}>
              <View style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1 }}>
                <Text style={{ width: 100, fontFamily: "Times-Bold", color: "#334155" }}>Basic Course</Text>
                <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Times-Bold", backgroundColor: "#fef08a", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, color: "#1e293b", alignSelf: "flex-start" }}>
                    February 02nd – July 09th, 2026, Mon-Fri, 7.5 hours per day, 810 hours
                  </Text>
                </View>
              </View>
              
              <View style={{ paddingLeft: 12, gap: 1.5 }}>
                <View style={{ flexDirection: "row", fontSize: 8, color: "#334155" }}>
                  <Text style={{ color: "#102a54", marginRight: 4 }}>-</Text>
                  <Text style={{ fontFamily: "Times-Bold", color: "#102a54" }}>JAVA : </Text>
                  <Text style={{ flex: 1 }}>J2SE (Basic Java and OOP concepts), J2EE (Maven and MVC pattern)</Text>
                </View>
                <View style={{ flexDirection: "row", fontSize: 8, color: "#334155" }}>
                  <Text style={{ color: "#102a54", marginRight: 4 }}>-</Text>
                  <Text style={{ fontFamily: "Times-Bold", color: "#102a54" }}>WEB : </Text>
                  <Text style={{ flex: 1 }}>HTML, CSS, JavaScript, CSS Flexbox, Tailwind CSS, JSON, Next.js</Text>
                </View>
                <View style={{ flexDirection: "row", fontSize: 8, color: "#334155" }}>
                  <Text style={{ color: "#102a54", marginRight: 4 }}>-</Text>
                  <Text style={{ fontFamily: "Times-Bold", color: "#102a54" }}>SPRING : </Text>
                  <Text style={{ flex: 1 }}>Spring Boot, MyBatis Data Access, Spring RESTful Web Service, Spring Security, JSON Web Token</Text>
                </View>
                <View style={{ flexDirection: "row", fontSize: 8, color: "#334155" }}>
                  <Text style={{ color: "#102a54", marginRight: 4 }}>-</Text>
                  <Text style={{ fontFamily: "Times-Bold", color: "#102a54" }}>Database : </Text>
                  <Text style={{ flex: 1 }}>Data Modeling, PostgreSQL, SQL(Basic SQL)</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 3. Academic Background */}
        <View style={{ marginBottom: 12 }} wrap={false}>
          <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
            3. ACADEMIC BACKGROUND
          </Text>
          <View style={{ gap: 3 }}>
            {academicItems.length > 0 ? (
              academicItems.map((edu) => (
                <View key={edu.id} style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1, fontFamily: "Times-Roman" }}>
                  {edu.highlight ? (
                    <View style={{ width: 100 }}>
                      <Text style={{ fontFamily: "Times-Bold", backgroundColor: "#fef08a", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, color: "#1e293b", alignSelf: "flex-start" }}>
                        {edu.startDate.substring(0, 4)} - {edu.endDate?.substring(0, 4) || "Present"}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ width: 100, fontFamily: "Times-Bold", color: "#334155" }}>
                      {edu.startDate.substring(0, 4)} - {edu.endDate?.substring(0, 4) || "Present"}
                    </Text>
                  )}
                  <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
                  <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Times-Roman" }}>
                    <Text style={{ fontFamily: "Times-Bold" }}>{parseHighlightPDF(edu.major)}</Text> at {parseHighlightPDF(edu.school)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 8, color: "#94a3b8", fontStyle: "italic", fontFamily: "Times-Roman" }}>No academic background entered.</Text>
            )}
          </View>
        </View>

        {/* 4. Work Experience */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
            4. WORK EXPERIENCE
          </Text>
          <View style={{ gap: 6 }}>
            {workItems.length > 0 ? (
              workItems.map((exp) => (
                <View key={exp.id} style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1, fontFamily: "Times-Roman" }} wrap={false}>
                  {exp.highlight ? (
                    <View style={{ width: 100 }}>
                      <Text style={{ fontFamily: "Times-Bold", backgroundColor: "#fef08a", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, color: "#1e293b", alignSelf: "flex-start" }}>
                        {exp.startDate.substring(0, 4)} - {exp.endDate?.substring(0, 4) || "Present"}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ width: 100, fontFamily: "Times-Bold", color: "#334155" }}>
                      {exp.startDate.substring(0, 4)} - {exp.endDate?.substring(0, 4) || "Present"}
                    </Text>
                  )}
                  <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Times-Roman" }}>
                      <Text style={{ fontFamily: "Times-Bold" }}>{parseHighlightPDF(exp.position)}</Text> at {parseHighlightPDF(exp.company)}
                    </Text>
                    {exp.description ? (
                      <View style={{ borderLeftWidth: 0.5, borderLeftColor: "#e2e8f0", paddingLeft: 6, marginTop: 2, fontFamily: "Times-Roman" }}>
                        <Text style={{ fontSize: 7, fontFamily: "Times-Bold", color: "#475569" }}>RESPONSIBLY:</Text>
                        <Text style={{ fontSize: 7, color: "#475569", lineHeight: 1.25 }}>{parseHighlightPDF(exp.description)}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 8, color: "#94a3b8", fontStyle: "italic", fontFamily: "Times-Roman" }}>No work experience entered.</Text>
            )}
          </View>
        </View>

        {/* 5. Languages */}
        {languages && languages.length > 0 ? (
          <View style={{ marginBottom: 12 }} wrap={false}>
            <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
              5. LANGUAGES
            </Text>
            <View style={{ gap: 3 }}>
              {languages.map((langItem) => (
                <View key={langItem.id}>
                  {renderPDFRow(langItem.name, langItem.level)}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 6. References */}
        {references && references.length > 0 ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 8.5, fontFamily: "Times-Bold", color: "#102a54", textDecoration: "underline", textTransform: "uppercase", marginBottom: 4 }}>
              6. REFERENCES AND AVAILABILITY
            </Text>
            <View style={{ gap: 8 }}>
              {references.map((ref) => (
                <View key={ref.id} style={{ gap: 2, fontFamily: "Times-Roman" }} wrap={false} break={ref.pageBreakBefore}>
                  <Text style={{ fontSize: 8, fontFamily: "Times-Bold", color: "#102a54" }}>{parseHighlightPDF(ref.name)}</Text>
                  <View style={{ gap: 1 }}>
                    {renderPDFRow("Position", ref.relationship + (ref.company ? ` @ ${ref.company}` : ""), true)}
                    {ref.phone ? (
                      <View style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1, fontFamily: "Times-Roman" }} wrap={false}>
                        <View style={{ width: 100, borderLeftWidth: 0.5, borderLeftColor: "#cbd5e1", paddingLeft: 6 }}>
                          <Text style={{ fontFamily: "Times-Bold", color: "#334155" }}>H/P</Text>
                        </View>
                        <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
                        <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Times-Bold" }}>{parseHighlightPDF(ref.phone)}</Text>
                      </View>
                    ) : null}
                    {ref.email ? (
                      <View style={{ flexDirection: "row", fontSize: 8, color: "#1e293b", marginVertical: 1, fontFamily: "Times-Roman" }} wrap={false}>
                        <View style={{ width: 100, borderLeftWidth: 0.5, borderLeftColor: "#cbd5e1", paddingLeft: 6 }}>
                          <Text style={{ fontFamily: "Times-Bold", color: "#334155" }}>Email</Text>
                        </View>
                        <Text style={{ width: 15, textAlign: "center", fontFamily: "Times-Bold", color: "#334155" }}>:</Text>
                        <Text style={{ flex: 1, color: "#2563eb", textDecoration: "underline" }}>{parseHighlightPDF(ref.email)}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Dynamic Custom Sections */}
        {renderCustomSectionsPDFWhite(customSections, primaryColor)}

        <View style={{ flex: 1 }} />

        {/* Footer */}
        <View style={{ borderTopWidth: 0.5, borderTopColor: "#94a3b8", paddingTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center", fontSize: 7.5, fontFamily: "Times-Bold", color: "#102a54" }}>
          <Text style={{ textTransform: "uppercase" }}>{personalInfo.fullName}</Text>
          <Text>{pageNumber} | PAGE</Text>
        </View>
      </View>
    );
  };

  const renderLayout = (layoutId: string = templateId, pageNumber: number = 1) => {
    switch (layoutId) {
      case "white":
        return renderWhitePage();
      case "kshrd":
        return renderKSHRD(pageNumber);
      case "minimalist":
        return renderMinimalist();
      case "creative":
        return renderCreative();
      case "professional":
        return renderProfessional();
      case "elegant":
        return renderElegant();
      case "executive":
        return renderExecutive();
      case "fancygrid":
        return renderFancyGrid();
      case "simpleleft":
        return renderSimpleLeft();
      case "timeline":
        return renderTimeline();
      case "portfolio":
        return renderPortfolio();
      case "canvacolumn":
        return renderCanvaColumn();
      case "modern":
      default:
        return renderModern();
    }
  };

  const pagesCount = data.theme?.pagesCount || 1;

  const renderPageLayout = (pageNumber: number) => {
    const pageData = getPageData(data, pageNumber);
    personalInfo = pageData.personalInfo;
    professionalSummary = pageData.professionalSummary;
    education = pageData.education;
    skills = pageData.skills;
    projects = pageData.projects;
    experience = pageData.experience;
    languages = pageData.languages;
    references = pageData.references;
    customSections = pageData.customSections;
    
    const pageLayout = data.theme?.pageLayouts?.[pageNumber - 1] || templateId;
    return renderLayout(pageLayout, pageNumber);
  };

  return (
    <Document title={`${(personalInfo.fullName || "CV").replace(/\s+/g, "_")}_CV`}>
      {Array.from({ length: pagesCount }).map((_, idx) => (
        <Page key={idx + 1} size="A4" style={[styles.page, { backgroundColor: data.theme?.backgroundColor || "#ffffff" }]}>
          {renderPageLayout(idx + 1)}
        </Page>
      ))}
    </Document>
  );
};
