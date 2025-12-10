// App Configuration
class AppConfig {
  // API Configuration - Update this with your actual backend URL
  static const String baseUrl = 'https://ten256.vercel.app/api';
  
  // For local development
  static const String localBaseUrl = 'http://localhost:3000/api';
  
  // Use local URL for development
  static const bool isDevelopment = true;
  
  static String get apiUrl => isDevelopment ? localBaseUrl : baseUrl;
  
  // API Endpoints (using nurse endpoints)
  static const String loginEndpoint = '/nurse/auth';
  static const String profileEndpoint = '/nurse/me';
  static const String dashboardEndpoint = '/nurse/dashboard';
  static const String mothersEndpoint = '/nurse/mothers';
  static const String childrenEndpoint = '/nurse/children';
  static const String vaccinesEndpoint = '/nurse/vaccines';
  static const String immunizationsEndpoint = '/nurse/immunizations';
  static const String schedulesEndpoint = '/nurse/schedules';
  
  // App Info
  static const String appName = 'MARV Nurse';
  static const String appVersion = '1.0.0';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String hospitalKey = 'hospital_data';
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
