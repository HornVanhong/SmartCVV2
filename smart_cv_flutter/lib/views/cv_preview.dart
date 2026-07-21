import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/cv_model.dart';
import '../providers/cv_provider.dart';
import '../services/pdf_exporter.dart';

class CVPreviewView extends StatefulWidget {
  const CVPreviewView({super.key});

  @override
  State<CVPreviewView> createState() => _CVPreviewViewState();
}

class _CVPreviewViewState extends State<CVPreviewView> {
  double _zoomScale = 0.85;
  bool _isDownloading = false;
  bool _isPrinting = false;

  @override
  Widget build(BuildContext meContext) {
    final cvProvider = Provider.of<CVProvider>(meContext);
    final cvData = cvProvider.cvData;
    final theme = cvData.theme;
    final screenWidth = MediaQuery.of(meContext).size.width;

    // Intelligent responsive zoom for mobile screens
    final responsiveScale = screenWidth < 850
        ? (screenWidth / 850.0).clamp(0.38, 0.95)
        : _zoomScale;

    return Container(
      color: const Color(0xFFCBD5E1),
      child: Column(
        children: [
          // Top Control Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.palette_rounded, color: Color(0xFF2563EB), size: 20),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Live Canvas Preview',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Template: ${_formatTemplateName(theme.templateId)}',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const Spacer(),

                // Zoom controls
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.zoom_out_rounded, size: 18),
                        onPressed: () {
                          setState(() {
                            if (_zoomScale > 0.4) _zoomScale -= 0.1;
                          });
                        },
                        tooltip: 'Zoom Out',
                      ),
                      Text(
                        '${(_zoomScale * 100).toInt()}%',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.zoom_in_rounded, size: 18),
                        onPressed: () {
                          setState(() {
                            if (_zoomScale < 1.3) _zoomScale += 0.1;
                          });
                        },
                        tooltip: 'Zoom In',
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 16),

                // Download PDF Button
                ElevatedButton.icon(
                  onPressed: _isDownloading
                      ? null
                      : () async {
                          setState(() => _isDownloading = true);
                          try {
                            await PdfExporter.downloadPdf(cvData);
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Download failed: $e')),
                              );
                            }
                          } finally {
                            if (mounted) setState(() => _isDownloading = false);
                          }
                        },
                  icon: _isDownloading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.download_rounded, size: 18),
                  label: Text(_isDownloading ? 'Exporting...' : 'Download PDF'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    elevation: 2,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),

                const SizedBox(width: 10),

                // Print Button
                OutlinedButton.icon(
                  onPressed: _isPrinting
                      ? null
                      : () async {
                          setState(() => _isPrinting = true);
                          try {
                            await PdfExporter.printPdf(cvData);
                          } catch (e) {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Print failed: $e')),
                              );
                            }
                          } finally {
                            if (mounted) setState(() => _isPrinting = false);
                          }
                        },
                  icon: const Icon(Icons.print_rounded, size: 18),
                  label: const Text('Print'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ),

          // Scrollable A4 Document Paper Sheet
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
              child: Center(
                child: Transform.scale(
                  scale: responsiveScale,
                  child: Container(
                    width: 794,
                    height: 1123, // Standard A4 Aspect Ratio
                    decoration: BoxDecoration(
                      color: const Color(0xFF800A17), // Rich Crimson Theme Background
                      borderRadius: BorderRadius.circular(2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.28),
                          blurRadius: 30,
                          spreadRadius: 4,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: _buildSelectedTemplate(cvData, theme),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTemplateName(String id) {
    return id.replaceAll('canva_', '').replaceAll('_', ' ').toUpperCase();
  }

  Widget _buildSelectedTemplate(CVData cvData, CVTheme theme) {
    switch (theme.templateId) {
      case 'daniel_morton':
        return _buildDanielMortonTemplate(cvData, theme);
      case 'murad_naser':
        return _buildMuradNaserTemplate(cvData, theme);
      case 'francois_mercer':
        return _buildFrancoisMercerTemplate(cvData, theme);
      case 'richard_sanchez':
        return _buildRichardSanchezTemplate(cvData, theme);
      case 'daniel_gallego':
        return _buildDanielGallegoTemplate(cvData, theme);
      case 'george_wilkins':
        return _buildGeorgeWilkinsTemplate(cvData, theme);
      case 'kyrie_petrakis':
        return _buildKyriePetrakisTemplate(cvData, theme);
      case 'francisco_andrade':
        return _buildFranciscoAndradeTemplate(cvData, theme);
      default:
        return _buildDanielMortonTemplate(cvData, theme);
    }
  }

  // =========================================================
  // FEATURED: DANIEL MORTON (Rich Crimson Red & Subtitle Pill Badge)
  // =========================================================
  Widget _buildDanielMortonTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const darkCrimson = Color(0xFF6E0812);
    const bodyCrimson = Color(0xFF850B19);
    const pillCrimson = Color(0xFF4C050C);

    final nameParts = info.fullName.trim().split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts.first.toUpperCase() : 'DANIEL';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ').toUpperCase() : 'MORTON';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Left Dark Crimson Sidebar (300px width)
        Container(
          width: 300,
          color: darkCrimson,
          padding: const EdgeInsets.all(28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Avatar with thick white border
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: CircleAvatar(
                      radius: 64,
                      backgroundColor: const Color(0xFF8F1B27),
                      backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                      child: info.photoBytes == null
                          ? const Icon(Icons.person, size: 64, color: Colors.white)
                          : null,
                    ),
                  ),
                ),
                const SizedBox(height: 36),

                // About Me Section
                _mortonSidebarHeading('About Me'),
                Text(
                  cvData.professionalSummary,
                  style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.5),
                ),
                const SizedBox(height: 28),

                // Contact Me Section
                _mortonSidebarHeading('Contact Me'),
                _mortonContactBullet(info.github),
                _mortonContactBullet(info.phone),
                _mortonContactBullet(info.portfolio),
                _mortonContactBullet(info.location),
                _mortonContactBullet(info.email),
                const SizedBox(height: 28),

                // Skills Section
                _mortonSidebarHeading('Skills'),
                const Text('Design Specializations', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 3),
                Text(
                  cvData.skills.isNotEmpty ? cvData.skills.take(3).join(', ') : 'Brand Identity, Minimalist Layouts, Vector Illustration',
                  style: const TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.4),
                ),
                const SizedBox(height: 12),
                const Text('Technical Proficiency', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 3),
                Text(
                  cvData.skills.length > 3 ? cvData.skills.sublist(3).join(', ') : 'Vector Editing Software, Photo Manipulation, Layout Design',
                  style: const TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.4),
                ),
                const SizedBox(height: 28),

                // Language Section (2-Column Grid)
                if (cvData.languages.isNotEmpty) ...[
                  _mortonSidebarHeading('Language'),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: cvData.languages.take(2).map((l) => Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Text('• ${l.name}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                              )).toList(),
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: cvData.languages.length > 2
                              ? cvData.languages.sublist(2).map((l) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Text('• ${l.name}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                                  )).toList()
                              : [],
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),

        // Right Main Content Area
        Expanded(
          child: Container(
            color: bodyCrimson,
            padding: const EdgeInsets.all(32),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Candidate Name Header Block
                  Text(
                    firstName,
                    style: TextStyle(
                      fontSize: 38 * theme.fontSizeScale,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.0,
                      letterSpacing: 2.0,
                    ),
                  ),
                  Text(
                    lastName,
                    style: TextStyle(
                      fontSize: 38 * theme.fontSizeScale,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.1,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Subtitle Pill Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color: pillCrimson,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      info.jobTitle.toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13.5, letterSpacing: 1.8),
                    ),
                  ),
                  const SizedBox(height: 36),

                  // Education Section
                  if (cvData.education.isNotEmpty) ...[
                    const Text('Education', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                    const SizedBox(height: 14),
                    ...cvData.education.map((edu) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(edu.school, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                            Text(edu.major, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            if (edu.description.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(edu.description, style: const TextStyle(color: Colors.white60, fontSize: 11.5, height: 1.45)),
                            ],
                          ],
                        ),
                      );
                    }),
                    const SizedBox(height: 28),
                  ],

                  // Work Experience Section
                  if (cvData.experience.isNotEmpty) ...[
                    const Text('Work Experience', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                    const SizedBox(height: 14),
                    ...cvData.experience.map((exp) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(exp.company, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                            Text('${exp.position} | ${exp.startDate} – ${exp.endDate}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            if (exp.description.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(exp.description, style: const TextStyle(color: Colors.white60, fontSize: 11.5, height: 1.5)),
                            ],
                          ],
                        ),
                      );
                    }),
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _mortonSidebarHeading(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
      ),
    );
  }

  Widget _mortonContactBullet(String text) {
    if (text.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('•  ', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white70, fontSize: 11.5))),
        ],
      ),
    );
  }

  // =========================================================
  // DISTINCT TEMPLATE IMPLEMENTATIONS
  // =========================================================

  // 2. MURAD NASER (Deep Teal & Gold Accent)
  Widget _buildMuradNaserTemplate(CVData cvData, CVTheme theme) {
    const sidebarTeal = Color(0xFF0E5A60);
    const bodyTeal = Color(0xFF073B40);
    const goldPill = Color(0xFFD97706);
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: sidebarTeal,
      bodyColor: bodyTeal,
      badgeColor: goldPill,
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 3. FRANCOIS MERCER (Dark Slate Blue & Cyan)
  Widget _buildFrancoisMercerTemplate(CVData cvData, CVTheme theme) {
    const sidebarSlate = Color(0xFF1E293B);
    const bodySlate = Color(0xFF334155);
    const cyanPill = Color(0xFF0EA5E9);
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: sidebarSlate,
      bodyColor: bodySlate,
      badgeColor: cyanPill,
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 4. RICHARD SANCHEZ (Midnight Navy & Amber)
  Widget _buildRichardSanchezTemplate(CVData cvData, CVTheme theme) {
    const sidebarNavy = Color(0xFF0F172A);
    const bodyNavy = Color(0xFF1E3A8A);
    const amberPill = Color(0xFFB45309);
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: sidebarNavy,
      bodyColor: bodyNavy,
      badgeColor: amberPill,
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 5. DANIEL GALLEGO (Ocean Blue & Mint Accent)
  Widget _buildDanielGallegoTemplate(CVData cvData, CVTheme theme) {
    const sidebarOcean = Color(0xFF063952);
    const bodyOcean = Color(0xFF0A4F70);
    const mintPill = Color(0xFF0D9488);
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: sidebarOcean,
      bodyColor: bodyOcean,
      badgeColor: mintPill,
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 6. GEORGE WILKINS (Modern Top-Header Clean Layout)
  Widget _buildGeorgeWilkinsTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const headerColor = Color(0xFF0F172A);
    const bodyBg = Color(0xFFF8FAFC);
    const accentBlue = Color(0xFF2563EB);

    return Container(
      color: bodyBg,
      child: Column(
        children: [
          // Top Header Banner
          Container(
            color: headerColor,
            padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 28),
            child: Row(
              children: [
                if (info.photoBytes != null) ...[
                  CircleAvatar(
                    radius: 42,
                    backgroundImage: MemoryImage(info.photoBytes!),
                  ),
                  const SizedBox(width: 24),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        info.fullName.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        info.jobTitle,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFF94A3B8),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (info.email.isNotEmpty) Text(info.email, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                    if (info.phone.isNotEmpty) Text(info.phone, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                    if (info.location.isNotEmpty) Text(info.location, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          // Body Content (2 Columns)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: Summary, Experience
                  Expanded(
                    flex: 3,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (cvData.professionalSummary.isNotEmpty) ...[
                            _topHeaderSectionTitle('PROFESSIONAL SUMMARY', accentBlue),
                            Text(cvData.professionalSummary, style: const TextStyle(color: Color(0xFF334155), fontSize: 12, height: 1.5)),
                            const SizedBox(height: 24),
                          ],
                          if (cvData.experience.isNotEmpty) ...[
                            _topHeaderSectionTitle('WORK EXPERIENCE', accentBlue),
                            ...cvData.experience.map((exp) => Padding(
                                  padding: const EdgeInsets.only(bottom: 16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(exp.position, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                                      Text('${exp.company} | ${exp.startDate} - ${exp.endDate}', style: const TextStyle(color: accentBlue, fontSize: 12, fontWeight: FontWeight.w600)),
                                      if (exp.description.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(exp.description, style: const TextStyle(color: Color(0xFF475569), fontSize: 11.5, height: 1.4)),
                                      ],
                                    ],
                                  ),
                                )),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 32),
                  // Right Column: Education, Skills, Languages
                  Expanded(
                    flex: 2,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (cvData.skills.isNotEmpty) ...[
                            _topHeaderSectionTitle('SKILLS', accentBlue),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: cvData.skills.map((skill) => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEFF6FF),
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: const Color(0xFFBFDBFE)),
                                    ),
                                    child: Text(skill, style: const TextStyle(color: Color(0xFF1E40AF), fontSize: 11, fontWeight: FontWeight.bold)),
                                  )).toList(),
                            ),
                            const SizedBox(height: 24),
                          ],
                          if (cvData.education.isNotEmpty) ...[
                            _topHeaderSectionTitle('EDUCATION', accentBlue),
                            ...cvData.education.map((edu) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                                      Text(edu.major, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5)),
                                    ],
                                  ),
                                )),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 7. KYRIE PETRAKIS (Minimalist Black & Elegant Layout)
  Widget _buildKyriePetrakisTemplate(CVData cvData, CVTheme theme) {
    const sidebarBlack = Color(0xFF000000);
    const bodyCharcoal = Color(0xFF18181B);
    const emeraldPill = Color(0xFF059669);
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: sidebarBlack,
      bodyColor: bodyCharcoal,
      badgeColor: emeraldPill,
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 8. FRANCISCO ANDRADE (Steel Blue & Modern Card Style)
  Widget _buildFranciscoAndradeTemplate(CVData cvData, CVTheme theme) {
    const sidebarSteel = Color(0xFF3B82F6);
    const bodySteel = Color(0xFF1E40AF);
    const purplePill = Color(0xFF7C3AED);
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: sidebarSteel,
      bodyColor: bodySteel,
      badgeColor: purplePill,
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  Widget _topHeaderSectionTitle(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1.2)),
          const SizedBox(height: 3),
          Container(height: 2, color: color.withValues(alpha: 0.3)),
        ],
      ),
    );
  }

  // Reusable Two-Column Layout builder supporting customized colors
  Widget _buildTwoColumnTemplate({
    required CVData cvData,
    required CVTheme theme,
    required Color sidebarColor,
    required Color bodyColor,
    required Color badgeColor,
    required String badgeText,
  }) {
    final info = cvData.personalInfo;
    final nameParts = info.fullName.trim().split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts.first.toUpperCase() : '';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ').toUpperCase() : '';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Left Sidebar (300px width)
        Container(
          width: 300,
          color: sidebarColor,
          padding: const EdgeInsets.all(28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: CircleAvatar(
                      radius: 64,
                      backgroundColor: Colors.white24,
                      backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                      child: info.photoBytes == null ? const Icon(Icons.person, size: 64, color: Colors.white) : null,
                    ),
                  ),
                ),
                const SizedBox(height: 36),
                _mortonSidebarHeading('About Me'),
                Text(cvData.professionalSummary, style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.5)),
                const SizedBox(height: 28),
                _mortonSidebarHeading('Contact Me'),
                _mortonContactBullet(info.github),
                _mortonContactBullet(info.phone),
                _mortonContactBullet(info.portfolio),
                _mortonContactBullet(info.location),
                _mortonContactBullet(info.email),
                const SizedBox(height: 28),
                _mortonSidebarHeading('Skills'),
                Text(
                  cvData.skills.isNotEmpty ? cvData.skills.join(', ') : 'Layout Design, Strategy, Communication',
                  style: const TextStyle(color: Colors.white70, fontSize: 11.5, height: 1.4),
                ),
                if (cvData.languages.isNotEmpty) ...[
                  const SizedBox(height: 28),
                  _mortonSidebarHeading('Languages'),
                  ...cvData.languages.map((l) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text('• ${l.name}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                      )),
                ],
              ],
            ),
          ),
        ),

        // Right Main Content Area
        Expanded(
          child: Container(
            color: bodyColor,
            padding: const EdgeInsets.all(32),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    firstName,
                    style: TextStyle(
                      fontSize: 38 * theme.fontSizeScale,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.0,
                      letterSpacing: 2.0,
                    ),
                  ),
                  Text(
                    lastName,
                    style: TextStyle(
                      fontSize: 38 * theme.fontSizeScale,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.1,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color: badgeColor,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      badgeText,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13.5, letterSpacing: 1.8),
                    ),
                  ),
                  const SizedBox(height: 36),
                  if (cvData.education.isNotEmpty) ...[
                    const Text('Education', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                    const SizedBox(height: 14),
                    ...cvData.education.map((edu) => Padding(
                          padding: const EdgeInsets.only(bottom: 18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(edu.school, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              Text(edu.major, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              if (edu.description.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(edu.description, style: const TextStyle(color: Colors.white60, fontSize: 11.5, height: 1.45)),
                              ],
                            ],
                          ),
                        )),
                    const SizedBox(height: 28),
                  ],
                  if (cvData.experience.isNotEmpty) ...[
                    const Text('Work Experience', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                    const SizedBox(height: 14),
                    ...cvData.experience.map((exp) => Padding(
                          padding: const EdgeInsets.only(bottom: 18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(exp.company, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              Text('${exp.position} | ${exp.startDate} - ${exp.endDate}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              if (exp.description.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Text(exp.description, style: const TextStyle(color: Colors.white60, fontSize: 11.5, height: 1.5)),
                              ],
                            ],
                          ),
                        )),
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

