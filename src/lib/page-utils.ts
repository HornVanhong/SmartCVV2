import { CVData } from "@/types/cv";

/**
 * Partition the CVData object to only return items assigned to a specific pageIndex.
 */
export const getPageData = (data: CVData, pageIndex: number): CVData => {
  return {
    ...data,
    personalInfo: data.personalInfo, // Personal info header panel details are kept on all pages
    professionalSummary: (data.theme?.summaryPage || 1) === pageIndex ? data.professionalSummary : "",
    education: data.education.filter((edu) => (edu.page || 1) === pageIndex),
    experience: data.experience.filter((exp) => (exp.page || 1) === pageIndex),
    projects: data.projects.filter((proj) => (proj.page || 1) === pageIndex),
    languages: data.languages.filter((lang) => (lang.page || 1) === pageIndex),
    references: (data.references || []).filter((ref) => (ref.page || 1) === pageIndex),
    skills: (data.theme?.skillsPage || 1) === pageIndex ? data.skills : [],
    customSections: (data.customSections || []).map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => (item.page || 1) === pageIndex)
    })).filter((sec) => sec.items.length > 0),
  };
};

/**
 * Clones all items on pageNumber to a new page, shifting subsequent content.
 */
export const duplicatePageContent = (data: CVData, pageNumber: number): CVData => {
  const currentCount = data.theme?.pagesCount || 1;
  const newCount = currentCount + 1;
  
  const targetPage = pageNumber;
  const newPage = pageNumber + 1;
  const templateId = data.theme?.templateId || "modern";

  const shiftItemPage = (page?: number) => {
    const p = page || 1;
    if (p > targetPage) return p + 1;
    return p;
  };

  const duplicatedEducation = [
    ...data.education.map(edu => ({ ...edu, page: shiftItemPage(edu.page) })),
    ...data.education
      .filter(edu => (edu.page || 1) === targetPage)
      .map(edu => ({ ...edu, id: `edu-${Date.now()}-${Math.random()}`, page: newPage }))
  ];

  const duplicatedExperience = [
    ...data.experience.map(exp => ({ ...exp, page: shiftItemPage(exp.page) })),
    ...data.experience
      .filter(exp => (exp.page || 1) === targetPage)
      .map(exp => ({ ...exp, id: `exp-${Date.now()}-${Math.random()}`, page: newPage }))
  ];

  const duplicatedProjects = [
    ...data.projects.map(proj => ({ ...proj, page: shiftItemPage(proj.page) })),
    ...data.projects
      .filter(proj => (proj.page || 1) === targetPage)
      .map(proj => ({ ...proj, id: `proj-${Date.now()}-${Math.random()}`, page: newPage }))
  ];

  const duplicatedLanguages = [
    ...data.languages.map(lang => ({ ...lang, page: shiftItemPage(lang.page) })),
    ...data.languages
      .filter(lang => (lang.page || 1) === targetPage)
      .map(lang => ({ ...lang, id: `lang-${Date.now()}-${Math.random()}`, page: newPage }))
  ];

  const duplicatedReferences = [
    ...(data.references || []).map(ref => ({ ...ref, page: shiftItemPage(ref.page) })),
    ...(data.references || [])
      .filter(ref => (ref.page || 1) === targetPage)
      .map(ref => ({ ...ref, id: `ref-${Date.now()}-${Math.random()}`, page: newPage }))
  ];

  const duplicatedCustomSections = (data.customSections || []).map((sec) => ({
    ...sec,
    items: [
      ...sec.items.map(item => ({ ...item, page: shiftItemPage(item.page) })),
      ...sec.items
        .filter(item => (item.page || 1) === targetPage)
        .map(item => ({ ...item, id: `citem-${Date.now()}-${Math.random()}`, page: newPage }))
    ]
  }));

  const oldLayouts = data.theme?.pageLayouts || Array.from({ length: currentCount }).map(() => templateId);
  const targetLayout = oldLayouts[targetPage - 1] || templateId;
  const newLayouts = [...oldLayouts];
  newLayouts.splice(targetPage, 0, targetLayout);

  return {
    ...data,
    education: duplicatedEducation,
    experience: duplicatedExperience,
    projects: duplicatedProjects,
    languages: duplicatedLanguages,
    references: duplicatedReferences,
    customSections: duplicatedCustomSections,
    theme: {
      ...data.theme,
      templateId,
      primaryColor: data.theme?.primaryColor || "#2563eb",
      pagesCount: newCount,
      summaryPage: (data.theme?.summaryPage || 1) > targetPage ? (data.theme?.summaryPage || 1) + 1 : data.theme?.summaryPage,
      skillsPage: (data.theme?.skillsPage || 1) > targetPage ? (data.theme?.skillsPage || 1) + 1 : data.theme?.skillsPage,
      pageLayouts: newLayouts,
    }
  };
};

/**
 * Removes pageNumber and shifts subsequent content down, reassigning orphans.
 */
export const deletePageContent = (data: CVData, pageNumber: number): CVData => {
  const currentCount = data.theme?.pagesCount || 1;
  if (currentCount <= 1) return data;
  const newCount = currentCount - 1;

  const fallbackPage = Math.max(1, pageNumber - 1);

  const cleanItemPage = (page?: number) => {
    const p = page || 1;
    if (p === pageNumber) return fallbackPage;
    if (p > pageNumber) return p - 1;
    return p;
  };

  const templateId = data.theme?.templateId || "modern";
  const oldLayouts = data.theme?.pageLayouts || Array.from({ length: currentCount }).map(() => templateId);
  const newLayouts = [...oldLayouts];
  newLayouts.splice(pageNumber - 1, 1);

  return {
    ...data,
    education: data.education.map(edu => ({ ...edu, page: cleanItemPage(edu.page) })),
    experience: data.experience.map(exp => ({ ...exp, page: cleanItemPage(exp.page) })),
    projects: data.projects.map(proj => ({ ...proj, page: cleanItemPage(proj.page) })),
    languages: data.languages.map(lang => ({ ...lang, page: cleanItemPage(lang.page) })),
    references: (data.references || []).map(ref => ({ ...ref, page: cleanItemPage(ref.page) })),
    customSections: (data.customSections || []).map((sec) => ({
      ...sec,
      items: sec.items.map(item => ({ ...item, page: cleanItemPage(item.page) }))
    })),
    theme: {
      ...data.theme,
      templateId,
      primaryColor: data.theme?.primaryColor || "#2563eb",
      pagesCount: newCount,
      summaryPage: (data.theme?.summaryPage || 1) === pageNumber ? fallbackPage : ((data.theme?.summaryPage || 1) > pageNumber ? (data.theme?.summaryPage || 1) - 1 : data.theme?.summaryPage),
      skillsPage: (data.theme?.skillsPage || 1) === pageNumber ? fallbackPage : ((data.theme?.skillsPage || 1) > pageNumber ? (data.theme?.skillsPage || 1) - 1 : data.theme?.skillsPage),
      pageLayouts: newLayouts,
    }
  };
};
