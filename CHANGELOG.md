# Changelog

Tüm önemli değişiklikler bu dosyada belgelenecektir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardını takip eder,
ve bu proje [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kullanır.

## [Unreleased]

### Added

- Comprehensive caching improvements with cache manager service
- Image caching service using expo-image
- Form validation improvements with Zod schema-based validation
- Async validation utilities for server-side validation
- Field-level real-time validation support
- API improvements with request cancellation and deduplication
- Request manager service for request lifecycle management
- useRequestCancellation hook for automatic request cancellation
- API versioning configuration
- Enhanced README.md with comprehensive project information
- CONTRIBUTING.md guide for contributors
- CHANGELOG.md for tracking changes

### Changed

- Improved i18n support for validation messages (lazy evaluation)
- Enhanced useFormScreen to support async and schema validation
- Updated cache configuration with size limits and cleanup strategies
- Improved offline-first caching support

### Fixed

- Validation messages now update correctly when language changes
- Cache size limit enforcement
- Request deduplication edge cases

## [0.1.0] - 2025-02-18

### Added

- Initial project setup with Expo
- Core architecture and module structure
- Authentication and authorization system
- Permission-based access control
- Multi-language support (Turkish, English)
- Theme support (Light/Dark mode)
- Form template system
- Product management module
- Sales management module
- Purchase management module
- Customer management module
- Employee management module
- Supplier management module
- Expense management module
- Revenue management module
- Income management module
- Reports module
- Dashboard screens for different user roles
- React Query integration for data fetching
- Zustand for state management
- Secure token storage with Keychain/Keystore
- Offline support with network monitoring
- Error boundary for global error handling
- Sentry integration for error tracking
- Jest and React Native Testing Library setup
- ESLint and Prettier configuration
- Husky and lint-staged for git hooks
- Commitlint for conventional commits
- CI/CD pipeline with GitHub Actions
- Comprehensive documentation structure

### Security

- Secure token storage using react-native-keychain
- Token migration from AsyncStorage to Keychain
- Centralized token management service

### Documentation

- Environment setup guide
- Testing guide
- Form template usage guide
- Permissions list
- API documentation
- Database schema
- Development guides
- Agent guide for AI assistants

---

## Changelog Format

### Types of Changes

- **Added**: Yeni özellikler
- **Changed**: Mevcut özelliklerde değişiklikler
- **Deprecated**: Yakında kaldırılacak özellikler
- **Removed**: Kaldırılan özellikler
- **Fixed**: Bug düzeltmeleri
- **Security**: Güvenlik açıkları ve düzeltmeleri

### Version Format

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): Yeni özellikler (backward compatible)
- **Patch** (0.0.X): Bug düzeltmeleri

### Örnek

```markdown
## [1.2.0] - 2025-02-20

### Added

- New feature X
- New feature Y

### Changed

- Improved performance of feature Z

### Fixed

- Fixed bug in feature A
```

---

**Not**: Bu changelog manuel olarak güncellenir. Her release'de güncel tutulmalıdır.
