import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  User? _currentUser;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;
  
  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  
  AuthService() {
    _checkAuthStatus();
  }
  
  Future<void> _checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConfig.tokenKey);
      final userData = prefs.getString(AppConfig.userKey);
      
      if (token != null && userData != null) {
        _apiService.setAuthToken(token);
        _currentUser = User.fromJson(jsonDecode(userData));
        _isAuthenticated = true;
      }
    } catch (e) {
      print('Error checking auth status: $e');
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.post(
        AppConfig.loginEndpoint,
        data: {
          'email': email,
          'password': password,
        },
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['token'];
        final user = User.fromJson(data['user']);
        
        // Save to shared preferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConfig.tokenKey, token);
        await prefs.setString(AppConfig.userKey, jsonEncode(user.toJson()));
        
        _apiService.setAuthToken(token);
        _currentUser = user;
        _isAuthenticated = true;
        _isLoading = false;
        notifyListeners();
        
        return true;
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      print('Login error: $e');
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }
  
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConfig.tokenKey);
      await prefs.remove(AppConfig.userKey);
      
      _apiService.clearAuthToken();
      _currentUser = null;
      _isAuthenticated = false;
    } catch (e) {
      print('Logout error: $e');
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  Future<bool> refreshProfile() async {
    if (!_isAuthenticated) return false;
    
    try {
      final response = await _apiService.get(AppConfig.profileEndpoint);
      
      if (response.statusCode == 200) {
        final user = User.fromJson(response.data);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConfig.userKey, jsonEncode(user.toJson()));
        
        _currentUser = user;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Refresh profile error: $e');
    }
    
    return false;
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
