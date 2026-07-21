import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/cv_model.dart';

class PdfExporter {
  static Future<Uint8List> generatePdf(CVData cvData) async {
    final pdf = pw.Document();

    final fontRegular = await PdfGoogleFonts.interRegular();
    final fontBold = await PdfGoogleFonts.interBold();

    pw.MemoryImage? profileImage;
    if (cvData.personalInfo.photoBytes != null && cvData.personalInfo.photoBytes!.isNotEmpty) {
      try {
        profileImage = pw.MemoryImage(cvData.personalInfo.photoBytes!);
      } catch (_) {}
    }

    final hexClean = cvData.theme.primaryColorHex.replaceAll('#', '');
    final colorInt = int.tryParse(hexClean.length == 6 ? 'FF$hexClean' : hexClean, radix: 16) ?? 0xFF800A17;
    final primaryPdfColor = PdfColor.fromInt(colorInt);
    final cleanId = cvData.theme.templateId.toLowerCase().replaceAll('canva_', '');

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: pw.EdgeInsets.zero,
        build: (pw.Context context) {
          switch (cleanId) {
            case 'murad_naser':
            case 'matt_zhang':
              return _buildMuradNaserPdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
            case 'francois_mercer':
              return _buildFrancoisMercerPdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
            case 'benjamin_shah':
            case 'richard_sanchez':
              return _buildRichardSanchezPdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
            case 'daniel_gallego':
              return _buildDanielGallegoPdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
            case 'george_wilkins':
              return _buildGeorgeWilkinsPdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
            case 'francisco_andrade':
              return _buildFranciscoAndradePdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
            case 'daniel_morton':
            default:
              return _buildDanielMortonPdf(cvData, primaryPdfColor, profileImage, fontRegular, fontBold);
          }
        },
      ),
    );

    return pdf.save();
  }

  // 1. DANIEL MORTON
  static pw.Widget _buildDanielMortonPdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;
    final nameParts = info.fullName.trim().split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts.first.toUpperCase() : 'DANIEL';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ').toUpperCase() : 'MORTON';

    return pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.stretch,
      children: [
        // Left Sidebar (240 width)
        pw.Container(
          width: 240,
          color: primaryColor,
          padding: const pw.EdgeInsets.all(20),
          child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              if (profileImage != null)
                pw.Center(
                  child: pw.Container(
                    width: 90,
                    height: 90,
                    decoration: pw.BoxDecoration(
                      shape: pw.BoxShape.circle,
                      border: pw.Border.all(color: PdfColors.white, width: 3),
                      image: pw.DecorationImage(image: profileImage, fit: pw.BoxFit.cover),
                    ),
                  ),
                ),
              pw.SizedBox(height: 24),

              _pdfSidebarHeader('About Me', primaryColor, fontBold),
              pw.Text(cvData.professionalSummary, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              pw.SizedBox(height: 18),

              _pdfSidebarHeader('Contact Me', primaryColor, fontBold),
              if (info.phone.isNotEmpty) pw.Text('Phone: ${info.phone}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              if (info.email.isNotEmpty) pw.Text('Email: ${info.email}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              if (info.portfolio.isNotEmpty) pw.Text('Web: ${info.portfolio}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              if (info.location.isNotEmpty) pw.Text('Loc: ${info.location}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              pw.SizedBox(height: 18),

              _pdfSidebarHeader('Skills', primaryColor, fontBold),
              ...cvData.skills.map((skill) => pw.Padding(
                    padding: const pw.EdgeInsets.only(bottom: 3),
                    child: pw.Text('• $skill', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                  )),
              pw.SizedBox(height: 18),

              if (cvData.languages.isNotEmpty) ...[
                _pdfSidebarHeader('Language', primaryColor, fontBold),
                ...cvData.languages.map((l) => pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 3),
                      child: pw.Text('• ${l.name}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                    )),
              ],
            ],
          ),
        ),

        // Right Main Area
        pw.Expanded(
          child: pw.Container(
            color: primaryColor,
            padding: const pw.EdgeInsets.all(24),
            child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(firstName, style: pw.TextStyle(font: fontBold, fontSize: 24, color: PdfColors.white)),
                pw.Text(lastName, style: pw.TextStyle(font: fontBold, fontSize: 24, color: PdfColors.white)),
                pw.SizedBox(height: 10),

                pw.Container(
                  padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.black,
                    borderRadius: pw.BorderRadius.circular(12),
                  ),
                  child: pw.Text(info.jobTitle.toUpperCase(), style: pw.TextStyle(font: fontBold, fontSize: 9, color: PdfColors.white)),
                ),
                pw.SizedBox(height: 24),

                if (cvData.education.isNotEmpty) ...[
                  pw.Text('Education', style: pw.TextStyle(font: fontBold, fontSize: 14, color: PdfColors.white)),
                  pw.SizedBox(height: 8),
                  ...cvData.education.map((edu) {
                    return pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 10),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(edu.school, style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: PdfColors.white)),
                          pw.Text(edu.major, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                        ],
                      ),
                    );
                  }),
                  pw.SizedBox(height: 18),
                ],

                if (cvData.experience.isNotEmpty) ...[
                  pw.Text('Work Experience', style: pw.TextStyle(font: fontBold, fontSize: 14, color: PdfColors.white)),
                  pw.SizedBox(height: 8),
                  ...cvData.experience.map((exp) {
                    return pw.Padding(
                      padding: const pw.EdgeInsets.only(bottom: 10),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(exp.company, style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: PdfColors.white)),
                          pw.Text('${exp.position} | ${exp.startDate} – ${exp.endDate}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                          if (exp.description.isNotEmpty)
                            pw.Text(exp.description, style: pw.TextStyle(font: fontRegular, fontSize: 7.5, color: PdfColors.white)),
                        ],
                      ),
                    );
                  }),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 2. MATT ZHANG / MURAD NASER
  static pw.Widget _buildMuradNaserPdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;
    final sidebarBg = PdfColor.fromInt(0xFFDCE4EC);

    return pw.Column(
      children: [
        // Top Header Banner Row
        pw.Row(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Container(width: 200, height: 85, color: sidebarBg),
            pw.Expanded(
              child: pw.Container(
                height: 85,
                color: primaryColor,
                padding: const pw.EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  mainAxisAlignment: pw.MainAxisAlignment.center,
                  children: [
                    pw.Text(
                      info.fullName.isNotEmpty ? info.fullName : 'Matt Zhang',
                      style: pw.TextStyle(font: fontBold, fontSize: 22, color: PdfColors.white),
                    ),
                    pw.SizedBox(height: 2),
                    pw.Text(
                      (info.jobTitle.isNotEmpty ? info.jobTitle : 'MARKETING MANAGER').toUpperCase(),
                      style: pw.TextStyle(font: fontBold, fontSize: 10, color: PdfColors.white),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        // Main 2-Column Row
        pw.Expanded(
          child: pw.Stack(
            children: [
              pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                children: [
                  // Left Sidebar
                  pw.Container(
                    width: 200,
                    color: sidebarBg,
                    padding: const pw.EdgeInsets.only(left: 16, right: 16, top: 75, bottom: 20),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        if (info.phone.isNotEmpty) _pdfContactItem(info.phone, primaryColor, fontRegular),
                        if (info.email.isNotEmpty) _pdfContactItem(info.email, primaryColor, fontRegular),
                        if (info.location.isNotEmpty) _pdfContactItem(info.location, primaryColor, fontRegular),
                        pw.SizedBox(height: 18),

                        _pdfSidebarHeader('More information', primaryColor, fontBold),
                        pw.SizedBox(height: 6),
                        pw.Text('- Driver\'s license.', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                        pw.Text('- Own vehicle.', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                        pw.Text('- Full availability.', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                        pw.SizedBox(height: 18),

                        _pdfSidebarHeader('Languages', primaryColor, fontBold),
                        pw.SizedBox(height: 6),
                        if (cvData.languages.isNotEmpty)
                          ...cvData.languages.map((l) => pw.Text('${l.name}: ${l.level}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)))
                        else ...[
                          pw.Text('Spanish: High level.', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                          pw.Text('English: Native.', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                        ],
                        pw.SizedBox(height: 18),

                        _pdfSidebarHeader('Skills', primaryColor, fontBold),
                        pw.SizedBox(height: 6),
                        pw.Text(
                          cvData.skills.isNotEmpty ? cvData.skills.join(', ') : 'Good communication skills, management of large teams, problem-solving.',
                          style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800),
                        ),
                      ],
                    ),
                  ),

                  // Right Column
                  pw.Expanded(
                    child: pw.Container(
                      color: PdfColors.white,
                      padding: const pw.EdgeInsets.all(20),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          _pdfMainHeader('About me', primaryColor, fontBold),
                          pw.SizedBox(height: 6),
                          pw.Text(
                            cvData.professionalSummary.isNotEmpty ? cvData.professionalSummary : 'Passionate marketing manager with proven record.',
                            style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey800),
                          ),
                          pw.SizedBox(height: 18),

                          _pdfMainHeader('Work experience', primaryColor, fontBold),
                          pw.SizedBox(height: 8),
                          if (cvData.experience.isNotEmpty)
                            ...cvData.experience.map((exp) => pw.Padding(
                                  padding: const pw.EdgeInsets.only(bottom: 10),
                                  child: pw.Column(
                                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                                    children: [
                                      pw.Text(exp.position, style: pw.TextStyle(font: fontBold, fontSize: 10, color: PdfColors.black)),
                                      pw.Text('${exp.company} | ${exp.startDate} - ${exp.endDate}', style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey700)),
                                      if (exp.description.isNotEmpty)
                                        pw.Text('- ${exp.description}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                                    ],
                                  ),
                                ))
                          else ...[
                            _pdfExpBlock('Marketing Manager', 'Real Estate, S.L', '2017 - 2019', fontBold, fontRegular),
                            _pdfExpBlock('Marketing Junior', 'Insurance Company, S.L', '2015 - 2017', fontBold, fontRegular),
                          ],
                          pw.SizedBox(height: 18),

                          _pdfMainHeader('Academic data', primaryColor, fontBold),
                          pw.SizedBox(height: 8),
                          if (cvData.education.isNotEmpty)
                            ...cvData.education.map((edu) => pw.Padding(
                                  padding: const pw.EdgeInsets.only(bottom: 8),
                                  child: pw.Column(
                                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                                    children: [
                                      pw.Text(edu.school, style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: PdfColors.black)),
                                      pw.Text('${edu.major} | ${edu.startDate} - ${edu.endDate}', style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey700)),
                                    ],
                                  ),
                                ))
                          else ...[
                            _pdfEduBlock('University of the Sea', 'Marketing and Advertising Studies', '2018 - 2021', fontBold, fontRegular),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // Overlapping Profile Frame
              pw.Positioned(
                left: 35,
                top: -45,
                child: pw.Container(
                  width: 110,
                  height: 120,
                  padding: const pw.EdgeInsets.all(3),
                  decoration: pw.BoxDecoration(
                    color: PdfColors.white,
                    borderRadius: pw.BorderRadius.circular(8),
                  ),
                  child: profileImage != null
                      ? pw.Image(profileImage, fit: pw.BoxFit.cover)
                      : pw.Container(color: PdfColors.grey300),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 3. FRANCOIS MERCER
  static pw.Widget _buildFrancoisMercerPdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;

    return pw.Container(
      decoration: pw.BoxDecoration(
        color: PdfColors.white,
        border: pw.Border.all(color: primaryColor, width: 10),
      ),
      child: pw.Row(
          crossAxisAlignment: pw.CrossAxisAlignment.stretch,
        children: [
          // Left Sidebar
          pw.Container(
            width: 190,
            color: primaryColor,
            padding: const pw.EdgeInsets.all(16),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                if (profileImage != null)
                  pw.Center(
                    child: pw.Container(
                      width: 80,
                      height: 80,
                      decoration: pw.BoxDecoration(
                        shape: pw.BoxShape.circle,
                        border: pw.Border.all(color: PdfColors.white, width: 2.5),
                        image: pw.DecorationImage(image: profileImage, fit: pw.BoxFit.cover),
                      ),
                    ),
                  ),
                pw.SizedBox(height: 16),

                pw.Text('Education', style: pw.TextStyle(font: fontBold, fontSize: 11, color: PdfColors.white)),
                pw.Divider(color: PdfColors.white, thickness: 0.8),
                if (cvData.education.isNotEmpty)
                  ...cvData.education.map((edu) => pw.Padding(
                        padding: const pw.EdgeInsets.only(bottom: 6),
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(edu.school, style: pw.TextStyle(font: fontBold, fontSize: 8.5, color: PdfColors.white)),
                            pw.Text('${edu.startDate} - ${edu.endDate}', style: pw.TextStyle(font: fontRegular, fontSize: 7.5, color: PdfColors.grey300)),
                          ],
                        ),
                      ))
                else ...[
                  pw.Text('San Dias School of Design', style: pw.TextStyle(font: fontBold, fontSize: 8.5, color: PdfColors.white)),
                  pw.Text('2010 - 2013', style: pw.TextStyle(font: fontRegular, fontSize: 7.5, color: PdfColors.grey300)),
                ],
                pw.SizedBox(height: 16),

                pw.Text('Skills', style: pw.TextStyle(font: fontBold, fontSize: 11, color: PdfColors.white)),
                pw.Divider(color: PdfColors.white, thickness: 0.8),
                if (cvData.skills.isNotEmpty)
                  ...cvData.skills.map((skill) => pw.Text('• $skill', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)))
                else ...[
                  pw.Text('• Graphic Design', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                  pw.Text('• Illustration', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                  pw.Text('• Photography', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                ],
                pw.SizedBox(height: 16),

                pw.Text('Contact', style: pw.TextStyle(font: fontBold, fontSize: 11, color: PdfColors.white)),
                pw.Divider(color: PdfColors.white, thickness: 0.8),
                if (info.phone.isNotEmpty) pw.Text(info.phone, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                if (info.email.isNotEmpty) pw.Text(info.email, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              ],
            ),
          ),

          // Right Column
          pw.Expanded(
            child: pw.Container(
              padding: const pw.EdgeInsets.all(20),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    info.fullName.isNotEmpty ? info.fullName.toUpperCase() : 'FRANCOIS MERCER',
                    style: pw.TextStyle(font: fontBold, fontSize: 24, color: primaryColor),
                  ),
                  pw.Text(
                    (info.jobTitle.isNotEmpty ? info.jobTitle : 'GRAPHIC DESIGNER').toUpperCase(),
                    style: pw.TextStyle(font: fontBold, fontSize: 11, color: PdfColors.black),
                  ),
                  pw.SizedBox(height: 16),

                  _pdfMainPill('About Me', primaryColor, fontBold),
                  pw.SizedBox(height: 6),
                  pw.Text(
                    cvData.professionalSummary.isNotEmpty ? cvData.professionalSummary : 'Passionate graphic designer.',
                    style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey800),
                  ),
                  pw.SizedBox(height: 16),

                  _pdfMainPill('Experience Work', primaryColor, fontBold),
                  pw.SizedBox(height: 8),
                  if (cvData.experience.isNotEmpty)
                    ...cvData.experience.map((exp) => pw.Padding(
                          padding: const pw.EdgeInsets.only(bottom: 8),
                          child: pw.Column(
                            crossAxisAlignment: pw.CrossAxisAlignment.start,
                            children: [
                              pw.Text(exp.position.toUpperCase(), style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: PdfColors.black)),
                              pw.Text('${exp.startDate} / ${exp.endDate} – ${exp.company.toUpperCase()}', style: pw.TextStyle(font: fontBold, fontSize: 8, color: primaryColor)),
                              if (exp.description.isNotEmpty)
                                pw.Text(exp.description, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                            ],
                          ),
                        ))
                  else ...[
                    _pdfExpBlock('GRAPHIC DESIGN', 'LICERIA STUDIO', '2021 / 2022', fontBold, fontRegular),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 4. BENJAMIN SHAH / RICHARD SANCHEZ
  static pw.Widget _buildRichardSanchezPdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;

    return pw.Column(
      children: [
        // Top Banner
        pw.Container(
          height: 95,
          color: primaryColor,
          padding: const pw.EdgeInsets.only(left: 140, top: 20, right: 24),
          child: pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(
                info.fullName.isNotEmpty ? info.fullName.toUpperCase() : 'BENJAMIN SHAH',
                style: pw.TextStyle(font: fontBold, fontSize: 22, color: PdfColors.white),
              ),
              pw.SizedBox(height: 2),
              pw.Text(
                info.jobTitle.isNotEmpty ? info.jobTitle : 'Web Developer',
                style: pw.TextStyle(font: fontRegular, fontSize: 11, color: PdfColors.grey200),
              ),
            ],
          ),
        ),

        pw.SizedBox(height: 20),

        // Main 2 Columns
        pw.Expanded(
          child: pw.Stack(
            children: [
              pw.Padding(
                padding: const pw.EdgeInsets.symmetric(horizontal: 24),
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    // Left Column
                    pw.Expanded(
                      flex: 4,
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          _pdfMainPill('ABOUT ME', primaryColor, fontBold),
                          pw.SizedBox(height: 6),
                          pw.Text(cvData.professionalSummary, style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey800)),
                          pw.SizedBox(height: 16),

                          _pdfMainPill('CONTACT', primaryColor, fontBold),
                          pw.SizedBox(height: 6),
                          if (info.phone.isNotEmpty) pw.Text('• ${info.phone}', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                          if (info.email.isNotEmpty) pw.Text('• ${info.email}', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                          if (info.location.isNotEmpty) pw.Text('• ${info.location}', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                          pw.SizedBox(height: 16),

                          _pdfMainPill('EDUCATION', primaryColor, fontBold),
                          pw.SizedBox(height: 6),
                          if (cvData.education.isNotEmpty)
                            ...cvData.education.map((edu) => pw.Text('${edu.school} (${edu.startDate})', style: pw.TextStyle(font: fontBold, fontSize: 8.5)))
                          else
                            pw.Text('Rimberio of Computer Science', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
                        ],
                      ),
                    ),
                    pw.SizedBox(width: 20),

                    // Right Column
                    pw.Expanded(
                      flex: 5,
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          _pdfMainPill('SKILLS', primaryColor, fontBold),
                          pw.SizedBox(height: 6),
                          if (cvData.skills.isNotEmpty)
                            ...cvData.skills.map((s) => pw.Text('• $s', style: pw.TextStyle(font: fontRegular, fontSize: 8.5)))
                          else ...[
                            pw.Text('• Tailwind CSS', style: pw.TextStyle(font: fontRegular, fontSize: 8.5)),
                            pw.Text('• Flutter', style: pw.TextStyle(font: fontRegular, fontSize: 8.5)),
                            pw.Text('• Dart', style: pw.TextStyle(font: fontRegular, fontSize: 8.5)),
                          ],
                          pw.SizedBox(height: 16),

                          _pdfMainPill('EXPERIENCE', primaryColor, fontBold),
                          pw.SizedBox(height: 6),
                          if (cvData.experience.isNotEmpty)
                            ...cvData.experience.map((exp) => pw.Padding(
                                  padding: const pw.EdgeInsets.only(bottom: 8),
                                  child: pw.Column(
                                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                                    children: [
                                      pw.Text(exp.position, style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: primaryColor)),
                                      pw.Text('${exp.company} | ${exp.startDate}-${exp.endDate}', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                                    ],
                                  ),
                                ))
                          else ...[
                            _pdfExpBlock('Web Developer', 'Wardiere Inc.', '2021-2023', fontBold, fontRegular),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Overlapping Circle Avatar
              pw.Positioned(
                left: 24,
                top: -50,
                child: pw.Container(
                  width: 90,
                  height: 90,
                  decoration: pw.BoxDecoration(
                    shape: pw.BoxShape.circle,
                    color: PdfColors.white,
                    border: pw.Border.all(color: PdfColors.white, width: 3),
                  ),
                  child: profileImage != null
                      ? pw.Container(
                          decoration: pw.BoxDecoration(
                            shape: pw.BoxShape.circle,
                            image: pw.DecorationImage(image: profileImage, fit: pw.BoxFit.cover),
                          ),
                        )
                      : pw.Container(color: PdfColors.grey300),
                ),
              ),
            ],
          ),
        ),

        // Bottom Footer
        pw.Container(
          height: 24,
          color: primaryColor,
          margin: const pw.EdgeInsets.all(16),
        ),
      ],
    );
  }

  // 5. DANIEL GALLEGO
  static pw.Widget _buildDanielGallegoPdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;

    return pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.stretch,
      children: [
        // Left Sidebar
        pw.Container(
          width: 200,
          color: primaryColor,
          padding: const pw.EdgeInsets.all(16),
          child: pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              if (profileImage != null)
                pw.Center(
                  child: pw.Container(
                    width: 85,
                    height: 85,
                    decoration: pw.BoxDecoration(
                      shape: pw.BoxShape.circle,
                      border: pw.Border.all(color: PdfColors.white, width: 3),
                      image: pw.DecorationImage(image: profileImage, fit: pw.BoxFit.cover),
                    ),
                  ),
                ),
              pw.SizedBox(height: 20),

              _pdfOutlinePill('Contact', fontBold),
              pw.SizedBox(height: 6),
              if (info.phone.isNotEmpty) pw.Text(info.phone, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              if (info.email.isNotEmpty) pw.Text(info.email, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              if (info.location.isNotEmpty) pw.Text(info.location, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              pw.SizedBox(height: 18),

              _pdfOutlinePill('Languages', fontBold),
              pw.SizedBox(height: 6),
              if (cvData.languages.isNotEmpty)
                ...cvData.languages.map((l) => pw.Text('• ${l.name}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)))
              else ...[
                pw.Text('• English', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                pw.Text('• French', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              ],
            ],
          ),
        ),

        // Right Column
        pw.Expanded(
          child: pw.Container(
            padding: const pw.EdgeInsets.all(20),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Container(
                  width: double.infinity,
                  padding: const pw.EdgeInsets.all(14),
                  color: primaryColor,
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(info.fullName.isNotEmpty ? info.fullName : 'Daniel Gallego', style: pw.TextStyle(font: fontBold, fontSize: 20, color: PdfColors.white)),
                      pw.Text(info.jobTitle.isNotEmpty ? info.jobTitle : 'Freelance Presentation Designer', style: pw.TextStyle(font: fontRegular, fontSize: 10, color: PdfColors.grey300)),
                    ],
                  ),
                ),
                pw.SizedBox(height: 18),

                _pdfRibbonHeader('Profile', primaryColor, fontBold),
                pw.SizedBox(height: 6),
                pw.Text(cvData.professionalSummary, style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey800)),
                pw.SizedBox(height: 16),

                _pdfRibbonHeader('Education', primaryColor, fontBold),
                pw.SizedBox(height: 6),
                if (cvData.education.isNotEmpty)
                  ...cvData.education.map((edu) => pw.Text('${edu.school} | ${edu.major}', style: pw.TextStyle(font: fontBold, fontSize: 8.5)))
                else
                  pw.Text('Bachelor of Design | Borcelle University', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
                pw.SizedBox(height: 16),

                _pdfRibbonHeader('Experience', primaryColor, fontBold),
                pw.SizedBox(height: 6),
                if (cvData.experience.isNotEmpty)
                  ...cvData.experience.map((exp) => pw.Text('${exp.company} - ${exp.position}', style: pw.TextStyle(font: fontBold, fontSize: 8.5)))
                else
                  pw.Text('Lead Presentation Designer | Borcelle Studio', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 6. GEORGE WILKINS
  static pw.Widget _buildGeorgeWilkinsPdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;

    return pw.Container(
      padding: const pw.EdgeInsets.all(16),
      child: pw.Container(
        decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.black, width: 2)),
        padding: const pw.EdgeInsets.all(16),
        child: pw.Column(
          children: [
            pw.Row(
              children: [
                pw.Container(
                  width: 100,
                  height: 115,
                  decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.black, width: 2)),
                  child: profileImage != null ? pw.Image(profileImage, fit: pw.BoxFit.cover) : pw.Container(color: PdfColors.grey300),
                ),
                pw.SizedBox(width: 14),
                pw.Expanded(
                  child: pw.Column(
                    children: [
                      pw.Container(
                        width: double.infinity,
                        padding: const pw.EdgeInsets.all(10),
                        color: primaryColor,
                        child: pw.Column(
                          crossAxisAlignment: pw.CrossAxisAlignment.start,
                          children: [
                            pw.Text(info.fullName.isNotEmpty ? info.fullName.toUpperCase() : 'DANIEL GALLEGO', style: pw.TextStyle(font: fontBold, fontSize: 18, color: PdfColors.white)),
                            pw.Text(info.jobTitle.isNotEmpty ? info.jobTitle : 'Graphics Designer', style: pw.TextStyle(font: fontRegular, fontSize: 10, color: PdfColors.grey300)),
                          ],
                        ),
                      ),
                      pw.SizedBox(height: 8),
                      _pdfBoxedHeader('ABOUT ME', fontBold),
                      pw.SizedBox(height: 4),
                      pw.Text(cvData.professionalSummary, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
                    ],
                  ),
                ),
              ],
            ),
            pw.SizedBox(height: 14),

            pw.Row(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Expanded(
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      _pdfBoxedHeader('CONTACT ME', fontBold),
                      pw.SizedBox(height: 4),
                      if (info.phone.isNotEmpty) pw.Text('• ${info.phone}', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                      if (info.email.isNotEmpty) pw.Text('• ${info.email}', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                      pw.SizedBox(height: 12),

                      _pdfBoxedHeader('EDUCATION', fontBold),
                      pw.SizedBox(height: 4),
                      if (cvData.education.isNotEmpty)
                        ...cvData.education.map((edu) => pw.Text('• ${edu.school}', style: pw.TextStyle(font: fontBold, fontSize: 8.5)))
                      else
                        pw.Text('• Bachelor of Design (2016-2019)', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
                    ],
                  ),
                ),
                pw.SizedBox(width: 14),

                pw.Expanded(
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      _pdfBoxedHeader('WORK EXPERIENCE', fontBold),
                      pw.SizedBox(height: 4),
                      if (cvData.experience.isNotEmpty)
                        ...cvData.experience.map((exp) => pw.Text('• ${exp.company} (${exp.position})', style: pw.TextStyle(font: fontBold, fontSize: 8.5)))
                      else
                        pw.Text('• Borcelle Industries (2021-2023)', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
                      pw.SizedBox(height: 12),

                      _pdfBoxedHeader('SKILL', fontBold),
                      pw.SizedBox(height: 4),
                      if (cvData.skills.isNotEmpty)
                        ...cvData.skills.map((s) => pw.Text('• $s', style: pw.TextStyle(font: fontRegular, fontSize: 8)))
                      else
                        pw.Text('• Typography • Branding • Software', style: pw.TextStyle(font: fontRegular, fontSize: 8)),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 7. FRANCISCO ANDRADE
  static pw.Widget _buildFranciscoAndradePdf(
    CVData cvData,
    PdfColor primaryColor,
    pw.MemoryImage? profileImage,
    pw.Font fontRegular,
    pw.Font fontBold,
  ) {
    final info = cvData.personalInfo;

    return pw.Container(
      padding: const pw.EdgeInsets.all(16),
      child: pw.Row(
          crossAxisAlignment: pw.CrossAxisAlignment.stretch,
        children: [
          pw.Container(
            width: 190,
            color: primaryColor,
            padding: const pw.EdgeInsets.all(14),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                if (profileImage != null)
                  pw.Center(
                    child: pw.Container(
                      width: 80,
                      height: 80,
                      decoration: pw.BoxDecoration(
                        shape: pw.BoxShape.circle,
                        border: pw.Border.all(color: PdfColors.white, width: 2),
                        image: pw.DecorationImage(image: profileImage, fit: pw.BoxFit.cover),
                      ),
                    ),
                  ),
                pw.SizedBox(height: 16),

                _pdfSidebarPillWhite('CONTACT ME', fontBold),
                pw.SizedBox(height: 6),
                if (info.phone.isNotEmpty) pw.Text('• ${info.phone}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                if (info.email.isNotEmpty) pw.Text('• ${info.email}', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                pw.SizedBox(height: 14),

                _pdfSidebarPillWhite('SKILLS', fontBold),
                pw.SizedBox(height: 6),
                if (cvData.skills.isNotEmpty)
                  ...cvData.skills.map((s) => pw.Text('• $s', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)))
                else
                  pw.Text('• Project Management\n• Teamwork', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
              ],
            ),
          ),
          pw.SizedBox(width: 16),

          pw.Expanded(
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(info.fullName.toUpperCase(), style: pw.TextStyle(font: fontBold, fontSize: 22, color: primaryColor)),
                pw.Text(info.jobTitle, style: pw.TextStyle(font: fontRegular, fontSize: 12, color: PdfColors.black)),
                pw.SizedBox(height: 16),

                _pdfMainPill('ABOUT ME', primaryColor, fontBold),
                pw.SizedBox(height: 6),
                pw.Text(cvData.professionalSummary, style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey800)),
                pw.SizedBox(height: 14),

                _pdfMainPill('EXPERIENCE', primaryColor, fontBold),
                pw.SizedBox(height: 6),
                if (cvData.experience.isNotEmpty)
                  ...cvData.experience.map((exp) => pw.Text('${exp.position} - ${exp.company}', style: pw.TextStyle(font: fontBold, fontSize: 8.5)))
                else
                  pw.Text('Marketing Manager - Really Great Industries', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- Helper Methods ---
  static pw.Widget _pdfMainPill(String title, PdfColor color, pw.Font fontBold) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: pw.BoxDecoration(
        color: color,
        borderRadius: pw.BorderRadius.circular(12),
      ),
      child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 9, color: PdfColors.white)),
    );
  }

  static pw.Widget _pdfSidebarHeader(String title, PdfColor color, pw.Font fontBold) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      color: color,
      child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 9, color: PdfColors.white)),
    );
  }

  static pw.Widget _pdfMainHeader(String title, PdfColor color, pw.Font fontBold) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      color: color,
      child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 10, color: PdfColors.white)),
    );
  }

  static pw.Widget _pdfContactItem(String text, PdfColor color, pw.Font fontRegular) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 3),
      child: pw.Text('• $text', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
    );
  }

  static pw.Widget _pdfOutlinePill(String title, pw.Font fontBold) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: pw.BoxDecoration(
        border: pw.Border.all(color: PdfColors.white, width: 1),
        borderRadius: pw.BorderRadius.circular(12),
      ),
      child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 9, color: PdfColors.white)),
    );
  }

  static pw.Widget _pdfRibbonHeader(String title, PdfColor color, pw.Font fontBold) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(6),
      color: color,
      child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 10, color: PdfColors.white)),
    );
  }

  static pw.Widget _pdfBoxedHeader(String title, pw.Font fontBold) {
    return pw.Container(
      width: double.infinity,
      padding: const pw.EdgeInsets.all(4),
      decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.black, width: 1)),
      child: pw.Center(
        child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 9, color: PdfColors.black)),
      ),
    );
  }

  static pw.Widget _pdfSidebarPillWhite(String title, pw.Font fontBold) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: pw.BoxDecoration(
        color: PdfColors.white,
        borderRadius: pw.BorderRadius.circular(12),
      ),
      child: pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 8.5, color: PdfColors.black)),
    );
  }

  static pw.Widget _pdfExpBlock(String role, String company, String date, pw.Font fontBold, pw.Font fontRegular) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 6),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(role, style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: PdfColors.black)),
          pw.Text('$company | $date', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey700)),
        ],
      ),
    );
  }

  static pw.Widget _pdfEduBlock(String school, String major, String date, pw.Font fontBold, pw.Font fontRegular) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 6),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(school, style: pw.TextStyle(font: fontBold, fontSize: 9.5, color: PdfColors.black)),
          pw.Text('$major | $date', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey700)),
        ],
      ),
    );
  }

  static Future<void> downloadPdf(CVData cvData) async {
    final pdfBytes = await generatePdf(cvData);
    final filename = '${cvData.personalInfo.fullName.replaceAll(' ', '_')}_CV.pdf';
    await Printing.sharePdf(bytes: pdfBytes, filename: filename);
  }

  static Future<void> printPdf(CVData cvData) async {
    final pdfBytes = await generatePdf(cvData);
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdfBytes,
      name: '${cvData.personalInfo.fullName.replaceAll(' ', '_')}_CV.pdf',
    );
  }
}
