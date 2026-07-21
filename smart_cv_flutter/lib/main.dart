import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/cv_provider.dart';
import 'views/cv_form.dart';
import 'views/cv_preview.dart';
import 'services/pdf_exporter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => CVProvider(),
      child: const SmartCVApp(),
    ),
  );
}

class SmartCVApp extends StatelessWidget {
  const SmartCVApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartCV Builder - Professional CV Web & Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          primary: const Color(0xFF2563EB),
        ),
        textTheme: GoogleFonts.interTextTheme(),
        scaffoldBackgroundColor: const Color(0xFFF1F5F9),
      ),
      home: const MainLayoutScreen(),
    );
  }
}

class MainLayoutScreen extends StatefulWidget {
  const MainLayoutScreen({super.key});

  @override
  State<MainLayoutScreen> createState() => _MainLayoutScreenState();
}

class _MainLayoutScreenState extends State<MainLayoutScreen> {
  // Mobile mode index: 0 = Form Editor, 1 = Live Preview Canvas
  int _mobileSelectedIndex = 0;
  bool _isExporting = false;

  @override
  Widget build(BuildContext context) {
    final cvProvider = Provider.of<CVProvider>(context);
    final media = MediaQuery.of(context);
    final screenWidth = media.size.width;
    final isMobile = screenWidth < 850; // Breakpoint for mobile

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 2,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.description_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: const [
                Text(
                  'SmartCV Builder',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white),
                ),
                Text(
                  'Cross-Platform Web & Mobile Edition',
                  style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Auto-save Status Indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: const [
                Icon(Icons.check_circle_rounded, color: Color(0xFF22C55E), size: 14),
                SizedBox(width: 6),
                Text('Auto-saved', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // Export PDF Quick Button
          ElevatedButton.icon(
            onPressed: _isExporting
                ? null
                : () async {
                    setState(() => _isExporting = true);
                    try {
                      await PdfExporter.downloadPdf(cvProvider.cvData);
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Export failed: $e')),
                        );
                      }
                    } finally {
                      if (mounted) setState(() => _isExporting = false);
                    }
                  },
            icon: _isExporting
                ? const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.picture_as_pdf_rounded, size: 16),
            label: Text(
              _isExporting ? 'Saving...' : 'Export PDF',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              elevation: 2,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),

      // Responsive Body Split
      body: isMobile
          ? IndexedStack(
              index: _mobileSelectedIndex,
              children: const [
                CVFormView(),
                CVPreviewView(),
              ],
            )
          : Row(
              children: [
                // Form Editor Left Column (Fixed 460px or 42% width)
                SizedBox(
                  width: screenWidth > 1300 ? 480 : screenWidth * 0.42,
                  child: const CVFormView(),
                ),

                const VerticalDivider(width: 1, thickness: 1, color: Color(0xFFE2E8F0)),

                // Live Preview Right Column
                const Expanded(
                  child: CVPreviewView(),
                ),
              ],
            ),

      // Mobile Bottom Navigation Bar (Shown only on small screens)
      bottomNavigationBar: isMobile
          ? BottomNavigationBar(
              currentIndex: _mobileSelectedIndex,
              onTap: (index) {
                setState(() {
                  _mobileSelectedIndex = index;
                });
              },
              selectedItemColor: const Color(0xFF2563EB),
              unselectedItemColor: const Color(0xFF64748B),
              backgroundColor: Colors.white,
              elevation: 12,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.edit_note_rounded),
                  label: 'CV Form Editor',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.remove_red_eye_rounded),
                  label: 'Live Canvas Preview',
                ),
              ],
            )
          : null,
    );
  }
}
