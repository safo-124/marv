enum Gender { male, female }

class Child {
  final String id;
  final String registrationNumber;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final Gender gender;
  final double? birthWeight;
  final double? birthHeight;
  final String? birthPlace;
  final String? specialNeeds;
  final String? allergies;
  final String? medicalNotes;
  final bool isActive;
  final String motherId;
  final String? motherName;
  final DateTime createdAt;
  final DateTime updatedAt;

  Child({
    required this.id,
    required this.registrationNumber,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.gender,
    this.birthWeight,
    this.birthHeight,
    this.birthPlace,
    this.specialNeeds,
    this.allergies,
    this.medicalNotes,
    this.isActive = true,
    required this.motherId,
    this.motherName,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';
  
  String get ageDisplay {
    final now = DateTime.now();
    final difference = now.difference(dateOfBirth);
    
    if (difference.inDays < 30) {
      return '${difference.inDays} days';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''}';
    } else {
      final years = (difference.inDays / 365).floor();
      final remainingMonths = ((difference.inDays % 365) / 30).floor();
      if (remainingMonths > 0) {
        return '$years yr${years > 1 ? 's' : ''} $remainingMonths mo';
      }
      return '$years year${years > 1 ? 's' : ''}';
    }
  }
  
  int get ageInWeeks => (DateTime.now().difference(dateOfBirth).inDays / 7).floor();
  int get ageInMonths => (DateTime.now().difference(dateOfBirth).inDays / 30).floor();

  factory Child.fromJson(Map<String, dynamic> json) {
    return Child(
      id: json['id'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      dateOfBirth: DateTime.parse(json['dateOfBirth'] ?? DateTime.now().toIso8601String()),
      gender: json['gender'] == 'MALE' ? Gender.male : Gender.female,
      birthWeight: json['birthWeight']?.toDouble(),
      birthHeight: json['birthHeight']?.toDouble(),
      birthPlace: json['birthPlace'],
      specialNeeds: json['specialNeeds'],
      allergies: json['allergies'],
      medicalNotes: json['medicalNotes'],
      isActive: json['isActive'] ?? true,
      motherId: json['motherId'] ?? '',
      motherName: json['mother']?['firstName'] != null 
          ? '${json['mother']['firstName']} ${json['mother']['lastName']}'
          : null,
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
      'gender': gender == Gender.male ? 'MALE' : 'FEMALE',
      'birthWeight': birthWeight,
      'birthHeight': birthHeight,
      'birthPlace': birthPlace,
      'specialNeeds': specialNeeds,
      'allergies': allergies,
      'medicalNotes': medicalNotes,
      'isActive': isActive,
      'motherId': motherId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
