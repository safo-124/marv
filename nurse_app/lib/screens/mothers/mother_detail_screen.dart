import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/data_service.dart';
import '../children/child_detail_screen.dart';

class MotherDetailScreen extends StatefulWidget {
  final String motherId;

  const MotherDetailScreen({super.key, required this.motherId});

  @override
  State<MotherDetailScreen> createState() => _MotherDetailScreenState();
}

class _MotherDetailScreenState extends State<MotherDetailScreen> {
  Mother? _mother;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMother();
  }

  Future<void> _loadMother() async {
    setState(() => _isLoading = true);
    final mother = await context.read<DataService>().getMother(widget.motherId);
    if (mounted) {
      setState(() {
        _mother = mother;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(_mother?.fullName ?? 'Mother Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // Navigate to edit mother
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _mother == null
              ? const Center(child: Text('Mother not found'))
              : RefreshIndicator(
                  onRefresh: _loadMother,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          color: AppTheme.primaryColor,
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: Colors.white,
                                child: Text(
                                  _mother!.firstName[0].toUpperCase(),
                                  style: const TextStyle(
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 32,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                _mother!.fullName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'ID: ${_mother!.registrationNumber}',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.8),
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Contact Info
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Contact Information',
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 12),
                              _InfoCard(
                                children: [
                                  _InfoRow(
                                    icon: Icons.phone,
                                    label: 'Phone',
                                    value: _mother!.phone ?? 'Not provided',
                                  ),
                                  _InfoRow(
                                    icon: Icons.email,
                                    label: 'Email',
                                    value: _mother!.email ?? 'Not provided',
                                  ),
                                  _InfoRow(
                                    icon: Icons.location_on,
                                    label: 'Address',
                                    value: _mother!.address,
                                  ),
                                  _InfoRow(
                                    icon: Icons.map,
                                    label: 'District',
                                    value: _mother!.district,
                                  ),
                                ],
                              ),

                              const SizedBox(height: 24),
                              Text(
                                'Medical Information',
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 12),
                              _InfoCard(
                                children: [
                                  _InfoRow(
                                    icon: Icons.cake,
                                    label: 'Date of Birth',
                                    value: DateFormat.yMMMd().format(_mother!.dateOfBirth),
                                  ),
                                  _InfoRow(
                                    icon: Icons.bloodtype,
                                    label: 'Blood Type',
                                    value: _mother!.bloodType,
                                  ),
                                  if (_mother!.allergies != null)
                                    _InfoRow(
                                      icon: Icons.warning,
                                      label: 'Allergies',
                                      value: _mother!.allergies!,
                                    ),
                                ],
                              ),

                              const SizedBox(height: 24),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Children (${_mother!.children.length})',
                                    style: Theme.of(context).textTheme.headlineSmall,
                                  ),
                                  TextButton.icon(
                                    onPressed: () {
                                      // Add child
                                    },
                                    icon: const Icon(Icons.add),
                                    label: const Text('Add Child'),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              if (_mother!.children.isEmpty)
                                Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(24),
                                    child: Center(
                                      child: Column(
                                        children: [
                                          Icon(
                                            Icons.child_care,
                                            size: 48,
                                            color: AppTheme.textMuted,
                                          ),
                                          const SizedBox(height: 12),
                                          Text(
                                            'No children registered',
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
                                ...(_mother!.children.map((child) => _ChildCard(child: child))),
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

class _InfoCard extends StatelessWidget {
  final List<Widget> children;

  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: children,
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

class _ChildCard extends StatelessWidget {
  final Child child;

  const _ChildCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: child.gender == Gender.male
              ? Colors.blue.withValues(alpha: 0.1)
              : Colors.pink.withValues(alpha: 0.1),
          child: Icon(
            child.gender == Gender.male ? Icons.male : Icons.female,
            color: child.gender == Gender.male ? Colors.blue : Colors.pink,
          ),
        ),
        title: Text(child.fullName),
        subtitle: Text(child.ageDisplay),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ChildDetailScreen(childId: child.id),
            ),
          );
        },
      ),
    );
  }
}
