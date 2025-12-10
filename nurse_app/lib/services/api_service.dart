import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  
  late Dio _dio;
  String? _authToken;
  
  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiUrl,
      connectTimeout: AppConfig.connectionTimeout,
      receiveTimeout: AppConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    // Add interceptors for logging and token handling
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token if available
        if (_authToken != null) {
          options.headers['Authorization'] = 'Bearer $_authToken';
        }
        print('REQUEST[${options.method}] => PATH: ${options.path}');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (DioException error, handler) {
        print('ERROR[${error.response?.statusCode}] => PATH: ${error.requestOptions.path}');
        return handler.next(error);
      },
    ));
  }
  
  void setAuthToken(String token) {
    _authToken = token;
  }
  
  void clearAuthToken() {
    _authToken = null;
  }
  
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString(AppConfig.tokenKey);
  }
  
  // Generic GET request
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // Generic POST request
  Future<Response> post(String path, {dynamic data}) async {
    try {
      return await _dio.post(path, data: data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // Generic PUT request
  Future<Response> put(String path, {dynamic data}) async {
    try {
      return await _dio.put(path, data: data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // Generic PATCH request
  Future<Response> patch(String path, {dynamic data}) async {
    try {
      return await _dio.patch(path, data: data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // Generic DELETE request
  Future<Response> delete(String path) async {
    try {
      return await _dio.delete(path);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  Exception _handleError(DioException error) {
    String message = 'An error occurred';
    
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      message = 'Connection timeout. Please check your internet connection.';
    } else if (error.type == DioExceptionType.connectionError) {
      message = 'No internet connection. Please check your network.';
    } else if (error.response != null) {
      final statusCode = error.response?.statusCode;
      final data = error.response?.data;
      
      if (data is Map && data['message'] != null) {
        message = data['message'];
      } else {
        switch (statusCode) {
          case 400:
            message = 'Bad request. Please check your input.';
            break;
          case 401:
            message = 'Unauthorized. Please login again.';
            break;
          case 403:
            message = 'Access denied. You do not have permission.';
            break;
          case 404:
            message = 'Resource not found.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = 'Error: $statusCode';
        }
      }
    }
    
    return Exception(message);
  }
}
