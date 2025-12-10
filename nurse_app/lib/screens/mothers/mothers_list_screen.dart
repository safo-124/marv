import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/data_service.dart';
import 'mother_detail_screen.dart';

class MothersListScreen extends StatefulWidget {
  const MothersListScreen({super.key});

  @override
  State<MothersListScreen> createState() => _MothersListScreenState();
}

class _MothersListScreenState extends State<MothersListScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dataService = context.watch<DataService>();
    final mothers = dataService.searchMothers(_searchQuery);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('Mothers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => dataService.fetchMothers(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              decoration: InputDecoration(
                hintText: 'Search by name, phone, or ID...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchQuery = '';
                          });
                        },
                      )
                    : null,
              ),
            ),
          ),

          // Results
          Expanded(
            child: dataService.isLoadingMothers
                ? const Center(child: CircularProgressIndicator())
                : mothers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.people_outline,
                              size: 64,
                              color: AppTheme.textMuted,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty
                                  ? 'No mothers registered yet'
                                  : 'No results found',
                              style: TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => dataService.fetchMothers(),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: mothers.length,
                          itemBuilder: (context, index) {
                            final mother = mothers[index];
                            return _MotherCard(mother: mother);
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to register mother
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _MotherCard extends StatelessWidget {
  final Mother mother;

  const _MotherCard({required this.mother});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: CircleAvatar(
          radius: 28,
          backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
          child: Text(
            mother.firstName[0].toUpperCase(),
            style: const TextStyle(
              color: AppTheme.primaryColor,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
        ),
        title: Text(
          mother.fullName,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.phone, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(
                  mother.phone ?? 'No phone',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.child_care, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(
                  '${mother.childrenCount} children',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => MotherDetailScreen(motherId: mother.id),
            ),
          );
        },
      ),
    );
  }
}
