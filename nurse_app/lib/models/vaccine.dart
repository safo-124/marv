class Vaccine {
  final String id;
  final String name;
  final String abbreviation;
  final String? description;
  final int doseNumber;
  final int recommendedAgeWeeks;
  final int? maxAgeWeeks;
  final int? minIntervalDays;
  final String? sideEffects;
  final String? contraindications;
  final String? storageRequirements;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  Vaccine({
    required this.id,
    required this.name,
    required this.abbreviation,
    this.description,
    required this.doseNumber,
    required this.recommendedAgeWeeks,
    this.maxAgeWeeks,
    this.minIntervalDays,
    this.sideEffects,
    this.contraindications,
    this.storageRequirements,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  String get displayName => '$name (Dose $doseNumber)';
  
  String get ageRecommendation {
    if (recommendedAgeWeeks < 4) {
      return 'At birth';
    } else if (recommendedAgeWeeks < 8) {
      return '$recommendedAgeWeeks weeks';
    } else {
      final months = (recommendedAgeWeeks / 4).round();
      return '$months months';
    }
  }

  factory Vaccine.fromJson(Map<String, dynamic> json) {
    return Vaccine(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      abbreviation: json['abbreviation'] ?? '',
      description: json['description'],
      doseNumber: json['doseNumber'] ?? 1,
      recommendedAgeWeeks: json['recommendedAgeWeeks'] ?? 0,
      maxAgeWeeks: json['maxAgeWeeks'],
      minIntervalDays: json['minIntervalDays'],
      sideEffects: json['sideEffects'],
      contraindications: json['contraindications'],
      storageRequirements: json['storageRequirements'],
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'abbreviation': abbreviation,
      'description': description,
      'doseNumber': doseNumber,
      'recommendedAgeWeeks': recommendedAgeWeeks,
      'maxAgeWeeks': maxAgeWeeks,
      'minIntervalDays': minIntervalDays,
      'sideEffects': sideEffects,
      'contraindications': contraindications,
      'storageRequirements': storageRequirements,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
