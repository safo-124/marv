import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/data_service.dart';
import 'child_detail_screen.dart';

class ChildrenListScreen extends StatefulWidget {
  const ChildrenListScreen({super.key});

  @override
  State<ChildrenListScreen> createState() => _ChildrenListScreenState();
}

class _ChildrenListScreenState extends State<ChildrenListScreen> {
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
    final children = dataService.searchChildren(_searchQuery);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('Children'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => dataService.fetchChildren(),
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
                hintText: 'Search by name or ID...',
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
            child: dataService.isLoadingChildren
                ? const Center(child: CircularProgressIndicator())
                : children.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.child_care_outlined,
                              size: 64,
                              color: AppTheme.textMuted,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty
                                  ? 'No children registered yet'
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
                        onRefresh: () => dataService.fetchChildren(),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: children.length,
                          itemBuilder: (context, index) {
                            final child = children[index];
                            return _ChildCard(child: child);
                          },
                        ),
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
        contentPadding: const EdgeInsets.all(12),
        leading: CircleAvatar(
          radius: 28,
          backgroundColor: child.gender == Gender.male
              ? Colors.blue.withValues(alpha: 0.1)
              : Colors.pink.withValues(alpha: 0.1),
          child: Icon(
            child.gender == Gender.male ? Icons.male : Icons.female,
            color: child.gender == Gender.male ? Colors.blue : Colors.pink,
            size: 28,
          ),
        ),
        title: Text(
          child.fullName,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(Icons.cake, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(
                  child.ageDisplay,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
            if (child.motherName != null) ...[
              const SizedBox(height: 2),
              Row(
                children: [
                  Icon(Icons.person, size: 14, color: AppTheme.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    child.motherName!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ],
        ),
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
