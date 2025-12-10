import 'child.dart';

class Mother {
  final String id;
  final String registrationNumber;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final String? phone;
  final String? alternativePhone;
  final String? email;
  final String? nationalId;
  final String address;
  final String? village;
  final String? parish;
  final String? subCounty;
  final String district;
  final String? nearestLandmark;
  final String? gpsCoordinates;
  final String bloodType;
  final String? allergies;
  final String? medicalNotes;
  final String? preferredLanguage;
  final bool smsConsent;
  final bool isActive;
  final DateTime? deliveryDate;
  final List<Child> children;
  final DateTime createdAt;
  final DateTime updatedAt;

  Mother({
    required this.id,
    required this.registrationNumber,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    this.phone,
    this.alternativePhone,
    this.email,
    this.nationalId,
    required this.address,
    this.village,
    this.parish,
    this.subCounty,
    required this.district,
    this.nearestLandmark,
    this.gpsCoordinates,
    required this.bloodType,
    this.allergies,
    this.medicalNotes,
    this.preferredLanguage,
    this.smsConsent = false,
    this.isActive = true,
    this.deliveryDate,
    this.children = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';
  
  int get age {
    final now = DateTime.now();
    int age = now.year - dateOfBirth.year;
    if (now.month < dateOfBirth.month ||
        (now.month == dateOfBirth.month && now.day < dateOfBirth.day)) {
      age--;
    }
    return age;
  }

  int get childrenCount => children.length;

  factory Mother.fromJson(Map<String, dynamic> json) {
    return Mother(
      id: json['id'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      dateOfBirth: DateTime.parse(json['dateOfBirth'] ?? DateTime.now().toIso8601String()),
      phone: json['phone'],
      alternativePhone: json['alternativePhone'],
      email: json['email'],
      nationalId: json['nationalId'],
      address: json['address'] ?? '',
      village: json['village'],
      parish: json['parish'],
      subCounty: json['subCounty'],
      district: json['district'] ?? '',
      nearestLandmark: json['nearestLandmark'],
      gpsCoordinates: json['gpsCoordinates'],
      bloodType: json['bloodType'] ?? 'Unknown',
      allergies: json['allergies'],
      medicalNotes: json['medicalNotes'],
      preferredLanguage: json['preferredLanguage'],
      smsConsent: json['smsConsent'] ?? false,
      isActive: json['isActive'] ?? true,
      deliveryDate: json['deliveryDate'] != null 
          ? DateTime.parse(json['deliveryDate']) 
          : null,
      children: json['children'] != null
          ? (json['children'] as List).map((c) => Child.fromJson(c)).toList()
          : [],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registrationNumber': registrationNumber,
      'firstName': firstName,
      'lastName': lastName,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'phone': phone,
      'alternativePhone': alternativePhone,
      'email': email,
      'nationalId': nationalId,
      'address': address,
      'village': village,
      'parish': parish,
      'subCounty': subCounty,
      'district': district,
      'nearestLandmark': nearestLandmark,
      'gpsCoordinates': gpsCoordinates,
      'bloodType': bloodType,
      'allergies': allergies,
      'medicalNotes': medicalNotes,
      'preferredLanguage': preferredLanguage,
      'smsConsent': smsConsent,
      'isActive': isActive,
      'deliveryDate': deliveryDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
