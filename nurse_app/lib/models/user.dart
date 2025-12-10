class User {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? phone;
  final String? avatarUrl;
  final String hospitalId;
  final String hospitalName;
  final bool isActive;
  final DateTime? lastLoginAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.avatarUrl,
    required this.hospitalId,
    required this.hospitalName,
    this.isActive = true,
    this.lastLoginAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'HEALTH_WORKER',
      phone: json['phone'],
      avatarUrl: json['avatarUrl'],
      hospitalId: json['hospitalId'] ?? json['hospital']?['id'] ?? '',
      hospitalName: json['hospitalName'] ?? json['hospital']?['name'] ?? '',
      isActive: json['isActive'] ?? true,
      lastLoginAt: json['lastLoginAt'] != null 
          ? DateTime.parse(json['lastLoginAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'hospitalId': hospitalId,
      'hospitalName': hospitalName,
      'isActive': isActive,
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }
}
