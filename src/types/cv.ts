export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio: string;
  photo?: string;
  targetRole?: string;
  dob?: string;
  nationality?: string;
  gender?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  health?: string;
  logo?: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
  pageBreakBefore?: boolean;
  page?: number;
  highlight?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
  pageBreakBefore?: boolean;
  page?: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  pageBreakBefore?: boolean;
  page?: number;
  highlight?: boolean;
}

export interface Language {
  id: string;
  name: string;
  level: string;
  page?: number;
}

export interface Reference {
  id: string;
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
  pageBreakBefore?: boolean;
  page?: number;
}

export interface CVTheme {
  templateId: "modern" | "minimalist" | "creative" | "professional" | "elegant" | "executive" | "fancygrid" | "simpleleft" | "timeline" | "portfolio" | "canvacolumn" | "kshrd";
  primaryColor: string;
  photoAspectRatio?: "3:4" | "4:6";
  /** Portrait size percentage for templates that support a resizable photo. */
  photoScale?: number;
  /** Logo size percentage for templates that support a resizable header logo. */
  logoScale?: number;
  /** Any family name published by Google Fonts. */
  fontFamily?: string;
  /** Base document text size, expressed as a percentage. */
  fontSize?: number;
  fontColor?: string;
  language?: "en" | "km";
  pagesCount?: number;
  summaryPage?: number;
  skillsPage?: number;
  pageLayouts?: string[];
  experienceLevel?: "experienced" | "entry";
  showPitch?: boolean;
  professionalPitch?: string;
  backgroundColor?: string;
  sidebarBackgroundColor?: string;
  sectionNames?: Record<string, string>;
  sectionOrder?: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  pageBreakBefore?: boolean;
  page?: number;
}

export interface CustomSection {
  id: string;
  name: string;
  items: CustomSectionItem[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  education: Education[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  languages: Language[];
  references?: Reference[];
  customSections?: CustomSection[];
  theme?: CVTheme;
}
