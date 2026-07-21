import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../models/cv_model.dart';
import '../providers/cv_provider.dart';

class CVFormView extends StatefulWidget {
  const CVFormView({super.key});

  @override
  State<CVFormView> createState() => _CVFormViewState();
}

class _CVFormViewState extends State<CVFormView> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cvProvider = Provider.of<CVProvider>(context);
    final cvData = cvProvider.cvData;

    return Container(
      color: const Color(0xFFF8FAFC),
      child: Column(
        children: [
          // Preset Profile Switcher Bar (Easy 1-Click Samples)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF0F172A),
            child: Row(
              children: [
                const Icon(Icons.auto_awesome_rounded, color: Color(0xFFEAB308), size: 16),
                const SizedBox(width: 8),
                const Text('Quick Test Profile:', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(width: 12),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _sampleProfileBtn('Software Engineer', () => cvProvider.resetToSampleData()),
                        const SizedBox(width: 8),
                        _sampleProfileBtn('Marketing Manager', () => cvProvider.loadMarketingSample()),
                        const SizedBox(width: 8),
                        _sampleProfileBtn('Graphic Designer', () => cvProvider.loadGraphicDesignerSample()),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Editor Top Bar & Tabs
          Container(
            padding: const EdgeInsets.only(top: 14, left: 16, right: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.edit_document, color: Color(0xFF2563EB), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'CV Form Editor',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  labelColor: const Color(0xFF2563EB),
                  unselectedLabelColor: const Color(0xFF64748B),
                  indicatorColor: const Color(0xFF2563EB),
                  indicatorWeight: 3,
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                  tabs: const [
                    Tab(icon: Icon(Icons.palette_outlined, size: 18), text: 'Templates & Style'),
                    Tab(icon: Icon(Icons.person_outline, size: 18), text: 'Personal Info'),
                    Tab(icon: Icon(Icons.work_outline, size: 18), text: 'Experience'),
                    Tab(icon: Icon(Icons.school_outlined, size: 18), text: 'Education'),
                    Tab(icon: Icon(Icons.code_rounded, size: 18), text: 'Skills'),
                    Tab(icon: Icon(Icons.folder_open_rounded, size: 18), text: 'Projects'),
                  ],
                ),
              ],
            ),
          ),

          // Tab Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildThemeTab(context, cvProvider, cvData),
                _buildPersonalTab(context, cvProvider, cvData),
                _buildExperienceTab(context, cvProvider, cvData),
                _buildEducationTab(context, cvProvider, cvData),
                _buildSkillsTab(context, cvProvider, cvData),
                _buildProjectsTab(context, cvProvider, cvData),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sampleProfileBtn(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: Colors.white24),
        ),
        child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
      ),
    );
  }

  // --- 1. THEME & TEMPLATES TAB ---
  Widget _buildThemeTab(BuildContext context, CVProvider provider, CVData data) {
    final theme = data.theme;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionHeaderTitle('Select Template Style'),
          const SizedBox(height: 4),
          const Text('Choose from Canva & Professional CV design layouts:', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
          const SizedBox(height: 16),

          ListView(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _visualTemplateCard(
                title: 'Daniel Morton',
                subtitle: 'Rich Crimson Red Theme, Subtitle Pill Badge, Skill Specialization Categories',
                badgeText: 'CANVA CRIMSON',
                badgeColor: const Color(0xFF800A17),
                id: 'daniel_morton',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Murad Naser',
                subtitle: 'Deep Teal Sidebar, Connected Circular Avatar Ribbon, Italic Position Titles',
                badgeText: 'CANVA TEAL',
                badgeColor: const Color(0xFF0E5A60),
                id: 'murad_naser',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Francois Mercer',
                subtitle: 'Dark Slate Blue Sidebar, Skill Progress Bars, Stadium Section Banners, Circle Nodes',
                badgeText: 'CANVA GRAPHIC DESIGN',
                badgeColor: const Color(0xFF264C72),
                id: 'francois_mercer',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Richard Sanchez',
                subtitle: 'Dark Slate Navy Sidebar, Connected Timeline Nodes, Short Accent Bar, 2-Column References',
                badgeText: 'CANVA FEATURED',
                badgeColor: const Color(0xFF1E3A52),
                id: 'richard_sanchez',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Daniel Gallego',
                subtitle: 'Ocean Teal Sidebar, 3D Folded Ribbon Banners, Outline Stadium Pills, Circle Dots',
                badgeText: 'CANVA DESIGNER',
                badgeColor: const Color(0xFF063952),
                id: 'daniel_gallego',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'George Wilkins',
                subtitle: 'Dot Matrix Grids, Rectangular Portrait Frame, 2-Column References Grid',
                badgeText: 'CANVA POPULAR',
                badgeColor: const Color(0xFF0A192F),
                id: 'george_wilkins',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Kyrie Petrakis',
                subtitle: 'Midnight Black Sidebar, Pill Section Badges, Timeline Node Icons, Dotted Underlines',
                badgeText: 'CANVA ACCOUNTANT',
                badgeColor: const Color(0xFF131B2A),
                id: 'kyrie_petrakis',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Francisco Andrade',
                subtitle: 'Steel Blue Sidebar, Oval Pill Badges, Soft Content Cards, Circular Photo',
                badgeText: 'FEATURED CANVA',
                badgeColor: const Color(0xFF4C6485),
                id: 'francisco_andrade',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Isabel Mercado',
                subtitle: 'Dark Navy Left Sidebar, Skill Progress Bars, Circle Photo Frame',
                badgeText: 'CANVA POPULAR',
                badgeColor: const Color(0xFF2563EB),
                id: 'canva_isabel',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Julian Robert',
                subtitle: 'Geometric Blue Ribbon Banner, Diamond Avatar Badge, Dual Column',
                badgeText: 'MODERN GEOMETRIC',
                badgeColor: const Color(0xFF7C3AED),
                id: 'canva_julian',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Donna Stroupe',
                subtitle: 'Soft Beige Warm Paper, Classic Serif Typography, Gold Accent Dividers',
                badgeText: 'WARM ELEGANT',
                badgeColor: const Color(0xFF8C7A6B),
                id: 'canva_donna',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Sacha Dubois',
                subtitle: 'Charcoal Header Box, Oval Avatar Frame, Crisp Subheadings',
                badgeText: 'DARK EXECUTIVE',
                badgeColor: const Color(0xFF334155),
                id: 'canva_sacha',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Juliana Silva',
                subtitle: 'Slate Banner, Rounded Pill Cards for Experience & Skills',
                badgeText: 'ROUNDED CARDS',
                badgeColor: const Color(0xFF475569),
                id: 'canva_juliana',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Adeline Palmerston',
                subtitle: 'Dark Blue & Yellow/Gold Geometric Corner Accents',
                badgeText: 'BOLD ACCENTS',
                badgeColor: const Color(0xFFEAB308),
                id: 'canva_adeline',
                activeId: theme.templateId,
                provider: provider,
              ),
              _visualTemplateCard(
                title: 'Oliva Sanchez',
                subtitle: 'Minimalist Clean Off-White, Single Column High Contrast',
                badgeText: 'MINIMALIST',
                badgeColor: const Color(0xFF0F172A),
                id: 'canva_oliva',
                activeId: theme.templateId,
                provider: provider,
              ),
            ],
          ),

          const SizedBox(height: 28),
          _sectionHeaderTitle('Accent Primary Color'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 14,
            children: [
              '#2563eb', // Royal Blue
              '#059669', // Emerald Green
              '#7c3aed', // Deep Purple
              '#dc2626', // Red
              '#0f172a', // Midnight Slate
              '#8c7a6b', // Warm Taupe
            ].map((hex) {
              final color = Color(int.parse('FF${hex.replaceAll('#', '')}', radix: 16));
              final isSelected = theme.primaryColorHex == hex;
              return InkWell(
                onTap: () => provider.setPrimaryColor(hex),
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                    border: isSelected ? Border.all(color: Colors.black, width: 3.5) : null,
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 28),
          _sectionHeaderTitle('Font Scale Adjustment'),
          Slider(
            value: theme.fontSizeScale,
            min: 0.85,
            max: 1.25,
            divisions: 8,
            label: '${(theme.fontSizeScale * 100).toInt()}%',
            onChanged: (val) {
              theme.fontSizeScale = val;
              provider.updateTheme(theme);
            },
          ),
        ],
      ),
    );
  }

  Widget _visualTemplateCard({
    required String title,
    required String subtitle,
    required String badgeText,
    required Color badgeColor,
    required String id,
    required String activeId,
    required CVProvider provider,
  }) {
    final isSelected = id == activeId;
    return Card(
      elevation: isSelected ? 2 : 0,
      color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(
          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
          width: isSelected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: () => provider.setTemplate(id),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Radio<String>(
                value: id,
                groupValue: activeId,
                onChanged: (val) {
                  if (val != null) provider.setTemplate(val);
                },
                activeColor: const Color(0xFF2563EB),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14.5,
                            color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: badgeColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            badgeText,
                            style: TextStyle(color: badgeColor, fontSize: 9.5, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- 2. PERSONAL INFO ---
  Widget _buildPersonalTab(BuildContext context, CVProvider provider, CVData data) {
    final info = data.personalInfo;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile Photo Box
          Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: const Color(0xFFEFF6FF),
                    backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                    child: info.photoBytes == null
                        ? const Icon(Icons.person, size: 36, color: Color(0xFF2563EB))
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Profile Photo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 2),
                        Text('Upload PNG or JPG image for CV header', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                      ],
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final result = await FilePicker.platform.pickFiles(
                        type: FileType.image,
                        withData: true,
                      );
                      if (result != null && result.files.single.bytes != null) {
                        info.photoBytes = result.files.single.bytes;
                        provider.updatePersonalInfo(info);
                      }
                    },
                    icon: const Icon(Icons.upload_file_rounded, size: 16),
                    label: Text(info.photoBytes == null ? 'Upload' : 'Change'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          _formCard([
            _sectionHeaderTitle('Personal Details'),
            _inputField('Full Name', info.fullName, Icons.badge_outlined, (val) {
              info.fullName = val;
              provider.updatePersonalInfo(info);
            }),
            _inputField('Job Title', info.jobTitle, Icons.work_outline, (val) {
              info.jobTitle = val;
              provider.updatePersonalInfo(info);
            }),
            Row(
              children: [
                Expanded(
                  child: _inputField('Email', info.email, Icons.email_outlined, (val) {
                    info.email = val;
                    provider.updatePersonalInfo(info);
                  }),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _inputField('Phone', info.phone, Icons.phone_outlined, (val) {
                    info.phone = val;
                    provider.updatePersonalInfo(info);
                  }),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: _inputField('Location', info.location, Icons.location_on_outlined, (val) {
                    info.location = val;
                    provider.updatePersonalInfo(info);
                  }),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _inputField('GitHub', info.github, Icons.code_rounded, (val) {
                    info.github = val;
                    provider.updatePersonalInfo(info);
                  }),
                ),
              ],
            ),
          ]),
          const SizedBox(height: 16),

          _formCard([
            _sectionHeaderTitle('Professional Summary'),
            TextFormField(
              initialValue: data.professionalSummary,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Summarize your key achievements and skill highlights...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onChanged: (val) => provider.updateProfessionalSummary(val),
            ),
          ]),
        ],
      ),
    );
  }

  // --- 3. EXPERIENCE ---
  Widget _buildExperienceTab(BuildContext context, CVProvider provider, CVData data) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _sectionHeaderTitle('Work Experience'),
              ElevatedButton.icon(
                onPressed: () {
                  provider.addExperience(
                    Experience(
                      id: '',
                      company: 'Company Name',
                      position: 'Job Position',
                      startDate: '2022',
                      endDate: 'Present',
                      description: 'Accomplishments and role responsibilities.',
                    ),
                  );
                },
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add Position'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...data.experience.asMap().entries.map((entry) {
            final idx = entry.key;
            final exp = entry.value;
            return _formCard([
              Row(
                children: [
                  Expanded(
                    child: _inputField('Position / Role', exp.position, Icons.work, (val) {
                      exp.position = val;
                      provider.updateExperience(idx, exp);
                    }),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                    onPressed: () => provider.removeExperience(idx),
                  ),
                ],
              ),
              _inputField('Company', exp.company, Icons.business, (val) {
                exp.company = val;
                provider.updateExperience(idx, exp);
              }),
              Row(
                children: [
                  Expanded(
                    child: _inputField('Start Date', exp.startDate, Icons.calendar_today, (val) {
                      exp.startDate = val;
                      provider.updateExperience(idx, exp);
                    }),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _inputField('End Date', exp.endDate, Icons.calendar_today, (val) {
                      exp.endDate = val;
                      provider.updateExperience(idx, exp);
                    }),
                  ),
                ],
              ),
              _inputField('Description', exp.description, Icons.notes, (val) {
                exp.description = val;
                provider.updateExperience(idx, exp);
              }, maxLines: 3),
            ]);
          }),
        ],
      ),
    );
  }

  // --- 4. EDUCATION ---
  Widget _buildEducationTab(BuildContext context, CVProvider provider, CVData data) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _sectionHeaderTitle('Education & Degrees'),
              ElevatedButton.icon(
                onPressed: () {
                  provider.addEducation(
                    Education(
                      id: '',
                      school: 'University Name',
                      major: 'Degree / Specialization',
                      startDate: '2018',
                      endDate: '2022',
                      description: '',
                    ),
                  );
                },
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add Degree'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...data.education.asMap().entries.map((entry) {
            final idx = entry.key;
            final edu = entry.value;
            return _formCard([
              Row(
                children: [
                  Expanded(
                    child: _inputField('School / Institution', edu.school, Icons.school, (val) {
                      edu.school = val;
                      provider.updateEducation(idx, edu);
                    }),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: () => provider.removeEducation(idx),
                  ),
                ],
              ),
              _inputField('Major / Degree', edu.major, Icons.menu_book, (val) {
                edu.major = val;
                provider.updateEducation(idx, edu);
              }),
            ]);
          }),
        ],
      ),
    );
  }

  // --- 5. SKILLS ---
  Widget _buildSkillsTab(BuildContext context, CVProvider provider, CVData data) {
    final skillController = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionHeaderTitle('Skills & Technologies'),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: skillController,
                  decoration: const InputDecoration(
                    labelText: 'Add Skill (e.g., Flutter, SEO, Figma)',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.code),
                  ),
                  onSubmitted: (val) {
                    provider.addSkill(val);
                    skillController.clear();
                  },
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () {
                  provider.addSkill(skillController.text);
                  skillController.clear();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                ),
                child: const Text('Add'),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: data.skills.map((skill) {
              return Chip(
                label: Text(skill, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                deleteIcon: const Icon(Icons.close, size: 16),
                onDeleted: () => provider.removeSkill(skill),
                backgroundColor: const Color(0xFFEFF6FF),
                side: const BorderSide(color: Color(0xFFBFDBFE)),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // --- 6. PROJECTS ---
  Widget _buildProjectsTab(BuildContext context, CVProvider provider, CVData data) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _sectionHeaderTitle('Key Projects'),
              ElevatedButton.icon(
                onPressed: () {
                  provider.addProject(
                    Project(
                      id: '',
                      name: 'Project Title',
                      description: 'Details and achievements.',
                      technologies: 'Flutter, Firebase',
                      link: '',
                    ),
                  );
                },
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add Project'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...data.projects.asMap().entries.map((entry) {
            final idx = entry.key;
            final proj = entry.value;
            return _formCard([
              Row(
                children: [
                  Expanded(
                    child: _inputField('Project Name', proj.name, Icons.folder, (val) {
                      proj.name = val;
                      provider.updateProject(idx, proj);
                    }),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: () => provider.removeProject(idx),
                  ),
                ],
              ),
              _inputField('Technologies', proj.technologies, Icons.memory, (val) {
                proj.technologies = val;
                provider.updateProject(idx, proj);
              }),
            ]);
          }),
        ],
      ),
    );
  }

  Widget _formCard(List<Widget> children) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children,
        ),
      ),
    );
  }

  Widget _sectionHeaderTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Color(0xFF0F172A),
        ),
      ),
    );
  }

  Widget _inputField(
    String label,
    String value,
    IconData icon,
    Function(String) onChanged, {
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        initialValue: value,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, size: 18),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onChanged: onChanged,
      ),
    );
  }
}
