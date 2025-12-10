import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/data_service.dart';
import '../immunizations/record_immunization_screen.dart';

class SchedulesScreen extends StatefulWidget {
  const SchedulesScreen({super.key});

  @override
  State<SchedulesScreen> createState() => _SchedulesScreenState();
}

class _SchedulesScreenState extends State<SchedulesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('Schedules'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Today'),
            Tab(text: 'Upcoming'),
            Tab(text: 'Overdue'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ScheduleList(filter: ScheduleFilter.today),
          _ScheduleList(filter: ScheduleFilter.upcoming),
          _ScheduleList(filter: ScheduleFilter.overdue),
        ],
      ),
    );
  }
}

enum ScheduleFilter { today, upcoming, overdue }

class _ScheduleList extends StatelessWidget {
  final ScheduleFilter filter;

  const _ScheduleList({required this.filter});

  @override
  Widget build(BuildContext context) {
    final dataService = context.watch<DataService>();
    
    List<ImmunizationSchedule> schedules;
    switch (filter) {
      case ScheduleFilter.today:
        schedules = dataService.schedules.where((s) => s.isDueToday).toList();
        break;
      case ScheduleFilter.upcoming:
        schedules = dataService.schedules
            .where((s) => s.isDueSoon && !s.isDueToday)
            .toList();
        break;
      case ScheduleFilter.overdue:
        schedules = dataService.schedules.where((s) => s.isOverdue).toList();
        break;
    }

    if (dataService.isLoadingSchedules) {
      return const Center(child: CircularProgressIndicator());
    }

    if (schedules.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _getEmptyIcon(),
              size: 64,
              color: AppTheme.textMuted,
            ),
            const SizedBox(height: 16),
            Text(
              _getEmptyMessage(),
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => dataService.fetchSchedules(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: schedules.length,
        itemBuilder: (context, index) {
          final schedule = schedules[index];
          return _ScheduleCard(schedule: schedule);
        },
      ),
    );
  }

  IconData _getEmptyIcon() {
    switch (filter) {
      case ScheduleFilter.today:
        return Icons.event_available;
      case ScheduleFilter.upcoming:
        return Icons.calendar_month;
      case ScheduleFilter.overdue:
        return Icons.check_circle;
    }
  }

  String _getEmptyMessage() {
    switch (filter) {
      case ScheduleFilter.today:
        return 'No appointments for today';
      case ScheduleFilter.upcoming:
        return 'No upcoming appointments';
      case ScheduleFilter.overdue:
        return 'No overdue appointments - Great!';
    }
  }
}

class _ScheduleCard extends StatelessWidget {
  final ImmunizationSchedule schedule;

  const _ScheduleCard({required this.schedule});

  Color get _statusColor {
    if (schedule.isOverdue) return AppTheme.warningColor;
    if (schedule.isDueToday) return AppTheme.primaryColor;
    return AppTheme.secondaryColor;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.vaccines,
                    color: _statusColor,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        schedule.child?.fullName ?? 'Child',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        schedule.vaccine?.displayName ?? 'Vaccine',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    schedule.isOverdue
                        ? 'OVERDUE'
                        : schedule.isDueToday
                            ? 'TODAY'
                            : 'UPCOMING',
                    style: TextStyle(
                      color: _statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 16,
                      color: AppTheme.textMuted,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      DateFormat.yMMMd().format(schedule.scheduledDate),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RecordImmunizationScreen(
                          scheduleId: schedule.id,
                          childId: schedule.childId,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                  child: const Text('Record'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
