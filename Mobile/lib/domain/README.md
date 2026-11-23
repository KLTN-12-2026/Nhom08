# 🏢 DOMAIN LAYER - Business Logic & Rules

## **🎯 Mục Đích Chính:**

Domain Layer là **"trái tim"** của ứng dụng, chứa:
- **Business Entities**: Các đối tượng nghiệp vụ
- **Business Rules**: Quy tắc nghiệp vụ
- **Use Cases**: Logic nghiệp vụ
- **Repository Interfaces**: Giao diện truy cập dữ liệu

## **🏗️ Cấu Trúc:**

```
lib/domain/
├── entities/           # Business objects
│   ├── user_entity.dart        # User business entity
│   ├── place_entity.dart       # Place business entity
│   └── order_entity.dart       # Order business entity
├── models/             # Data structures
│   ├── auth_result.dart        # Authentication result
│   ├── api_response.dart       # API response wrapper
│   └── pagination.dart         # Pagination data
├── repositories/       # Abstract interfaces
│   ├── auth_repository_interface.dart
│   ├── place_repository_interface.dart
│   └── user_repository_interface.dart
├── usecases/          # Business logic
│   ├── auth/
│   │   └── auth_usecase.dart          # Unified auth operations
│   ├── place/
│   │   └── place_usecase.dart         # Unified place operations
│   └── user/
│       └── user_usecase.dart          # Unified user operations
└── exceptions/         # Business exceptions
    ├── auth_exception.dart
    ├── validation_exception.dart
    └── business_exception.dart
```

## **🔑 Nguyên Tắc Thiết Kế:**

### **1. 🚫 Không Phụ Thuộc External:**
- Không import từ `data/` layer
- Không import từ `presentation/` layer
- Chỉ chứa business logic thuần túy

### **2. ✅ Dependency Inversion:**
- Repository interfaces ở domain
- Implementation ở data layer
- Presentation layer chỉ biết interface

### **3. 🧠 Business Rules:**
- Validation logic
- Business constraints
- Domain-specific calculations

## **📋 Ví Dụ Sử Dụng:**

### **🏢 Business Entity:**
```dart
class User {
  final String id;
  final String email;
  final String name;
  
  // Business rule: Check if user can perform actions
  bool get canPerformActions => isActive;
  
  // Business rule: Check profile completeness
  bool get hasCompleteProfile => 
      email.isNotEmpty && name.isNotEmpty;
}
```

### **🔄 Use Case:**
```dart
class AuthUseCase {
  final AuthRepositoryInterface _authRepository;
  
  // Login with business rules
  Future<AuthResult> login(String email, String password) async {
    // Business rule: Validate email format
    if (!_isValidEmail(email)) {
      throw AuthException.invalidEmail('Invalid email format');
    }
    
    // Business rule: Validate password strength
    if (!_isValidPassword(password)) {
      throw AuthException.weakPassword('Password too weak');
    }
    
    // Perform login
    return await _authRepository.login(email, password);
  }
  
  // Register with business rules
  Future<AuthResult> register(String email, String password, String name) async {
    // Business rules validation...
    return await _authRepository.register(email, password, name);
  }
  
  // Other auth operations...
}
```

### **📋 Repository Interface:**
```dart
abstract class AuthRepositoryInterface {
  Future<AuthResult> login(String email, String password);
  Future<AuthResult> register(String email, String password, String name);
  Future<void> logout();
  Future<User?> getCurrentUser();
}
```

## **🎯 Lợi Ích:**

### **1. 🧪 Easy Testing:**
- Test business logic riêng biệt
- Mock repositories dễ dàng
- Unit tests nhanh và reliable

### **2. 🔄 Technology Independent:**
- Có thể thay đổi UI framework
- Có thể thay đổi database
- Business logic không thay đổi

### **3. 🧠 Business Logic Centralized:**
- Tất cả business rules ở một nơi
- Dễ maintain và update
- Không bị duplicate logic

### **4. 📱 Reusable:**
- Dùng cho mobile app
- Dùng cho web app
- Dùng cho API

## **🚀 Khi Nào Cần Tạo:**

### **✅ CẦN TẠO khi:**
- Có business concept mới
- Có business logic phức tạp
- Cần abstract data access
- Muốn tách biệt business và technology

### **❌ KHÔNG CẦN TẠO khi:**
- UI components
- API implementation
- Database implementation
- Utility functions

## **🔧 Tích Hợp với Clean Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
│  (UI, Bloc, Controllers)                                   │
│  ↓ Depends on Domain                                       │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER                            │
│  (Entities, Use Cases, Repository Interfaces)              │
│  ↓ Depends on Nothing                                      │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                             │
│  (API, Database, Repository Implementation)                │
│  ↓ Implements Domain Interfaces                            │
└─────────────────────────────────────────────────────────────┘
```

## **📚 Best Practices:**

1. **Naming Convention**: Sử dụng suffix `Entity`, `UseCase`, `Interface`
2. **Single Responsibility**: Mỗi class chỉ có một trách nhiệm
3. **Immutable**: Entities nên immutable khi có thể
4. **Validation**: Business rules validation ở UseCase
5. **Error Handling**: Sử dụng custom exceptions cho business errors
6. **Documentation**: Comment rõ ràng cho business logic

## **🎯 Kết Luận:**

Domain Layer là **"trái tim"** của Clean Architecture:
- **Tách biệt** business logic khỏi technology
- **Dễ test** và maintain
- **Reusable** cho nhiều platforms
- **Scalable** khi ứng dụng phát triển

**Hãy luôn nhớ: Domain Layer định nghĩa "CÁI GÌ" ứng dụng làm, không phải "LÀM THẾ NÀO"!**
