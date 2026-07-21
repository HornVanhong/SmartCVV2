import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/cv_model.dart';

class CVProvider extends ChangeNotifier {
  static const String _storageKey = 'smart_cv_data_v1';
  final Uuid _uuid = const Uuid();

  CVData _cvData = CVData();
  bool _isLoading = true;

  CVData get cvData => _cvData;
  bool get isLoading => _isLoading;

  CVProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawJson = prefs.getString(_storageKey);
      if (rawJson != null && rawJson.isNotEmpty) {
        final decoded = jsonDecode(rawJson);
        _cvData = CVData.fromJson(decoded);
      }
    } catch (e) {
      debugPrint('Error loading CV from SharedPreferences: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_cvData.toJson());
      await prefs.setString(_storageKey, encoded);
    } catch (e) {
      debugPrint('Error saving CV to SharedPreferences: $e');
    }
  }

  // --- Personal Info Updates ---
  void updatePersonalInfo(PersonalInfo info) {
    _cvData.personalInfo = info;
    notifyListeners();
    saveToStorage();
  }

  void updateProfessionalSummary(String summary) {
    _cvData.professionalSummary = summary;
    notifyListeners();
    saveToStorage();
  }

  // --- Theme Updates ---
  void updateTheme(CVTheme theme) {
    _cvData.theme = theme;
    notifyListeners();
    saveToStorage();
  }

  void setTemplate(String templateId) {
    _cvData.theme.templateId = templateId;
    notifyListeners();
    saveToStorage();
  }

  void setPrimaryColor(String hex) {
    _cvData.theme.primaryColorHex = hex;
    notifyListeners();
    saveToStorage();
  }

  // --- Experience Updates ---
  void addExperience(Experience exp) {
    exp.id = _uuid.v4();
    _cvData.experience.add(exp);
    notifyListeners();
    saveToStorage();
  }

  void updateExperience(int index, Experience exp) {
    if (index >= 0 && index < _cvData.experience.length) {
      _cvData.experience[index] = exp;
      notifyListeners();
      saveToStorage();
    }
  }

  void removeExperience(int index) {
    if (index >= 0 && index < _cvData.experience.length) {
      _cvData.experience.removeAt(index);
      notifyListeners();
      saveToStorage();
    }
  }

  // --- Education Updates ---
  void addEducation(Education edu) {
    edu.id = _uuid.v4();
    _cvData.education.add(edu);
    notifyListeners();
    saveToStorage();
  }

  void updateEducation(int index, Education edu) {
    if (index >= 0 && index < _cvData.education.length) {
      _cvData.education[index] = edu;
      notifyListeners();
      saveToStorage();
    }
  }

  void removeEducation(int index) {
    if (index >= 0 && index < _cvData.education.length) {
      _cvData.education.removeAt(index);
      notifyListeners();
      saveToStorage();
    }
  }

  // --- Skills Updates ---
  void addSkill(String skill) {
    if (skill.trim().isNotEmpty && !_cvData.skills.contains(skill.trim())) {
      _cvData.skills.add(skill.trim());
      notifyListeners();
      saveToStorage();
    }
  }

  void removeSkill(String skill) {
    _cvData.skills.remove(skill);
    notifyListeners();
    saveToStorage();
  }

  // --- Projects Updates ---
  void addProject(Project project) {
    project.id = _uuid.v4();
    _cvData.projects.add(project);
    notifyListeners();
    saveToStorage();
  }

  void updateProject(int index, Project project) {
    if (index >= 0 && index < _cvData.projects.length) {
      _cvData.projects[index] = project;
      notifyListeners();
      saveToStorage();
    }
  }

  void removeProject(int index) {
    if (index >= 0 && index < _cvData.projects.length) {
      _cvData.projects.removeAt(index);
      notifyListeners();
      saveToStorage();
    }
  }

  // --- Languages Updates ---
  void addLanguage(Language language) {
    language.id = _uuid.v4();
    _cvData.languages.add(language);
    notifyListeners();
    saveToStorage();
  }

  void removeLanguage(int index) {
    if (index >= 0 && index < _cvData.languages.length) {
      _cvData.languages.removeAt(index);
      notifyListeners();
      saveToStorage();
    }
  }

  // --- Reset to sample ---
  void resetToSampleData() {
    _cvData = CVData();
    notifyListeners();
    saveToStorage();
  }

  void loadMarketingSample() {
    _cvData = CVData();
    notifyListeners();
    saveToStorage();
  }

  void loadGraphicDesignerSample() {
    _cvData = CVData();
    notifyListeners();
    saveToStorage();
  }
}
