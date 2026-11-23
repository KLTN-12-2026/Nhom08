import 'package:hive_flutter/hive_flutter.dart';

/// Service to manage plan schedules locally using Hive
class PlanScheduleService {
  static const String _boxName = 'plan_schedules';
  Box<String>? _box;

  /// Initialize the Hive box
  Future<void> init() async {
    _box = await Hive.openBox<String>(_boxName);
  }

  /// Get the scheduled date/time for a plan
  DateTime? getScheduledDate(int planId) {
    final dateString = _box?.get('plan_$planId');
    if (dateString == null) return null;
    return DateTime.tryParse(dateString);
  }

  /// Set the scheduled date/time for a plan
  Future<void> setScheduledDate(int planId, DateTime dateTime) async {
    await _box?.put('plan_$planId', dateTime.toIso8601String());
  }

  /// Remove the scheduled date/time for a plan
  Future<void> removeScheduledDate(int planId) async {
    await _box?.delete('plan_$planId');
  }

  /// Get all scheduled plans
  Map<int, DateTime> getAllSchedules() {
    final schedules = <int, DateTime>{};
    final keys = _box?.keys ?? [];

    for (final key in keys) {
      if (key.toString().startsWith('plan_')) {
        final planId = int.tryParse(key.toString().replaceFirst('plan_', ''));
        final dateString = _box?.get(key);

        if (planId != null && dateString != null) {
          final date = DateTime.tryParse(dateString);
          if (date != null) {
            schedules[planId] = date;
          }
        }
      }
    }

    return schedules;
  }
}
