/// Enum options response
class EnumOptionsResponse {
  final Map<String, List<Map<String, String>>> options;

  const EnumOptionsResponse({required this.options});

  factory EnumOptionsResponse.fromJson(Map<String, dynamic> json) {
    final optionsMap = <String, List<Map<String, String>>>{};

    json.forEach((key, value) {
      if (value is List) {
        optionsMap[key] =
            value.map((item) => Map<String, String>.from(item)).toList();
      }
    });

    return EnumOptionsResponse(options: optionsMap);
  }

  Map<String, dynamic> toJson() {
    return {
      'options': options,
    };
  }
}
