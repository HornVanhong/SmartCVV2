import 'package:flutter_test/flutter_test.dart';
import 'package:smart_cv_flutter/main.dart';

void main() {
  testWidgets('SmartCV app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartCVApp());
    expect(find.text('SmartCV'), findsOneWidget);
  });
}
