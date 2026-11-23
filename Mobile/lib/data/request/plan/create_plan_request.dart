class CreatePlanRequest {
  final int? budget;
  final List<int> activityGroups;
  final PlanFilters filters;
  final bool savePlan;

  CreatePlanRequest({
    this.budget,
    required this.activityGroups,
    required this.filters,
    this.savePlan = false,
  });

  Map<String, dynamic> toJson() {
    return {
      if (budget != null) 'budget': budget,
      'activity_groups': activityGroups,
      'filters': filters.toJson(),
      'save_plan': savePlan,
    };
  }
}

class PlanFilters {
  final String? style;
  final double? distanceKm;
  final double? latitude;
  final double? longitude;

  PlanFilters({
    this.style,
    this.distanceKm,
    this.latitude,
    this.longitude,
  });

  Map<String, dynamic> toJson() {
    return {
      if (style != null) 'style': style,
      if (distanceKm != null) 'distance_km': distanceKm,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
    };
  }
}
