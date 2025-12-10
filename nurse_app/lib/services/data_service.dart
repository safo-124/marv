import 'package:flutter/foundation.dart';
import '../config/app_config.dart';
import '../models/models.dart';
import 'api_service.dart';

class DataService extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  // Data caches
  List<Mother> _mothers = [];
  List<Child> _children = [];
  List<Vaccine> _vaccines = [];
  List<ImmunizationSchedule> _schedules = [];
  
  // Loading states
  bool _isLoadingMothers = false;
  bool _isLoadingChildren = false;
  bool _isLoadingVaccines = false;
  bool _isLoadingSchedules = false;
  
  // Getters
  List<Mother> get mothers => _mothers;
  List<Child> get children => _children;
  List<Vaccine> get vaccines => _vaccines;
  List<ImmunizationSchedule> get schedules => _schedules;
  
  bool get isLoadingMothers => _isLoadingMothers;
  bool get isLoadingChildren => _isLoadingChildren;
  bool get isLoadingVaccines => _isLoadingVaccines;
  bool get isLoadingSchedules => _isLoadingSchedules;
  
  // Dashboard stats
  int get totalMothers => _mothers.length;
  int get totalChildren => _children.length;
  int get todaySchedules => _schedules.where((s) => s.isDueToday).length;
  int get overdueSchedules => _schedules.where((s) => s.isOverdue).length;
  int get upcomingSchedules => _schedules.where((s) => s.isDueSoon && !s.isDueToday).length;
  
  // MOTHERS
  Future<void> fetchMothers({String? search}) async {
    _isLoadingMothers = true;
    notifyListeners();
    
    try {
      final response = await _apiService.get(
        AppConfig.mothersEndpoint,
        queryParameters: search != null ? {'search': search} : null,
      );
      
      if (response.statusCode == 200) {
        final List data = response.data['mothers'] ?? response.data ?? [];
        _mothers = data.map((m) => Mother.fromJson(m)).toList();
      }
    } catch (e) {
      print('Error fetching mothers: $e');
    }
    
    _isLoadingMothers = false;
    notifyListeners();
  }
  
  Future<Mother?> getMother(String id) async {
    try {
      final response = await _apiService.get('${AppConfig.mothersEndpoint}/$id');
      
      if (response.statusCode == 200) {
        return Mother.fromJson(response.data);
      }
    } catch (e) {
      print('Error fetching mother: $e');
    }
    return null;
  }
  
  Future<bool> createMother(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(AppConfig.mothersEndpoint, data: data);
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchMothers();
        return true;
      }
    } catch (e) {
      print('Error creating mother: $e');
    }
    return false;
  }
  
  // CHILDREN
  Future<void> fetchChildren({String? motherId}) async {
    _isLoadingChildren = true;
    notifyListeners();
    
    try {
      final response = await _apiService.get(
        AppConfig.childrenEndpoint,
        queryParameters: motherId != null ? {'motherId': motherId} : null,
      );
      
      if (response.statusCode == 200) {
        final List data = response.data['children'] ?? response.data ?? [];
        _children = data.map((c) => Child.fromJson(c)).toList();
      }
    } catch (e) {
      print('Error fetching children: $e');
    }
    
    _isLoadingChildren = false;
    notifyListeners();
  }
  
  Future<Child?> getChild(String id) async {
    try {
      final response = await _apiService.get('${AppConfig.childrenEndpoint}/$id');
      
      if (response.statusCode == 200) {
        return Child.fromJson(response.data);
      }
    } catch (e) {
      print('Error fetching child: $e');
    }
    return null;
  }
  
  Future<bool> createChild(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(AppConfig.childrenEndpoint, data: data);
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchChildren();
        return true;
      }
    } catch (e) {
      print('Error creating child: $e');
    }
    return false;
  }
  
  // VACCINES
  Future<void> fetchVaccines() async {
    _isLoadingVaccines = true;
    notifyListeners();
    
    try {
      final response = await _apiService.get(AppConfig.vaccinesEndpoint);
      
      if (response.statusCode == 200) {
        final List data = response.data['vaccines'] ?? response.data ?? [];
        _vaccines = data.map((v) => Vaccine.fromJson(v)).toList();
      }
    } catch (e) {
      print('Error fetching vaccines: $e');
    }
    
    _isLoadingVaccines = false;
    notifyListeners();
  }
  
  // IMMUNIZATION SCHEDULES
  Future<void> fetchSchedules({String? childId, String? status, DateTime? date}) async {
    _isLoadingSchedules = true;
    notifyListeners();
    
    try {
      final queryParams = <String, dynamic>{};
      if (childId != null) queryParams['childId'] = childId;
      if (status != null) queryParams['status'] = status;
      if (date != null) queryParams['date'] = date.toIso8601String().split('T')[0];
      
      final response = await _apiService.get(
        AppConfig.schedulesEndpoint,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );
      
      if (response.statusCode == 200) {
        final List data = response.data['schedules'] ?? response.data ?? [];
        _schedules = data.map((s) => ImmunizationSchedule.fromJson(s)).toList();
      }
    } catch (e) {
      print('Error fetching schedules: $e');
    }
    
    _isLoadingSchedules = false;
    notifyListeners();
  }
  
  Future<List<ImmunizationSchedule>> getTodaySchedules() async {
    await fetchSchedules(date: DateTime.now());
    return _schedules.where((s) => s.isDueToday).toList();
  }
  
  Future<List<ImmunizationSchedule>> getOverdueSchedules() async {
    await fetchSchedules(status: 'OVERDUE');
    return _schedules.where((s) => s.isOverdue).toList();
  }
  
  // RECORD IMMUNIZATION
  Future<bool> recordImmunization({
    required String scheduleId,
    required String batchNumber,
    required String site,
    String? notes,
    String? adverseReaction,
  }) async {
    try {
      final response = await _apiService.post(
        AppConfig.immunizationsEndpoint,
        data: {
          'scheduleId': scheduleId,
          'batchNumber': batchNumber,
          'site': site,
          'notes': notes,
          'adverseReaction': adverseReaction,
          'administeredDate': DateTime.now().toIso8601String(),
        },
      );
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchSchedules();
        return true;
      }
    } catch (e) {
      print('Error recording immunization: $e');
    }
    return false;
  }
  
  // REFRESH ALL DATA
  Future<void> refreshAllData() async {
    await Future.wait([
      fetchMothers(),
      fetchChildren(),
      fetchVaccines(),
      fetchSchedules(),
    ]);
  }
  
  // SEARCH
  List<Mother> searchMothers(String query) {
    if (query.isEmpty) return _mothers;
    final lowerQuery = query.toLowerCase();
    return _mothers.where((m) =>
      m.fullName.toLowerCase().contains(lowerQuery) ||
      m.phone?.contains(query) == true ||
      m.registrationNumber.toLowerCase().contains(lowerQuery)
    ).toList();
  }
  
  List<Child> searchChildren(String query) {
    if (query.isEmpty) return _children;
    final lowerQuery = query.toLowerCase();
    return _children.where((c) =>
      c.fullName.toLowerCase().contains(lowerQuery) ||
      c.registrationNumber.toLowerCase().contains(lowerQuery) ||
      c.motherName?.toLowerCase().contains(lowerQuery) == true
    ).toList();
  }
}
