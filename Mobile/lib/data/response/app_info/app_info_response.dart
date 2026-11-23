class AppInfoResponse {
  bool? success;
  String? message;
  DataAppInfo? data;

  AppInfoResponse({this.success, this.message, this.data});

  AppInfoResponse.fromJson(Map<String, dynamic> json) {
    success = json['success'];
    message = json['message'];
    data = json['data'] != null ? new DataAppInfo.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['success'] = this.success;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class DataAppInfo {
  String? name;
  String? version;
  String? environment;
  bool? debug;
  String? phpVersion;
  String? laravelVersion;

  DataAppInfo(
      {this.name,
      this.version,
      this.environment,
      this.debug,
      this.phpVersion,
      this.laravelVersion});

  DataAppInfo.fromJson(Map<String, dynamic> json) {
    name = json['name'];
    version = json['version'];
    environment = json['environment'];
    debug = json['debug'];
    phpVersion = json['php_version'];
    laravelVersion = json['laravel_version'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['name'] = this.name;
    data['version'] = this.version;
    data['environment'] = this.environment;
    data['debug'] = this.debug;
    data['php_version'] = this.phpVersion;
    data['laravel_version'] = this.laravelVersion;
    return data;
  }
}
