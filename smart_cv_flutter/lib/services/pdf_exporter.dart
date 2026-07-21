import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/cv_model.dart';

class PdfExporter {
  static Future<Uint8List> generatePdf(CVData cvData) async {
    final pdf = pw.Document();

    final darkCrimson = PdfColor.fromInt(0xFF6E0812);
    final bodyCrimson = PdfColor.fromInt(0xFF850B19);
    final pillCrimson = PdfColor.fromInt(0xFF4C050C);

    final fontRegular = await PdfGoogleFonts.interRegular();
    final fontBold = await PdfGoogleFonts.interBold();

    pw.MemoryImage? profileImage;
    if (cvData.personalInfo.photoBytes != null && cvData.personalInfo.photoBytes!.isNotEmpty) {
      try {
        profileImage = pw.MemoryImage(cvData.personalInfo.photoBytes!);
      } catch (_) {}
    }

    final info = cvData.personalInfo;
    final nameParts = info.fullName.trim().split(' ');
    final firstName = nameParts.isNotEmpty ? nameParts.first.toUpperCase() : 'DANIEL';
    final lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ').toUpperCase() : 'MORTON';

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: pw.EdgeInsets.zero,
        build: (pw.Context context) {
          return pw.Row(
            crossAxisAlignment: pw.CrossAxisAlignment.stretch,
            children: [
              // Left Dark Crimson Sidebar (240 width)
              pw.Container(
                width: 240,
                color: darkCrimson,
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

                    // About Me
                    _mortonSidebarHeadingPdf('About Me', fontBold),
                    pw.Text(cvData.professionalSummary, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                    pw.SizedBox(height: 18),

                    // Contact Me
                    _mortonSidebarHeadingPdf('Contact Me', fontBold),
                    _mortonContactRowPdf('Phone: ${info.phone}', fontRegular),
                    _mortonContactRowPdf('Email: ${info.email}', fontRegular),
                    _mortonContactRowPdf('Web: ${info.portfolio}', fontRegular),
                    _mortonContactRowPdf('Loc: ${info.location}', fontRegular),
                    pw.SizedBox(height: 18),

                    // Skills
                    _mortonSidebarHeadingPdf('Skills', fontBold),
                    ...cvData.skills.map((skill) => pw.Padding(
                          padding: const pw.EdgeInsets.only(bottom: 3),
                          child: pw.Text('• $skill', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
                        )),
                    pw.SizedBox(height: 18),

                    // Language
                    if (cvData.languages.isNotEmpty) ...[
                      _mortonSidebarHeadingPdf('Language', fontBold),
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
                  color: bodyCrimson,
                  padding: const pw.EdgeInsets.all(24),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      // Candidate Name & Title Header
                      pw.Text(firstName, style: pw.TextStyle(font: fontBold, fontSize: 24, color: PdfColors.white)),
                      pw.Text(lastName, style: pw.TextStyle(font: fontBold, fontSize: 24, color: PdfColors.white)),
                      pw.SizedBox(height: 10),

                      // Subtitle Pill
                      pw.Container(
                        padding: const pw.EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: pw.BoxDecoration(
                          color: pillCrimson,
                          borderRadius: pw.BorderRadius.circular(12),
                        ),
                        child: pw.Text(info.jobTitle.toUpperCase(), style: pw.TextStyle(font: fontBold, fontSize: 9, color: PdfColors.white)),
                      ),
                      pw.SizedBox(height: 24),

                      // Education
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
                                if (edu.description.isNotEmpty)
                                  pw.Text(edu.description, style: pw.TextStyle(font: fontRegular, fontSize: 7.5, color: PdfColors.white)),
                              ],
                            ),
                          );
                        }),
                        pw.SizedBox(height: 18),
                      ],

                      // Work Experience
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
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _mortonSidebarHeadingPdf(String title, pw.Font fontBold) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(title, style: pw.TextStyle(font: fontBold, fontSize: 11, color: PdfColors.white)),
        pw.SizedBox(height: 4),
      ],
    );
  }

  static pw.Widget _mortonContactRowPdf(String text, pw.Font fontRegular) {
    return pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 3),
      child: pw.Text(text, style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.white)),
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
