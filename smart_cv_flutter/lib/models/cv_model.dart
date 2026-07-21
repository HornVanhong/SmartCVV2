import 'dart:typed_data';
import 'package:flutter/material.dart';

class PersonalInfo {
  String fullName;
  String jobTitle;
  String email;
  String phone;
  String location;
  String github;
  String linkedin;
  String portfolio;
  String? photo;
  Uint8List? photoBytes;
  String? targetRole;
  String? dob;
  String? nationality;
  String? gender;
  String? placeOfBirth;

  PersonalInfo({
    this.fullName = 'Daniel Morton',
    this.jobTitle = 'Graphic Designer',
    this.email = 'hello@reallygreatsite.com',
    this.phone = '+123-456-7890',
    this.location = '123 Anywhere St., Any City',
    this.github = '@reallygreatsite',
    this.linkedin = 'linkedin.com/in/danielmorton',
    this.portfolio = 'www.reallygreatsite.com',
    this.photo,
    this.photoBytes,
    this.targetRole,
    this.dob = '1996-09-14',
    this.nationality = 'American',
    this.gender = 'Male',
    this.placeOfBirth = 'Los Angeles',
  });

  Map<String, dynamic> toJson() => {
        'fullName': fullName,
        'jobTitle': jobTitle,
        'email': email,
        'phone': phone,
        'location': location,
        'github': github,
        'linkedin': linkedin,
        'portfolio': portfolio,
        'targetRole': targetRole,
        'dob': dob,
        'nationality': nationality,
        'gender': gender,
        'placeOfBirth': placeOfBirth,
      };

  factory PersonalInfo.fromJson(Map<String, dynamic> json) => PersonalInfo(
        fullName: json['fullName'] ?? '',
        jobTitle: json['jobTitle'] ?? '',
        email: json['email'] ?? '',
        phone: json['phone'] ?? '',
        location: json['location'] ?? '',
        github: json['github'] ?? '',
        linkedin: json['linkedin'] ?? '',
        portfolio: json['portfolio'] ?? '',
        targetRole: json['targetRole'],
        dob: json['dob'],
        nationality: json['nationality'],
        gender: json['gender'],
        placeOfBirth: json['placeOfBirth'],
      );
}

class Education {
  String id;
  String school;
  String major;
  String startDate;
  String endDate;
  String description;

  Education({
    required this.id,
    required this.school,
    required this.major,
    required this.startDate,
    required this.endDate,
    required this.description,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'school': school,
        'major': major,
        'startDate': startDate,
        'endDate': endDate,
        'description': description,
      };

  factory Education.fromJson(Map<String, dynamic> json) => Education(
        id: json['id'] ?? '',
        school: json['school'] ?? '',
        major: json['major'] ?? '',
        startDate: json['startDate'] ?? '',
        endDate: json['endDate'] ?? '',
        description: json['description'] ?? '',
      );
}

class Experience {
  String id;
  String company;
  String position;
  String startDate;
  String endDate;
  String description;

  Experience({
    required this.id,
    required this.company,
    required this.position,
    required this.startDate,
    required this.endDate,
    required this.description,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'company': company,
        'position': position,
        'startDate': startDate,
        'endDate': endDate,
        'description': description,
      };

  factory Experience.fromJson(Map<String, dynamic> json) => Experience(
        id: json['id'] ?? '',
        company: json['company'] ?? '',
        position: json['position'] ?? '',
        startDate: json['startDate'] ?? '',
        endDate: json['endDate'] ?? '',
        description: json['description'] ?? '',
      );
}

class Project {
  String id;
  String name;
  String description;
  String technologies;
  String link;

  Project({
    required this.id,
    required this.name,
    required this.description,
    required this.technologies,
    required this.link,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'technologies': technologies,
        'link': link,
      };

  factory Project.fromJson(Map<String, dynamic> json) => Project(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        description: json['description'] ?? '',
        technologies: json['technologies'] ?? '',
        link: json['link'] ?? '',
      );
}

class Language {
  String id;
  String name;
  String level;

  Language({
    required this.id,
    required this.name,
    required this.level,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'level': level,
      };

  factory Language.fromJson(Map<String, dynamic> json) => Language(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        level: json['level'] ?? '',
      );
}

class CVTheme {
  String templateId;
  String primaryColorHex;
  String fontColorHex;
  String backgroundColorHex;
  String fontFamily;
  double fontSizeScale;

  CVTheme({
    this.templateId = 'daniel_morton',
    this.primaryColorHex = '#800A17',
    this.fontColorHex = '#ffffff',
    this.backgroundColorHex = '#800A17',
    this.fontFamily = 'Inter',
    this.fontSizeScale = 1.0,
  });

  Color get primaryColor => _parseColor(primaryColorHex, const Color(0xFF800A17));
  Color get fontColor => _parseColor(fontColorHex, Colors.white);
  Color get backgroundColor => _parseColor(backgroundColorHex, const Color(0xFF800A17));

  static Color _parseColor(String hex, Color fallback) {
    try {
      final clean = hex.replaceAll('#', '');
      if (clean.length == 6) {
        return Color(int.parse('FF$clean', radix: 16));
      }
    } catch (_) {}
    return fallback;
  }

  Map<String, dynamic> toJson() => {
        'templateId': templateId,
        'primaryColorHex': primaryColorHex,
        'fontColorHex': fontColorHex,
        'backgroundColorHex': backgroundColorHex,
        'fontFamily': fontFamily,
        'fontSizeScale': fontSizeScale,
      };

  factory CVTheme.fromJson(Map<String, dynamic> json) => CVTheme(
        templateId: json['templateId'] ?? 'daniel_morton',
        primaryColorHex: json['primaryColorHex'] ?? '#800A17',
        fontColorHex: json['fontColorHex'] ?? '#ffffff',
        backgroundColorHex: json['backgroundColorHex'] ?? '#800A17',
        fontFamily: json['fontFamily'] ?? 'Inter',
        fontSizeScale: (json['fontSizeScale'] as num?)?.toDouble() ?? 1.0,
      );
}

class CVData {
  PersonalInfo personalInfo;
  String professionalSummary;
  List<Education> education;
  List<String> skills;
  List<Project> projects;
  List<Experience> experience;
  List<Language> languages;
  CVTheme theme;

  CVData({
    PersonalInfo? personalInfo,
    this.professionalSummary =
        'Dedicated and detail-oriented Graphic Designer with experience creating high-quality visual assets for digital and commercial platforms. Specializes in modern, minimalist layouts, corporate branding elements, and visual identity design. Passionate about translating complex ideas into clean, engaging, and impactful marketing visuals that effectively connect brands with their target audience.',
    List<Education>? education,
    List<String>? skills,
    List<Project>? projects,
    List<Experience>? experience,
    List<Language>? languages,
    CVTheme? theme,
  })  : personalInfo = personalInfo ?? PersonalInfo(),
        education = education ??
            [
              Education(
                id: 'e1',
                school: 'West University',
                major: 'Bachelor of Creative Arts / Design | Graduated: 2022',
                startDate: '2018',
                endDate: '2022',
                description:
                    'Studied advanced visual communication, color theory, typography, and digital illustration techniques.',
              ),
              Education(
                id: 'e2',
                school: 'West High School',
                major: 'High School Diploma | Graduated: 2018',
                startDate: '2014',
                endDate: '2018',
                description:
                    'Learned fundamental principles of multimedia production, basic software operations, and creative project development.',
              ),
            ],
        skills = skills ??
            [
              'Brand Identity & Minimalist Layouts',
              'Vector Illustration & Marketing Collateral',
              'Digital Asset Creation',
              'Vector Editing Software & Photo Manipulation',
              'Layout & Typography Design',
              'Asset Preparation for Digital Marketplaces',
            ],
        projects = projects ?? [],
        experience = experience ??
            [
              Experience(
                id: 'exp1',
                company: 'Bold Design Studio',
                position: 'Graphic Designer | 2024 – Present',
                startDate: '2024',
                endDate: 'Present',
                description:
                    '• Conceptualized and designed creative assets, digital illustrations, and marketing collateral for diverse industries, ensuring high commercial value and strict licensing compliance.\n• Developed comprehensive branding packages and modern minimalist layouts for real estate and product promotions, enhancing brand visibility.\n• Collaborated on visual strategies to deliver clean, flat, and professional graphics tailored for social media campaigns and digital storefronts.',
              ),
            ],
        languages = languages ??
            [
              Language(id: 'l1', name: 'Spanish', level: 'Native'),
              Language(id: 'l2', name: 'English', level: 'Fluent'),
              Language(id: 'l3', name: 'French', level: 'Intermediate'),
            ],
        theme = theme ?? CVTheme();

  Map<String, dynamic> toJson() => {
        'personalInfo': personalInfo.toJson(),
        'professionalSummary': professionalSummary,
        'education': education.map((e) => e.toJson()).toList(),
        'skills': skills,
        'projects': projects.map((p) => p.toJson()).toList(),
        'experience': experience.map((e) => e.toJson()).toList(),
        'languages': languages.map((l) => l.toJson()).toList(),
        'theme': theme.toJson(),
      };

  factory CVData.fromJson(Map<String, dynamic> json) => CVData(
        personalInfo: json['personalInfo'] != null
            ? PersonalInfo.fromJson(json['personalInfo'])
            : PersonalInfo(),
        professionalSummary: json['professionalSummary'] ?? '',
        education: (json['education'] as List? ?? [])
            .map((e) => Education.fromJson(e))
            .toList(),
        skills: List<String>.from(json['skills'] ?? []),
        projects: (json['projects'] as List? ?? [])
            .map((p) => Project.fromJson(p))
            .toList(),
        experience: (json['experience'] as List? ?? [])
            .map((e) => Experience.fromJson(e))
            .toList(),
        languages: (json['languages'] as List? ?? [])
            .map((l) => Language.fromJson(l))
            .toList(),
        theme: json['theme'] != null ? CVTheme.fromJson(json['theme']) : CVTheme(),
      );
}
