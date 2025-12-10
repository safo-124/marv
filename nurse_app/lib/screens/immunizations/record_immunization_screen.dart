import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../services/data_service.dart';

class RecordImmunizationScreen extends StatefulWidget {
  final String? scheduleId;
  final String? childId;

  const RecordImmunizationScreen({
    super.key,
    this.scheduleId,
    this.childId,
  });

  @override
  State<RecordImmunizationScreen> createState() => _RecordImmunizationScreenState();
}

class _RecordImmunizationScreenState extends State<RecordImmunizationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _batchController = TextEditingController();
  final _notesController = TextEditingController();
  
  String? _selectedChildId;
  String? _selectedVaccineId;
  String _selectedSite = 'Left Thigh';
  bool _isLoading = false;
  bool _hasAdverseReaction = false;
  final _reactionController = TextEditingController();

  final List<String> _injectionSites = [
    'Left Thigh',
    'Right Thigh',
    'Left Arm',
    'Right Arm',
    'Oral',
  ];

  @override
  void initState() {
    super.initState();
    _selectedChildId = widget.childId;
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final dataService = context.read<DataService>();
      if (dataService.children.isEmpty) {
        dataService.fetchChildren();
      }
      if (dataService.vaccines.isEmpty) {
        dataService.fetchVaccines();
      }
    });
  }

  @override
  void dispose() {
    _batchController.dispose();
    _notesController.dispose();
    _reactionController.dispose();
    super.dispose();
  }

  Future<void> _recordImmunization() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_selectedChildId == null || _selectedVaccineId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a child and vaccine'),
          backgroundColor: AppTheme.warningColor,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final success = await context.read<DataService>().recordImmunization(
      scheduleId: widget.scheduleId ?? '',
      batchNumber: _batchController.text,
      site: _selectedSite,
      notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      adverseReaction: _hasAdverseReaction ? _reactionController.text : null,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Immunization recorded successfully'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to record immunization'),
            backgroundColor: AppTheme.warningColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dataService = context.watch<DataService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Record Immunization'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Child Selection
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.child_care, color: AppTheme.primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Select Child',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedChildId,
                      decoration: const InputDecoration(
                        hintText: 'Choose a child',
                      ),
                      items: dataService.children
                          .map((child) => DropdownMenuItem(
                                value: child.id,
                                child: Text('${child.fullName} (${child.ageDisplay})'),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedChildId = value;
                        });
                      },
                      validator: (value) {
                        if (value == null) return 'Please select a child';
                        return null;
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Vaccine Selection
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.vaccines, color: AppTheme.primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Vaccine Details',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedVaccineId,
                      decoration: const InputDecoration(
                        hintText: 'Choose a vaccine',
                      ),
                      items: dataService.vaccines
                          .map((vaccine) => DropdownMenuItem(
                                value: vaccine.id,
                                child: Text(vaccine.displayName),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedVaccineId = value;
                        });
                      },
                      validator: (value) {
                        if (value == null) return 'Please select a vaccine';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _batchController,
                      decoration: const InputDecoration(
                        labelText: 'Batch Number',
                        hintText: 'Enter vaccine batch number',
                        prefixIcon: Icon(Icons.qr_code),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Batch number is required';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Injection Site
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.location_on, color: AppTheme.primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Injection Site',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _injectionSites.map((site) {
                        final isSelected = _selectedSite == site;
                        return ChoiceChip(
                          label: Text(site),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedSite = site;
                              });
                            }
                          },
                          selectedColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                          labelStyle: TextStyle(
                            color: isSelected
                                ? AppTheme.primaryColor
                                : AppTheme.textSecondary,
                            fontWeight:
                                isSelected ? FontWeight.w600 : FontWeight.normal,
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Adverse Reaction
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.warning_amber, color: AppTheme.accentColor),
                            const SizedBox(width: 8),
                            Text(
                              'Adverse Reaction',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                          ],
                        ),
                        Switch(
                          value: _hasAdverseReaction,
                          onChanged: (value) {
                            setState(() {
                              _hasAdverseReaction = value;
                            });
                          },
                        ),
                      ],
                    ),
                    if (_hasAdverseReaction) ...[
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _reactionController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          labelText: 'Describe the reaction',
                          hintText: 'Enter details of the adverse reaction',
                        ),
                        validator: (value) {
                          if (_hasAdverseReaction &&
                              (value == null || value.isEmpty)) {
                            return 'Please describe the reaction';
                          }
                          return null;
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Notes
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.notes, color: AppTheme.primaryColor),
                        const SizedBox(width: 8),
                        Text(
                          'Additional Notes',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notesController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Enter any additional notes (optional)',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton(
              onPressed: _isLoading ? null : _recordImmunization,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check),
                        SizedBox(width: 8),
                        Text(
                          'Record Immunization',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
