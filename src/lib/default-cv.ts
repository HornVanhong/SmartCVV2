import { CVData } from "@/types/cv";

export const defaultCVData: CVData = {
  personalInfo: {
    fullName: "Alexander Wright",
    jobTitle: "Senior Frontend Engineer",
    email: "alexander.wright@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    github: "github.com/alexwright",
    linkedin: "linkedin.com/in/alexwright",
    portfolio: "alexwright.dev",
    targetRole: "Staff Frontend Architect",
    dob: "Feb 19th, 2002",
    nationality: "Cambodian"
  },
  professionalSummary: "Product-focused Senior Frontend Engineer with 6+ years of experience designing, building, and scaling high-performance web applications. Expert in React, Next.js, and TypeScript with a passion for web performance, clean architecture, and creating exceptional user experiences. Proven track record of leading development teams, optimizing rendering pipelines, and reducing bundle sizes by up to 40%.",
  education: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      major: "Bachelor of Science in Computer Science",
      startDate: "2016-09",
      endDate: "2020-05",
      description: "Graduated with Honors. Specialization in Software Engineering and Human-Computer Interaction."
    }
  ],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "GraphQL",
    "Webpack / Vite",
    "Jest / Playwright",
    "Git",
    "CI/CD",
    "Web Performance",
    "UI/UX Design"
  ],
  projects: [
    {
      id: "proj-1",
      name: "SaaS Analytics Dashboard",
      description: "Architected a real-time data visualization platform processing over 10M events daily. Implemented code splitting, dynamic imports, and canvas-based charts, resulting in a 35% improvement in time-to-interactive.",
      technologies: "React, Next.js, Tailwind CSS, Tremor, Chart.js",
      link: "github.com/alexwright/saas-analytics"
    },
    {
      id: "proj-2",
      name: "Smart CV Builder",
      description: "Designed and built an open-source, ATS-friendly resume builder featuring instantaneous preview updates, modular layout systems, and robust offline-first storage capabilities.",
      technologies: "Next.js, TypeScript, Tailwind CSS, react-to-print",
      link: "github.com/alexwright/smart-cv"
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Stripe",
      position: "Senior Frontend Engineer",
      startDate: "2022-06",
      endDate: "Present",
      description: "Led a team of 4 engineers to rebuild the merchant billing dashboard, improving page load speeds by 45%. Established engineering best practices, ESLint configurations, and design tokens used across multiple product teams. Collaborated closely with product designers to implement a modular design system."
    },
    {
      id: "exp-2",
      company: "Vercel",
      position: "Frontend Engineer",
      startDate: "2020-06",
      endDate: "2022-05",
      description: "Contributed to Next.js core optimizations, focusing on image optimization and route prefetching. Developed high-quality starter templates and examples for developer onboarding. Worked on reducing framework bundle sizes and optimizing server-side rendering performance."
    }
  ],
  languages: [
    {
      id: "lang-1",
      name: "English",
      level: "Native"
    },
    {
      id: "lang-2",
      name: "Spanish",
      level: "Conversational"
    }
  ],
  references: [
    {
      id: "ref-1",
      name: "Sarah Jenkins",
      relationship: "Engineering Manager",
      company: "Stripe",
      email: "sarah.jenkins@stripe.com",
      phone: "+1 (555) 012-3456"
    }
  ],
  customSections: [
    {
      id: "sec-cert",
      name: "Certifications",
      items: [
        {
          id: "cert-1",
          title: "AWS Certified Solutions Architect",
          subtitle: "Amazon Web Services (AWS)",
          startDate: "2023-08",
          endDate: "2026-08",
          description: "Validation of expertise in designing and deploying scalable, highly available, and fault-tolerant systems on AWS."
        }
      ]
    }
  ],
  theme: {
    templateId: "modern",
    primaryColor: "#2563eb",
    photoAspectRatio: "3:4",
    photoScale: 100,
    logoScale: 100,
    fontFamily: "Inter",
    fontSize: 100,
    fontColor: "#1e293b",
    language: "en",
    experienceLevel: "experienced",
    showPitch: false,
    professionalPitch: "",
    backgroundColor: "#ffffff",
    sidebarBackgroundColor: ""
  }
};
