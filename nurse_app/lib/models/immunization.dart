import 'child.dart';
import 'vaccine.dart';

enum ImmunizationStatus { scheduled, completed, missed, overdue }

class ImmunizationSchedule {
  final String id;
  final String childId;
  final Child? child;
  final String vaccineId;
  final Vaccine? vaccine;
  final DateTime scheduledDate;
  final DateTime? administeredDate;
  final ImmunizationStatus status;
  final String? batchNumber;
  final String? administeredBy;
  final String? administeredById;
  final String? site; // e.g., "Left arm", "Right thigh"
  final String? notes;
  final String? adverseReaction;
  final DateTime createdAt;
  final DateTime updatedAt;

  ImmunizationSchedule({
    required this.id,
    required this.childId,
    this.child,
    required this.vaccineId,
    this.vaccine,
    required this.scheduledDate,
    this.administeredDate,
    required this.status,
    this.batchNumber,
    this.administeredBy,
    this.administeredById,
    this.site,
    this.notes,
    this.adverseReaction,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isOverdue {
    if (status == ImmunizationStatus.completed) return false;
    return DateTime.now().isAfter(scheduledDate);
  }

  bool get isDueToday {
    final now = DateTime.now();
    return scheduledDate.year == now.year &&
        scheduledDate.month == now.month &&
        scheduledDate.day == now.day &&
        status != ImmunizationStatus.completed;
  }

  bool get isDueSoon {
    if (status == ImmunizationStatus.completed) return false;
    final difference = scheduledDate.difference(DateTime.now()).inDays;
    return difference >= 0 && difference <= 7;
  }

  factory ImmunizationSchedule.fromJson(Map<String, dynamic> json) {
    ImmunizationStatus parseStatus(String? status) {
      switch (status?.toUpperCase()) {
        case 'COMPLETED':
          return ImmunizationStatus.completed;
        case 'MISSED':
          return ImmunizationStatus.missed;
        case 'OVERDUE':
          return ImmunizationStatus.overdue;
        default:
          return ImmunizationStatus.scheduled;
      }
    }

    return ImmunizationSchedule(
      id: json['id'] ?? '',
      childId: json['childId'] ?? '',
      child: json['child'] != null ? Child.fromJson(json['child']) : null,
      vaccineId: json['vaccineId'] ?? '',
      vaccine: json['vaccine'] != null ? Vaccine.fromJson(json['vaccine']) : null,
      scheduledDate: DateTime.parse(json['scheduledDate'] ?? DateTime.now().toIso8601String()),
      administeredDate: json['administeredDate'] != null 
          ? DateTime.parse(json['administeredDate']) 
          : null,
      status: parseStatus(json['status']),
      batchNumber: json['batchNumber'],
      administeredBy: json['administeredBy']?['name'],
      administeredById: json['administeredById'],
      site: json['site'],
      notes: json['notes'],
      adverseReaction: json['adverseReaction'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    String statusToString(ImmunizationStatus status) {
      switch (status) {
        case ImmunizationStatus.completed:
          return 'COMPLETED';
        case ImmunizationStatus.missed:
          return 'MISSED';
        case ImmunizationStatus.overdue:
          return 'OVERDUE';
        default:
          return 'SCHEDULED';
      }
    }

    return {
      'id': id,
      'childId': childId,
      'vaccineId': vaccineId,
      'scheduledDate': scheduledDate.toIso8601String(),
      'administeredDate': administeredDate?.toIso8601String(),
      'status': statusToString(status),
      'batchNumber': batchNumber,
      'administeredById': administeredById,
      'site': site,
      'notes': notes,
      'adverseReaction': adverseReaction,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
