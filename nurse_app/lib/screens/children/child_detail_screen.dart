import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/data_service.dart';
import '../immunizations/record_immunization_screen.dart';

class ChildDetailScreen extends StatefulWidget {
  final String childId;

  const ChildDetailScreen({super.key, required this.childId});

  @override
  State<ChildDetailScreen> createState() => _ChildDetailScreenState();
}

class _ChildDetailScreenState extends State<ChildDetailScreen> {
  Child? _child;
  List<ImmunizationSchedule> _schedules = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final dataService = context.read<DataService>();
    final child = await dataService.getChild(widget.childId);
    await dataService.fetchSchedules(childId: widget.childId);
    
    if (mounted) {
      setState(() {
        _child = child;
        _schedules = dataService.schedules;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(_child?.fullName ?? 'Child Details'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _child == null
              ? const Center(child: Text('Child not found'))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: _child!.gender == Gender.male
                                  ? [Colors.blue.shade400, Colors.blue.shade700]
                                  : [Colors.pink.shade400, Colors.pink.shade700],
                            ),
                          ),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: Colors.white,
                                child: Icon(
                                  _child!.gender == Gender.male
                                      ? Icons.male
                                      : Icons.female,
                                  size: 40,
                                  color: _child!.gender == Gender.male
                                      ? Colors.blue
                                      : Colors.pink,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                _child!.fullName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _child!.ageDisplay,
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.9),
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'ID: ${_child!.registrationNumber}',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Details
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Birth Information',
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 12),
                              Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    children: [
                                      _InfoRow(
                                        icon: Icons.cake,
                                        label: 'Date of Birth',
                                        value: DateFormat.yMMMd().format(_child!.dateOfBirth),
                                      ),
                                      _InfoRow(
                                        icon: Icons.monitor_weight,
                                        label: 'Birth Weight',
                                        value: _child!.birthWeight != null
                                            ? '${_child!.birthWeight} kg'
                                            : 'Not recorded',
                                      ),
                                      _InfoRow(
                                        icon: Icons.height,
                                        label: 'Birth Height',
                                        value: _child!.birthHeight != null
                                            ? '${_child!.birthHeight} cm'
                                            : 'Not recorded',
                                      ),
                                      _InfoRow(
                                        icon: Icons.local_hospital,
                                        label: 'Birth Place',
                                        value: _child!.birthPlace ?? 'Not recorded',
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                              const SizedBox(height: 24),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Immunization Schedule',
                                    style: Theme.of(context).textTheme.headlineSmall,
                                  ),
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => RecordImmunizationScreen(
                                            childId: _child!.id,
                                          ),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.add, size: 18),
                                    label: const Text('Record'),
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 8,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              if (_schedules.isEmpty)
                                Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(24),
                                    child: Center(
                                      child: Column(
                                        children: [
                                          Icon(
                                            Icons.vaccines,
                                            size: 48,
                                            color: AppTheme.textMuted,
                                          ),
                                          const SizedBox(height: 12),
                                          Text(
                                            'No immunizations scheduled',
                                            style: TextStyle(
                                              color: AppTheme.textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              else
                                ...(_schedules.map((s) => _ImmunizationCard(schedule: s))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.textMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ImmunizationCard extends StatelessWidget {
  final ImmunizationSchedule schedule;

  const _ImmunizationCard({required this.schedule});

  Color get _statusColor {
    switch (schedule.status) {
      case ImmunizationStatus.completed:
        return AppTheme.successColor;
      case ImmunizationStatus.overdue:
        return AppTheme.warningColor;
      case ImmunizationStatus.missed:
        return AppTheme.warningColor;
      default:
        return AppTheme.primaryColor;
    }
  }

  IconData get _statusIcon {
    switch (schedule.status) {
      case ImmunizationStatus.completed:
        return Icons.check_circle;
      case ImmunizationStatus.overdue:
        return Icons.warning;
      case ImmunizationStatus.missed:
        return Icons.cancel;
      default:
        return Icons.schedule;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: _statusColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(_statusIcon, color: _statusColor),
        ),
        title: Text(
          schedule.vaccine?.displayName ?? 'Vaccine',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        subtitle: Text(
          DateFormat.yMMMd().format(schedule.scheduledDate),
          style: Theme.of(context).textTheme.bodySmall,
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: _statusColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            schedule.status.name.toUpperCase(),
            style: TextStyle(
              color: _statusColor,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}
