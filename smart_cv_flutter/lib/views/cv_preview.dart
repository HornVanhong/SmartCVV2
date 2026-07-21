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
    final cleanId = theme.templateId.toLowerCase().replaceAll('canva_', '');
    switch (cleanId) {
      case 'daniel_morton':
        return _buildDanielMortonTemplate(cvData, theme);
      case 'murad_naser':
      case 'matt_zhang':
        return _buildMuradNaserTemplate(cvData, theme);
      case 'francois_mercer':
        return _buildFrancoisMercerTemplate(cvData, theme);
      case 'benjamin_shah':
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
      case 'isabel':
        return _buildIsabelMercadoTemplate(cvData, theme);
      case 'julian':
        return _buildJulianRobertTemplate(cvData, theme);
      case 'donna':
        return _buildDonnaStroupeTemplate(cvData, theme);
      case 'sacha':
        return _buildSachaDuboisTemplate(cvData, theme);
      case 'juliana':
        return _buildJulianaSilvaTemplate(cvData, theme);
      case 'adeline':
        return _buildAdelinePalmerstonTemplate(cvData, theme);
      case 'oliva':
        return _buildOlivaSanchezTemplate(cvData, theme);
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

  // 2. MATT ZHANG / MURAD NASER (Pixel-Perfect Match to User Design Image)
  Widget _buildMuradNaserTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const bannerBlue = Color(0xFF466B95);
    const sidebarBg = Color(0xFFDCE4EC);
    const darkText = Color(0xFF1E293B);
    const bodyText = Color(0xFF334155);

    return Container(
      color: Colors.white,
      child: Column(
        children: [
          // Top Header Banner Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sidebar Top Extension (Light Grey-Blue)
              Container(
                width: 260,
                height: 90,
                color: sidebarBg,
              ),
              // Main Blue Header Banner
              Expanded(
                child: Container(
                  height: 90,
                  color: bannerBlue,
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        info.fullName.isNotEmpty ? info.fullName : 'Matt Zhang',
                        style: TextStyle(
                          fontSize: 28 * theme.fontSizeScale,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        (info.jobTitle.isNotEmpty ? info.jobTitle : 'MARKETING MANAGER').toUpperCase(),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.white70,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Main 2-Column Body Row
          Expanded(
            child: Stack(
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Left Sidebar Column
                    Container(
                      width: 260,
                      color: sidebarBg,
                      padding: const EdgeInsets.only(left: 20, right: 20, top: 100, bottom: 24),
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Contact Items
                            _mattContactRow(Icons.phone, info.phone.isNotEmpty ? info.phone : '+123-456-7890', bannerBlue),
                            const SizedBox(height: 10),
                            _mattContactRow(Icons.email, info.email.isNotEmpty ? info.email : 'hello@reallygreatsite.com', bannerBlue),
                            const SizedBox(height: 10),
                            _mattContactRow(Icons.location_on, info.location.isNotEmpty ? info.location : '123 Anywhere St., Any City', bannerBlue),
                            const SizedBox(height: 28),

                            // More information Section Header
                            _mattSidebarHeader('More information', bannerBlue),
                            const SizedBox(height: 10),
                            const Text('- Driver\'s license.', style: TextStyle(color: bodyText, fontSize: 11.5, height: 1.4)),
                            const Text('- Own vehicle.', style: TextStyle(color: bodyText, fontSize: 11.5, height: 1.4)),
                            const Text('- Full availability.', style: TextStyle(color: bodyText, fontSize: 11.5, height: 1.4)),
                            const SizedBox(height: 28),

                            // Languages Section Header
                            _mattSidebarHeader('Languages', bannerBlue),
                            const SizedBox(height: 10),
                            if (cvData.languages.isNotEmpty)
                              ...cvData.languages.map((l) => Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: RichText(
                                      text: TextSpan(
                                        style: const TextStyle(fontSize: 11.5, color: bodyText),
                                        children: [
                                          TextSpan(text: '${l.name}:\n', style: const TextStyle(fontWeight: FontWeight.bold, color: darkText)),
                                          TextSpan(text: l.level),
                                        ],
                                      ),
                                    ),
                                  ))
                            else ...[
                              const Text('Spanish:\nHigh level.', style: TextStyle(color: bodyText, fontSize: 11.5, height: 1.3)),
                              const SizedBox(height: 8),
                              const Text('English:\nNative.', style: TextStyle(color: bodyText, fontSize: 11.5, height: 1.3)),
                            ],
                            const SizedBox(height: 28),

                            // Skills Section Header
                            _mattSidebarHeader('Skills', bannerBlue),
                            const SizedBox(height: 10),
                            Text(
                              cvData.skills.isNotEmpty
                                  ? cvData.skills.join(', ')
                                  : 'Good communication skills, management of large teams, problem-solving skills, proficiency, commercial mindset, and agility in delivering results.',
                              style: const TextStyle(color: bodyText, fontSize: 11.5, height: 1.45),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Right Main Column
                    Expanded(
                      child: Container(
                        color: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // About me Section Header
                              _mattMainHeader('About me', bannerBlue),
                              const SizedBox(height: 10),
                              Text(
                                cvData.professionalSummary.isNotEmpty
                                    ? cvData.professionalSummary
                                    : 'Passionate about marketing, I define myself as a person eager to learn and a great leader of multidisciplinary teams. I have worked in several companies focused on advertising and marketing.',
                                style: const TextStyle(color: bodyText, fontSize: 11.5, height: 1.5),
                              ),
                              const SizedBox(height: 24),

                              // Work experience Section Header
                              _mattMainHeader('Work experience', bannerBlue),
                              const SizedBox(height: 12),
                              if (cvData.experience.isNotEmpty)
                                ...cvData.experience.map((exp) => Padding(
                                      padding: const EdgeInsets.only(bottom: 16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(exp.position, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: darkText)),
                                          Text('${exp.company} | ${exp.startDate} - ${exp.endDate}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5)),
                                          if (exp.description.isNotEmpty) ...[
                                            const SizedBox(height: 4),
                                            Text('- ${exp.description}', style: const TextStyle(color: bodyText, fontSize: 11, height: 1.4)),
                                          ],
                                        ],
                                      ),
                                    ))
                              else ...[
                                _mattExpBlock('Marketing Manager', 'Real Estate, S.L', 'January 2017 - April 2019', [
                                  'Creation of a marketing plan.',
                                  'Definition of strategies to follow.',
                                  'Monitoring the results of actions.',
                                  'Lead a team of professionals.',
                                ]),
                                const SizedBox(height: 14),
                                _mattExpBlock('Marketing Manager', 'Insurance Company, S.L', 'January 2017 - April 2019', [
                                  'Marketing strategy planning.',
                                  'Evaluation of the marketing plan.',
                                  'Preparation of commercial proposals.',
                                ]),
                                const SizedBox(height: 14),
                                _mattExpBlock('Marketing Junior', 'Insurance Company, S.L', 'January 2015 - April 2017', [
                                  'Marketing strategy planning.',
                                  'Evaluation of the marketing plan.',
                                  'Preparation of commercial proposals.',
                                ]),
                              ],
                              const SizedBox(height: 24),

                              // Academic data Section Header
                              _mattMainHeader('Academic data', bannerBlue),
                              const SizedBox(height: 12),
                              if (cvData.education.isNotEmpty)
                                ...cvData.education.map((edu) => Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: darkText)),
                                          Text('${edu.major} | ${edu.startDate} - ${edu.endDate}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5)),
                                        ],
                                      ),
                                    ))
                              else ...[
                                _mattEduBlock('University of the Sea', 'Marketing and Advertising Studies', 'Current'),
                                const SizedBox(height: 10),
                                _mattEduBlock('San Juan Study Center', 'Marketing Studies', 'September 2018 - July 2021'),
                                const SizedBox(height: 10),
                                _mattEduBlock('Higher business school', 'Advertising Studies', 'September 2015 - July 2017'),
                                const SizedBox(height: 10),
                                _mattEduBlock('Business school', 'Advertising Studies', 'September 2010 - July 2015'),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                // Overlapping Portrait Photo Frame
                Positioned(
                  left: 45,
                  top: -65,
                  child: Container(
                    width: 140,
                    height: 155,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: info.photoBytes != null
                        ? Image.memory(info.photoBytes!, fit: BoxFit.cover)
                        : Container(
                            color: const Color(0xFFCBD5E1),
                            child: const Icon(Icons.person, size: 70, color: Colors.white),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _mattSidebarHeader(String title, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      color: color,
      child: Text(
        title,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.5),
      ),
    );
  }

  Widget _mattMainHeader(String title, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      color: color,
      child: Text(
        title,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.5),
      ),
    );
  }

  Widget _mattContactRow(IconData icon, String text, Color color) {
    return Row(
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor: color,
          child: Icon(icon, color: Colors.white, size: 12),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: const TextStyle(color: Color(0xFF334155), fontSize: 11, fontWeight: FontWeight.w500)),
        ),
      ],
    );
  }

  Widget _mattExpBlock(String title, String company, String date, List<String> bullets) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
        Text('$company | $date', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5)),
        const SizedBox(height: 4),
        ...bullets.map((b) => Text('- $b', style: const TextStyle(color: Color(0xFF334155), fontSize: 11, height: 1.35))),
      ],
    );
  }

  Widget _mattEduBlock(String school, String major, String date) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Color(0xFF1E293B))),
        Text('$major | $date', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11.5)),
      ],
    );
  }

  // 3. FRANCOIS MERCER (Dark Slate Blue Sidebar, Skill Progress Bars & Outer Border Frame)
  Widget _buildFrancoisMercerTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const slateBlue = Color(0xFF284B70);
    const bodyText = Color(0xFF334155);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: slateBlue, width: 14),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Left Dark Slate Blue Sidebar
          Container(
            width: 250,
            color: slateBlue,
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: CircleAvatar(
                        radius: 56,
                        backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                        child: info.photoBytes == null ? const Icon(Icons.person, size: 56, color: Colors.white) : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  _mercerSidebarSection('Education'),
                  if (cvData.education.isNotEmpty)
                    ...cvData.education.map((edu) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(edu.school, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11.5)),
                              Text('${edu.startDate} - ${edu.endDate}', style: const TextStyle(color: Colors.white70, fontSize: 10)),
                              if (edu.description.isNotEmpty) Text(edu.description, style: const TextStyle(color: Colors.white60, fontSize: 9.5)),
                            ],
                          ),
                        ))
                  else ...[
                    _mercerEduBlock('San Dias School of Design', '2010 - 2013', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
                    _mercerEduBlock('Bachelor of Arts,', '2010 - 2013', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
                  ],
                  const SizedBox(height: 24),

                  _mercerSidebarSection('Skills'),
                  _mercerProgressBar('GRAPHIC DESIGN', 0.9),
                  _mercerProgressBar('ILLUSTRATION', 0.75),
                  _mercerProgressBar('PHOTOGRAPHY', 0.8),
                  _mercerProgressBar('MOTION GRAPHICS', 0.95),
                  _mercerProgressBar('VIDEOGRAPHY', 0.85),
                  _mercerProgressBar('TYPOGRAPHY', 0.7),
                  const SizedBox(height: 24),

                  _mercerSidebarSection('Contact'),
                  if (info.phone.isNotEmpty) _mercerContactRow(Icons.phone, info.phone),
                  if (info.email.isNotEmpty) _mercerContactRow(Icons.email, info.email),
                  if (info.portfolio.isNotEmpty) _mercerContactRow(Icons.language, info.portfolio),
                  if (info.location.isNotEmpty) _mercerContactRow(Icons.location_on, info.location),
                ],
              ),
            ),
          ),

          // Right Main Column
          Expanded(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      info.fullName.isNotEmpty ? info.fullName.toUpperCase() : 'FRANCOIS\nMERCER',
                      style: TextStyle(
                        fontSize: 32 * theme.fontSizeScale,
                        fontWeight: FontWeight.w900,
                        color: slateBlue,
                        height: 1.0,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      (info.jobTitle.isNotEmpty ? info.jobTitle : 'GRAPHIC DESIGNER').toUpperCase(),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 24),

                    _mercerMainPill('About Me', slateBlue),
                    const SizedBox(height: 8),
                    Text(
                      cvData.professionalSummary.isNotEmpty
                          ? cvData.professionalSummary
                          : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer purus arcu, finibus id mattis nec, fringilla ut lectus.',
                      style: const TextStyle(color: bodyText, fontSize: 11, height: 1.4),
                    ),
                    const SizedBox(height: 20),

                    _mercerMainPill('Experience Work', slateBlue),
                    const SizedBox(height: 10),
                    if (cvData.experience.isNotEmpty)
                      ...cvData.experience.map((exp) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.circle, size: 10, color: slateBlue),
                                    const SizedBox(width: 6),
                                    Text(exp.position.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5, color: Colors.black)),
                                  ],
                                ),
                                Text('${exp.startDate} / ${exp.endDate} – ${exp.company.toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10.5, color: slateBlue)),
                                if (exp.description.isNotEmpty) ...[
                                  const SizedBox(height: 2),
                                  Text(exp.description, style: const TextStyle(color: bodyText, fontSize: 10.5, height: 1.35)),
                                ],
                              ],
                            ),
                          ))
                    else ...[
                      _mercerExpBlock('GRAPHIC DESIGN', '2021 / 2022 – LICERIA STUDIO'),
                      _mercerExpBlock('GRAPHIC DESIGN', '2022 / 2023 – SALFORD & CO. STUDIO'),
                      _mercerExpBlock('GRAPHIC DESIGN', '2023 / 2025 – LICERIA STUDIO'),
                    ],
                    const SizedBox(height: 20),

                    _mercerMainPill('Reference', slateBlue),
                    const SizedBox(height: 10),
                    Row(
                      children: const [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Juliana Silva', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                              Text('Rimberio / CTO', style: TextStyle(color: bodyText, fontSize: 10)),
                              Text('+123-456-7890', style: TextStyle(color: bodyText, fontSize: 10)),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Donna Stroupe', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                              Text('Borcelle / CEO', style: TextStyle(color: bodyText, fontSize: 10)),
                              Text('+123-456-7890', style: TextStyle(color: bodyText, fontSize: 10)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _mercerSidebarSection(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 2),
        const Divider(color: Colors.white38, thickness: 1),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _mercerProgressBar(String skill, double progress) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(skill, style: const TextStyle(color: Colors.white70, fontSize: 8.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: const Color(0xFF64748B),
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
              minHeight: 5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _mercerMainPill(String title, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
    );
  }

  Widget _mercerEduBlock(String school, String date, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(school, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
          Text(date, style: const TextStyle(color: Colors.white70, fontSize: 10)),
          Text(desc, style: const TextStyle(color: Colors.white60, fontSize: 9.5, height: 1.3)),
        ],
      ),
    );
  }

  Widget _mercerExpBlock(String role, String sub) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.circle, size: 8, color: Color(0xFF284B70)),
              const SizedBox(width: 6),
              Text(role, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
            ],
          ),
          Text(sub, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF284B70))),
          const Text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer purus arcu.', style: TextStyle(color: Color(0xFF334155), fontSize: 10, height: 1.3)),
        ],
      ),
    );
  }

  Widget _mercerContactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          CircleAvatar(radius: 9, backgroundColor: Colors.white24, child: Icon(icon, color: Colors.white, size: 9)),
          const SizedBox(width: 6),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 9.5), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  // 4. BENJAMIN SHAH / RICHARD SANCHEZ (Dark Navy Top & Bottom Banner with Circular Avatar & Dual Column Pill Badges)
  Widget _buildRichardSanchezTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const darkNavy = Color(0xFF1C2541);
    const bodyText = Color(0xFF334155);

    return Container(
      color: Colors.white,
      child: Column(
        children: [
          // Top Header Banner with Overlapping Avatar
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                height: 120,
                width: double.infinity,
                color: darkNavy,
                padding: const EdgeInsets.only(left: 200, top: 28, right: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      info.fullName.isNotEmpty ? info.fullName.toUpperCase() : 'BENJAMIN SHAH',
                      style: TextStyle(
                        fontSize: (28 * theme.fontSizeScale).clamp(20.0, 32.0),
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      info.jobTitle.isNotEmpty ? info.jobTitle : 'Web Developer',
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              // Overlapping Circle Avatar
              Positioned(
                left: 36,
                top: 15,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: CircleAvatar(
                    radius: 65,
                    backgroundColor: const Color(0xFF64748B),
                    backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                    child: info.photoBytes == null
                        ? const Icon(Icons.person, size: 65, color: Colors.white)
                        : null,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 36),

          // Main 2-Column Content Body
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: ABOUT ME, CONTACT, LANGUAGES, EDUCATION
                  Expanded(
                    flex: 4,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _shahPillHeader('ABOUT ME', darkNavy),
                          const SizedBox(height: 10),
                          Text(
                            cvData.professionalSummary.isNotEmpty
                                ? cvData.professionalSummary
                                : 'Passionate and detail-oriented Web Developer with experience in designing, developing, and maintaining responsive websites and web applications.',
                            style: const TextStyle(color: bodyText, fontSize: 11, height: 1.45),
                          ),
                          const SizedBox(height: 24),

                          _shahPillHeader('CONTACT', darkNavy),
                          const SizedBox(height: 10),
                          if (info.phone.isNotEmpty) _shahContactItem(Icons.phone, info.phone, darkNavy),
                          if (info.portfolio.isNotEmpty) _shahContactItem(Icons.language, info.portfolio, darkNavy),
                          if (info.email.isNotEmpty) _shahContactItem(Icons.email, info.email, darkNavy),
                          if (info.location.isNotEmpty) _shahContactItem(Icons.location_on, info.location, darkNavy),
                          const SizedBox(height: 24),

                          _shahPillHeader('LANGUAGES', darkNavy),
                          const SizedBox(height: 10),
                          if (cvData.languages.isNotEmpty)
                            ...cvData.languages.map((l) => Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Text('• ${l.name}', style: const TextStyle(color: bodyText, fontSize: 11)),
                                ))
                          else ...[
                            const Text('• English', style: TextStyle(color: bodyText, fontSize: 11)),
                            const SizedBox(height: 3),
                            const Text('• Spanish', style: TextStyle(color: bodyText, fontSize: 11)),
                          ],
                          const SizedBox(height: 24),

                          _shahPillHeader('EDUCATION', darkNavy),
                          const SizedBox(height: 10),
                          if (cvData.education.isNotEmpty)
                            ...cvData.education.map((edu) => Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: darkNavy)),
                                      Text('${edu.major} ${edu.startDate}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                                    ],
                                  ),
                                ))
                          else ...[
                            const Text('Rimberio of Computer Science', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: darkNavy)),
                            const Text('Rimberio University      2021', style: TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                          ],
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(width: 28),

                  // Right Column: SKILLS, EXPERIENCE
                  Expanded(
                    flex: 5,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _shahPillHeader('SKILLS', darkNavy),
                          const SizedBox(height: 10),
                          if (cvData.skills.isNotEmpty)
                            ...cvData.skills.map((s) => Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Text('• $s', style: const TextStyle(color: bodyText, fontSize: 11)),
                                ))
                          else ...[
                            const Text('• Tailwind CSS', style: TextStyle(color: bodyText, fontSize: 11)),
                            const Text('• Bootstrap', style: TextStyle(color: bodyText, fontSize: 11)),
                            const Text('• WordPress', style: TextStyle(color: bodyText, fontSize: 11)),
                            const Text('• Figma', style: TextStyle(color: bodyText, fontSize: 11)),
                            const Text('• Docker', style: TextStyle(color: bodyText, fontSize: 11)),
                          ],
                          const SizedBox(height: 24),

                          _shahPillHeader('EXPERIENCE', darkNavy),
                          const SizedBox(height: 10),
                          if (cvData.experience.isNotEmpty)
                            ...cvData.experience.map((exp) => Padding(
                                  padding: const EdgeInsets.only(bottom: 14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(exp.position, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: darkNavy)),
                                          Text('${exp.startDate}-${exp.endDate}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                                        ],
                                      ),
                                      Text(exp.company, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                                      if (exp.description.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text('• ${exp.description}', style: const TextStyle(color: bodyText, fontSize: 10.5, height: 1.35)),
                                      ],
                                    ],
                                  ),
                                ))
                          else ...[
                            _shahSampleExp('Web Developer', 'Wardiere Inc.', '2021-2023', [
                              'Performed website testing, debugging, and maintenance.',
                              'Integrated APIs and third-party services.',
                            ]),
                            const SizedBox(height: 12),
                            _shahSampleExp('Junior Web Developer', 'Rimberio', '2021-2022', [
                              'Participated in code reviews and team development meetings.',
                              'Maintained databases and ensured data integrity.',
                            ]),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Footer Banner
          Container(
            height: 36,
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: darkNavy,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _shahPillHeader(String title, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        title,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.2),
      ),
    );
  }

  Widget _shahContactItem(IconData icon, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          CircleAvatar(radius: 11, backgroundColor: color, child: Icon(icon, color: Colors.white, size: 11)),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 10.5, color: Color(0xFF334155)))),
        ],
      ),
    );
  }

  Widget _shahSampleExp(String title, String company, String date, List<String> bullets) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: Color(0xFF1C2541))),
            Text(date, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
          ],
        ),
        Text(company, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
        const SizedBox(height: 4),
        ...bullets.map((b) => Text('• $b', style: const TextStyle(color: Color(0xFF334155), fontSize: 10.5, height: 1.35))),
      ],
    );
  }

  // 5. DANIEL GALLEGO (Ocean Teal with 3D Folded Ribbon Banners & Icons)
  Widget _buildDanielGallegoTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const oceanTeal = Color(0xFF063952);

    return Container(
      color: Colors.white,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Left Ocean Teal Sidebar
          Container(
            width: 260,
            color: oceanTeal,
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: CircleAvatar(
                        radius: 60,
                        backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                        child: info.photoBytes == null ? const Icon(Icons.person, size: 60, color: Colors.white) : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  _gallegoSidebarOutlinePill('Contact'),
                  const SizedBox(height: 10),
                  if (info.phone.isNotEmpty) _gallegoContactRow(Icons.phone, info.phone),
                  if (info.portfolio.isNotEmpty) _gallegoContactRow(Icons.language, info.portfolio),
                  if (info.email.isNotEmpty) _gallegoContactRow(Icons.email, info.email),
                  if (info.location.isNotEmpty) _gallegoContactRow(Icons.location_on, info.location),
                  const SizedBox(height: 24),

                  _gallegoSidebarOutlinePill('References'),
                  const SizedBox(height: 10),
                  const Text('Bachelor of Design', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                  const Text('Borcelle University', style: TextStyle(color: Colors.white70, fontSize: 10.5)),
                  const SizedBox(height: 6),
                  const Text('Bachelor of Design', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                  const Text('Borcelle University', style: TextStyle(color: Colors.white70, fontSize: 10.5)),
                  const SizedBox(height: 24),

                  _gallegoSidebarOutlinePill('Languages'),
                  const SizedBox(height: 10),
                  if (cvData.languages.isNotEmpty)
                    ...cvData.languages.map((l) => Text('• ${l.name}', style: const TextStyle(color: Colors.white, fontSize: 11)))
                  else ...[
                    const Text('• English', style: TextStyle(color: Colors.white, fontSize: 11)),
                    const Text('• French', style: TextStyle(color: Colors.white, fontSize: 11)),
                    const Text('• German', style: TextStyle(color: Colors.white, fontSize: 11)),
                    const Text('• Spanish', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ],
                ],
              ),
            ),
          ),

          // Right Column
          Expanded(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.only(top: 24, right: 24, left: 16),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Box
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      color: oceanTeal,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            info.fullName.isNotEmpty ? info.fullName : 'Daniel Gallego',
                            style: TextStyle(fontSize: 28 * theme.fontSizeScale, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            info.jobTitle.isNotEmpty ? info.jobTitle : 'Freelance Presentation Designer',
                            style: const TextStyle(fontSize: 14, color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    _gallegoRibbonHeader(Icons.person, 'Profile', oceanTeal),
                    const SizedBox(height: 10),
                    Text(
                      cvData.professionalSummary.isNotEmpty
                          ? cvData.professionalSummary
                          : 'Creative graphic designer passionate about visual storytelling, skilled in design tools, and dedicated to delivering modern and appealing results.',
                      style: const TextStyle(color: Color(0xFF334155), fontSize: 11, height: 1.4),
                    ),
                    const SizedBox(height: 20),

                    _gallegoRibbonHeader(Icons.school, 'Education', oceanTeal),
                    const SizedBox(height: 10),
                    if (cvData.education.isNotEmpty)
                      ...cvData.education.map((edu) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5)),
                                Text('${edu.major} • ${edu.startDate} - ${edu.endDate}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                              ],
                            ),
                          ))
                    else ...[
                      const Text('Bachelor of Design', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5)),
                      const Text('Borcelle University • 2006 - 2008', style: TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                    ],
                    const SizedBox(height: 20),

                    _gallegoRibbonHeader(Icons.work, 'Experience', oceanTeal),
                    const SizedBox(height: 10),
                    if (cvData.experience.isNotEmpty)
                      ...cvData.experience.map((exp) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(exp.company, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5)),
                                Text(exp.position, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                                if (exp.description.isNotEmpty) Text('• ${exp.description}', style: const TextStyle(color: Color(0xFF334155), fontSize: 10.5)),
                              ],
                            ),
                          ))
                    else ...[
                      const Text('Borcelle Studio', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5)),
                      const Text('Lead Presentation Designer', style: TextStyle(color: Color(0xFF64748B), fontSize: 10.5)),
                      const Text('• Created impactful pitch decks, sales presentations, and templates.', style: TextStyle(color: Color(0xFF334155), fontSize: 10.5)),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _gallegoSidebarOutlinePill(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white, width: 1.5),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Center(
        child: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
      ),
    );
  }

  Widget _gallegoContactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          CircleAvatar(radius: 10, backgroundColor: Colors.white, child: Icon(icon, color: const Color(0xFF063952), size: 10)),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 10), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  Widget _gallegoRibbonHeader(IconData icon, String title, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      color: color,
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  // 6. GEORGE WILKINS (Monochrome Pop Art Boxed Headers & Circular Skill Charts)
  Widget _buildGeorgeWilkinsTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const darkBox = Color(0xFF1F242A);
    const bodyText = Color(0xFF334155);

    return Container(
      color: const Color(0xFFF1F5F9),
      padding: const EdgeInsets.all(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.black, width: 2),
        ),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Top Header Row (Photo Box + Name Box)
              Row(
                children: [
                  Container(
                    width: 140,
                    height: 160,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.black, width: 2.5),
                    ),
                    child: info.photoBytes != null
                        ? Image.memory(info.photoBytes!, fit: BoxFit.cover)
                        : Container(color: const Color(0xFFCBD5E1), child: const Icon(Icons.person, size: 60, color: Colors.white)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          color: darkBox,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                info.fullName.isNotEmpty ? info.fullName.toUpperCase() : 'DANIEL GALLEGO',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                              ),
                              Text(
                                info.jobTitle.isNotEmpty ? info.jobTitle : 'Graphics Designer',
                                style: const TextStyle(fontSize: 12, color: Colors.white70),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                        _wilkinsBoxedHeader('ABOUT ME'),
                        const SizedBox(height: 6),
                        Text(
                          cvData.professionalSummary.isNotEmpty
                              ? cvData.professionalSummary
                              : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque non elit mauris. Cras euismod, metus ac finibus finibus.',
                          style: const TextStyle(color: bodyText, fontSize: 10.5, height: 1.35),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // 2 Column Content Body
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Column: CONTACT ME, EDUCATION, LANGUAGE
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          color: darkBox,
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _wilkinsWhiteHeader('CONTACT ME'),
                              const SizedBox(height: 8),
                              if (info.phone.isNotEmpty) Text('• ${info.phone}', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                              if (info.email.isNotEmpty) Text('• ${info.email}', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                              if (info.portfolio.isNotEmpty) Text('• ${info.portfolio}', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                              if (info.location.isNotEmpty) Text('• ${info.location}', style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),

                        _wilkinsBoxedHeader('EDUCATION'),
                        const SizedBox(height: 6),
                        if (cvData.education.isNotEmpty)
                          ...cvData.education.map((edu) => Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('• ${edu.school}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                                    Text('${edu.startDate}-${edu.endDate}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 9.5)),
                                  ],
                                ),
                              ))
                        else ...[
                          const Text('• Senior High School Borcelle', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          const Text('2014-2016', style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5)),
                          const SizedBox(height: 4),
                          const Text('• Bachelor of Design', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          const Text('Borcelle University 2016-2019', style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5)),
                        ],
                        const SizedBox(height: 14),

                        Container(
                          color: darkBox,
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              _wilkinsWhiteHeader('LANGUAGE'),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                children: [
                                  _wilkinsDonut('57%', 'Indonesia'),
                                  _wilkinsDonut('55%', 'Chinese'),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 14),

                  // Right Column: WORK EXPERIENCE, SKILL
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _wilkinsBoxedHeader('WORK EXPERIENCE'),
                        const SizedBox(height: 6),
                        if (cvData.experience.isNotEmpty)
                          ...cvData.experience.map((exp) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('• ${exp.company}, ${exp.startDate}-${exp.endDate}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                                    Text(exp.position, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                                    if (exp.description.isNotEmpty) Text('• ${exp.description}', style: const TextStyle(color: bodyText, fontSize: 9.5)),
                                  ],
                                ),
                              ))
                        else ...[
                          const Text('• Borcelle Industries, 2021-2023', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          const Text('Product Design Manager', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                          const Text('• Working with wider development team.', style: TextStyle(color: bodyText, fontSize: 9.5)),
                          const SizedBox(height: 6),
                          const Text('• Salford & Co., 2023-2025', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          const Text('Senior Designer', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                          const Text('• Made 1000+ logo designs.', style: TextStyle(color: bodyText, fontSize: 9.5)),
                        ],
                        const SizedBox(height: 14),

                        _wilkinsBoxedHeader('SKILL'),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _wilkinsDonut('56%', 'Typography'),
                            _wilkinsDonut('47%', 'Branding'),
                            _wilkinsDonut('65%', 'Software'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _wilkinsBoxedHeader(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.black, width: 2),
      ),
      child: Center(
        child: Text(
          title,
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 1.2),
        ),
      ),
    );
  }

  Widget _wilkinsWhiteHeader(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      color: Colors.white,
      child: Center(
        child: Text(
          title,
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 11.5, letterSpacing: 1.2),
        ),
      ),
    );
  }

  Widget _wilkinsDonut(String percent, String label) {
    return Column(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3.5),
          ),
          child: Center(
            child: Text(percent, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w500)),
      ],
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

  // 8. FRANCISCO ANDRADE (Pixel-Perfect Match to Canva Template)
  Widget _buildFranciscoAndradeTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const steelBlue = Color(0xFF4C6485);
    const darkBlueText = Color(0xFF1E3A8A);
    const cardBgColor = Color(0xFFF1F5F9);
    const bodyTextColor = Color(0xFF475569);

    final nameParts = info.fullName.trim().split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts.first.toUpperCase() : 'FRANCISCO';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ').toUpperCase() : 'ANDRADE';

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Left Sidebar (260px width)
          Container(
            width: 260,
            decoration: BoxDecoration(
              color: steelBlue,
              borderRadius: BorderRadius.circular(16),
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Photo
                  Center(
                    child: Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                      ),
                      padding: const EdgeInsets.all(4),
                      child: CircleAvatar(
                        radius: 56,
                        backgroundColor: const Color(0xFF64748B),
                        backgroundImage: info.photoBytes != null ? MemoryImage(info.photoBytes!) : null,
                        child: info.photoBytes == null
                            ? const Icon(Icons.person, size: 56, color: Colors.white)
                            : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // CONTACT ME Pill Badge
                  _franciscoSidebarPill('CONTACT ME'),
                  const SizedBox(height: 12),
                  if (info.phone.isNotEmpty) _franciscoContactRow(Icons.phone, info.phone),
                  if (info.email.isNotEmpty) _franciscoContactRow(Icons.email, info.email),
                  if (info.location.isNotEmpty) _franciscoContactRow(Icons.location_on, info.location),
                  if (info.portfolio.isNotEmpty) _franciscoContactRow(Icons.language, info.portfolio),
                  if (info.github.isNotEmpty) _franciscoContactRow(Icons.code, info.github),
                  const SizedBox(height: 28),

                  // SKILLS Pill Badge
                  _franciscoSidebarPill('SKILLS'),
                  const SizedBox(height: 12),
                  if (cvData.skills.isNotEmpty)
                    ...cvData.skills.map((skill) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('• ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                              Expanded(child: Text(skill, style: const TextStyle(color: Colors.white, fontSize: 11.5, height: 1.3))),
                            ],
                          ),
                        ))
                  else ...[
                    _franciscoBulletText('Project Management'),
                    _franciscoBulletText('Public Relations'),
                    _franciscoBulletText('Teamwork'),
                    _franciscoBulletText('Time Management'),
                    _franciscoBulletText('Leadership'),
                    _franciscoBulletText('Effective Communication'),
                    _franciscoBulletText('Critical Thinking'),
                  ],
                  const SizedBox(height: 28),

                  // REFERENCES Pill Badge
                  _franciscoSidebarPill('REFERENCES'),
                  const SizedBox(height: 12),
                  _franciscoSampleRef('Harumi Kobayashi', 'Wardiere Inc. / CEO', '123-456-7890', 'hello@reallygreatsite.com'),
                  const SizedBox(height: 10),
                  _franciscoSampleRef('Bailey Dupont', 'Wardiere Inc. / CEO', '123-456-7890', 'hello@reallygreatsite.com'),
                  const SizedBox(height: 28),

                  // LANGUAGE Pill Badge
                  _franciscoSidebarPill('LANGUAGE'),
                  const SizedBox(height: 12),
                  if (cvData.languages.isNotEmpty)
                    ...cvData.languages.map((l) => _franciscoBulletText(l.name))
                  else ...[
                    _franciscoBulletText('English'),
                    _franciscoBulletText('French'),
                    _franciscoBulletText('Spanish'),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(width: 28),

          // Right Main Area
          Expanded(
            child: Stack(
              children: [
                SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Name & Title
                      Text(
                        firstName,
                        style: TextStyle(
                          fontSize: 34 * theme.fontSizeScale,
                          fontWeight: FontWeight.w900,
                          color: darkBlueText,
                          height: 1.0,
                          letterSpacing: 2.0,
                        ),
                      ),
                      Text(
                        lastName,
                        style: TextStyle(
                          fontSize: 34 * theme.fontSizeScale,
                          fontWeight: FontWeight.w900,
                          color: darkBlueText,
                          height: 1.1,
                          letterSpacing: 2.0,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        info.jobTitle.isNotEmpty ? info.jobTitle : 'Marketing Manager',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // ABOUT ME Section
                      _franciscoMainPill('ABOUT ME'),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBgColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          cvData.professionalSummary.isNotEmpty
                              ? cvData.professionalSummary
                              : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce consequat orci a quam porta accumsan. Sed lobortis ut enim in fringilla.',
                          style: const TextStyle(color: bodyTextColor, fontSize: 11.5, height: 1.5),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // EXPERIENCE Section
                      _franciscoMainPill('EXPERIENCE'),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBgColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          children: cvData.experience.isNotEmpty
                              ? cvData.experience.asMap().entries.map((entry) {
                                  final idx = entry.key;
                                  final exp = entry.value;
                                  return Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (idx > 0) const Divider(height: 24, color: Color(0xFFCBD5E1)),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(exp.position, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: darkBlueText)),
                                          Text('${exp.startDate} - ${exp.endDate}', style: const TextStyle(color: bodyTextColor, fontSize: 11, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      Text(exp.company, style: const TextStyle(color: Color(0xFF1E293B), fontSize: 11.5, fontWeight: FontWeight.w600)),
                                      if (exp.description.isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(exp.description, style: const TextStyle(color: bodyTextColor, fontSize: 11, height: 1.4)),
                                      ],
                                    ],
                                  );
                                }).toList()
                              : [
                                  _franciscoSampleExp('Marketing Manager', 'Really Great Industries', '2020 – 2023'),
                                  const Divider(height: 20, color: Color(0xFFCBD5E1)),
                                  _franciscoSampleExp('Marketing Manager', 'Really Great Industries', '2019 – 2020'),
                                  const Divider(height: 20, color: Color(0xFFCBD5E1)),
                                  _franciscoSampleExp('Marketing Manager', 'Really Great Industries', '2017 – 2019'),
                                ],
                        ),
                      ),
                      const SizedBox(height: 28),

                      // EDUCATION Section
                      _franciscoMainPill('EDUCATION'),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: cardBgColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          children: cvData.education.isNotEmpty
                              ? cvData.education.asMap().entries.map((entry) {
                                  final idx = entry.key;
                                  final edu = entry.value;
                                  return Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (idx > 0) const Divider(height: 20, color: Color(0xFFCBD5E1)),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                                          Text('${edu.startDate} - ${edu.endDate}', style: const TextStyle(color: bodyTextColor, fontSize: 11, fontWeight: FontWeight.bold)),
                                        ],
                                      ),
                                      Text(edu.major, style: const TextStyle(color: bodyTextColor, fontSize: 11.5)),
                                    ],
                                  );
                                }).toList()
                              : [
                                  _franciscoSampleEdu('Borcelle Business School', 'Bachelor of Business Management', '2020 – 2023'),
                                  const Divider(height: 20, color: Color(0xFFCBD5E1)),
                                  _franciscoSampleEdu('Borcelle Business School', 'Bachelor of Business Management', '2016 – 2020'),
                                ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Top Right Decorative Curved Block
                Positioned(
                  top: 0,
                  right: 0,
                  child: Container(
                    width: 36,
                    height: 80,
                    decoration: const BoxDecoration(
                      color: steelBlue,
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(14),
                        bottomRight: Radius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _franciscoSidebarPill(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Center(
        child: Text(
          title,
          style: const TextStyle(
            color: Color(0xFF1E3A8A),
            fontWeight: FontWeight.w900,
            fontSize: 12,
            letterSpacing: 1.5,
          ),
        ),
      ),
    );
  }

  Widget _franciscoMainPill(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFF4C6485),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: 12.5,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _franciscoContactRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: Colors.white, fontSize: 10.5),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _franciscoBulletText(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 11))),
        ],
      ),
    );
  }

  Widget _franciscoSampleRef(String name, String title, String phone, String email) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
        Text(title, style: const TextStyle(color: Colors.white70, fontSize: 10.5)),
        Text('Phone: $phone', style: const TextStyle(color: Colors.white60, fontSize: 10)),
        Text('Email: $email', style: const TextStyle(color: Colors.white60, fontSize: 10)),
      ],
    );
  }

  Widget _franciscoSampleExp(String title, String company, String date) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E3A8A))),
            Text(date, style: const TextStyle(color: Color(0xFF475569), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        Text(company, style: const TextStyle(color: Color(0xFF1E293B), fontSize: 11.5, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        const Text(
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce consequat orci a quam porta accumsan.',
          style: TextStyle(color: Color(0xFF475569), fontSize: 11, height: 1.4),
        ),
      ],
    );
  }

  Widget _franciscoSampleEdu(String school, String degree, String date) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
            Text(date, style: const TextStyle(color: Color(0xFF475569), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
        Text(degree, style: const TextStyle(color: Color(0xFF475569), fontSize: 11.5)),
      ],
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

  // 9. ISABEL MERCADO (Dark Navy & Skill Bars)
  Widget _buildIsabelMercadoTemplate(CVData cvData, CVTheme theme) {
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: const Color(0xFF1E293B),
      bodyColor: const Color(0xFF0F172A),
      badgeColor: const Color(0xFF2563EB),
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 10. JULIAN ROBERT (Geometric Purple & Blue)
  Widget _buildJulianRobertTemplate(CVData cvData, CVTheme theme) {
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: const Color(0xFF4C1D95),
      bodyColor: const Color(0xFF5B21B6),
      badgeColor: const Color(0xFF7C3AED),
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 11. DONNA STROUPE (Soft Warm Taupe & Classic Paper)
  Widget _buildDonnaStroupeTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const warmBg = Color(0xFFFBF9F5);
    const taupeDark = Color(0xFF574C43);
    const taupeAccent = Color(0xFF8C7A6B);

    return Container(
      color: warmBg,
      padding: const EdgeInsets.all(40),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Center Header Block
            Center(
              child: Column(
                children: [
                  Text(
                    info.fullName.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: taupeDark,
                      letterSpacing: 3.0,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    info.jobTitle.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: taupeAccent,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (info.email.isNotEmpty) Text(info.email, style: const TextStyle(color: taupeDark, fontSize: 11)),
                      if (info.phone.isNotEmpty) Text('  •  ${info.phone}', style: const TextStyle(color: taupeDark, fontSize: 11)),
                      if (info.location.isNotEmpty) Text('  •  ${info.location}', style: const TextStyle(color: taupeDark, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(height: 1.5, width: 120, color: taupeAccent),
                ],
              ),
            ),
            const SizedBox(height: 32),
            if (cvData.professionalSummary.isNotEmpty) ...[
              _topHeaderSectionTitle('PROFESSIONAL PROFILE', taupeAccent),
              Text(cvData.professionalSummary, style: const TextStyle(color: taupeDark, fontSize: 12, height: 1.6)),
              const SizedBox(height: 24),
            ],
            if (cvData.experience.isNotEmpty) ...[
              _topHeaderSectionTitle('WORK EXPERIENCE', taupeAccent),
              ...cvData.experience.map((exp) => Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(exp.position, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: taupeDark)),
                            Text('${exp.startDate} – ${exp.endDate}', style: const TextStyle(color: taupeAccent, fontSize: 11.5, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text(exp.company, style: const TextStyle(color: taupeAccent, fontSize: 12, fontStyle: FontStyle.italic)),
                        if (exp.description.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(exp.description, style: const TextStyle(color: taupeDark, fontSize: 11.5, height: 1.45)),
                        ],
                      ],
                    ),
                  )),
              const SizedBox(height: 24),
            ],
            if (cvData.education.isNotEmpty) ...[
              _topHeaderSectionTitle('EDUCATION', taupeAccent),
              ...cvData.education.map((edu) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: taupeDark)),
                        Text(edu.major, style: const TextStyle(color: taupeAccent, fontSize: 11.5)),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }

  // 12. SACHA DUBOIS (Dark Executive Charcoal)
  Widget _buildSachaDuboisTemplate(CVData cvData, CVTheme theme) {
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: const Color(0xFF334155),
      bodyColor: const Color(0xFF1E293B),
      badgeColor: const Color(0xFF475569),
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 13. JULIANA SILVA (Slate & Rounded Section Cards)
  Widget _buildJulianaSilvaTemplate(CVData cvData, CVTheme theme) {
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: const Color(0xFF475569),
      bodyColor: const Color(0xFF334155),
      badgeColor: const Color(0xFF64748B),
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 14. ADELINE PALMERSTON (Dark Blue & Gold Bold Accents)
  Widget _buildAdelinePalmerstonTemplate(CVData cvData, CVTheme theme) {
    return _buildTwoColumnTemplate(
      cvData: cvData,
      theme: theme,
      sidebarColor: const Color(0xFF1E3A8A),
      bodyColor: const Color(0xFF172554),
      badgeColor: const Color(0xFFEAB308),
      badgeText: cvData.personalInfo.jobTitle.toUpperCase(),
    );
  }

  // 15. OLIVA SANCHEZ (Minimalist Clean Single Column)
  Widget _buildOlivaSanchezTemplate(CVData cvData, CVTheme theme) {
    final info = cvData.personalInfo;
    const darkText = Color(0xFF0F172A);
    const mutedText = Color(0xFF64748B);

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(40),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              info.fullName,
              style: const TextStyle(fontSize: 34, fontWeight: FontWeight.bold, color: darkText),
            ),
            const SizedBox(height: 4),
            Text(
              info.jobTitle,
              style: const TextStyle(fontSize: 16, color: Color(0xFF2563EB), fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 16,
              children: [
                if (info.email.isNotEmpty) Text(info.email, style: const TextStyle(color: mutedText, fontSize: 12)),
                if (info.phone.isNotEmpty) Text(info.phone, style: const TextStyle(color: mutedText, fontSize: 12)),
                if (info.location.isNotEmpty) Text(info.location, style: const TextStyle(color: mutedText, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(thickness: 1.5),
            const SizedBox(height: 20),
            if (cvData.professionalSummary.isNotEmpty) ...[
              _topHeaderSectionTitle('SUMMARY', const Color(0xFF2563EB)),
              Text(cvData.professionalSummary, style: const TextStyle(color: darkText, fontSize: 12, height: 1.5)),
              const SizedBox(height: 24),
            ],
            if (cvData.experience.isNotEmpty) ...[
              _topHeaderSectionTitle('EXPERIENCE', const Color(0xFF2563EB)),
              ...cvData.experience.map((exp) => Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(exp.position, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: darkText)),
                        Text('${exp.company} • ${exp.startDate} - ${exp.endDate}', style: const TextStyle(color: mutedText, fontSize: 12)),
                        if (exp.description.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(exp.description, style: const TextStyle(color: darkText, fontSize: 11.5, height: 1.4)),
                        ],
                      ],
                    ),
                  )),
              const SizedBox(height: 24),
            ],
            if (cvData.education.isNotEmpty) ...[
              _topHeaderSectionTitle('EDUCATION', const Color(0xFF2563EB)),
              ...cvData.education.map((edu) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(edu.school, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: darkText)),
                        Text(edu.major, style: const TextStyle(color: mutedText, fontSize: 11.5)),
                      ],
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }
}


