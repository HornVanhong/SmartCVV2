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
  // OTHER TEMPLATE FALLBACKS
  // =========================================================
  Widget _buildMuradNaserTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
  Widget _buildFrancoisMercerTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
  Widget _buildRichardSanchezTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
  Widget _buildDanielGallegoTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
  Widget _buildGeorgeWilkinsTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
  Widget _buildKyriePetrakisTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
  Widget _buildFranciscoAndradeTemplate(CVData cvData, CVTheme theme) => _buildDanielMortonTemplate(cvData, theme);
}
