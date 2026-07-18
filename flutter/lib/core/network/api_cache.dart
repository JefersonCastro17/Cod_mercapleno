class ApiCache {
  static final ApiCache _instance = ApiCache._internal();

  factory ApiCache() {
    return _instance;
  }

  ApiCache._internal();

  final Map<String, CacheEntry> _cache = <String, CacheEntry>{};

  CacheEntry? get(String key) {
    final entry = _cache[key];
    if (entry != null && !entry.isExpired) {
      return entry;
    }
    _cache.remove(key);
    return null;
  }

  void set(String key, dynamic value,
      {Duration ttl = const Duration(hours: 1)}) {
    _cache[key] = CacheEntry(
      value: value,
      expiresAt: DateTime.now().add(ttl),
    );
  }

  void clear() {
    _cache.clear();
  }

  void clearKey(String key) {
    _cache.remove(key);
  }
}

class CacheEntry {
  CacheEntry({
    required this.value,
    required this.expiresAt,
  });

  final dynamic value;
  final DateTime expiresAt;

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

