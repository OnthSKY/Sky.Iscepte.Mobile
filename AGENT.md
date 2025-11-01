Sky.Template.Mobile – Agent Guide

Purpose
- Single source of truth for prompts and contributors. Read this before working on localization, theming, roles/permissions, or modular navigation.

Key Concepts
- Localization: i18next with namespaces, TR/EN, Expo locale default. Hook: `useLocalization`.
- Theming: System light/dark via `useColorScheme`. User pref stored in `useAppStore`.
- Roles & Permissions: Simple role-to-permission map for navigation + detailed per-module permissions from mock data via `permissionsStore`.
- Modular Navigation: Routes are declared with module + optional `requiredPermission`; filtered by role.
- App Config: Runtime config from Expo `extra` controls API base, default locale/theme, and mock/api mode.

Localization
- Libraries: `i18next`, `react-i18next`, `expo-localization`.
- Entry: `src/i18n/index.ts` initializes resources and namespaces.
  - Namespaces: `common`, `login`, `dashboard`, `sales`, `customers`, `reports`, `expenses`, `settings`, `dynamic-fields`.
  - Default language: device locale if available, else `tr`.
- Hook: `src/core/hooks/useLocalization.ts`
  - `t(key, options)` – translate
  - `changeLanguage('tr'|'en')`
  - `language` – current language
- Persisted language: `useAppStore.setLanguage` stores under `AsyncStorage` key `lang` and calls `i18n.changeLanguage`.

Add/Change Translations
1) Add keys in both `src/i18n/locales/en/*.json` and `src/i18n/locales/tr/*.json`.
2) If adding a new namespace, import it in `src/i18n/index.ts`, include in `resources` and add to `ns: []`.
3) Use in components: `const { t } = useTranslation(['namespace']);` or `useLocalization().t('namespace:key')`.
4) To switch language at runtime: `useLocalization().changeLanguage('en')` or via `useAppStore.setLanguage('en')`.

Theming
- System detection: `src/core/hooks/useAppTheme.ts` returns `'light'|'dark'` from `useColorScheme()`.
- User preference: `useAppStore.themePreference` in `src/store/useAppStore.ts` with values `'system'|'light'|'dark'`; stored under `AsyncStorage` key `themePreference`.
- Effective theme strategy:
  - If preference is `system`, use `useAppTheme()`.
  - Otherwise override explicitly from `useAppStore.themePreference`.
- Default theme can be set via Expo `extra.DEFAULT_THEME` read in `src/core/config/appConfig.ts`.

Roles & Permissions
- Simple role map: `src/core/config/permissions.ts`
  - Roles: `'admin'|'manager'|'user'|'guest'`.
  - `permissionsRegistry` lists module permissions.
  - `rolePermissions` maps roles to arrays of permission strings (e.g., `sales:view`).
  - `hasPermission(role, permission)` helper.
- Detailed per-module permissions (actions/fields/notifications): `src/store/permissionsStore.ts`
  - Loads from mocks `src/mocks/{users,roles,packages}.json`.
  - Produces `modulePermissions: Record<string, { actions, fields, notifications }>` filtered by package-allowed modules and merged with user custom permissions.
- Auth + Role persistence: `src/store/useAppStore.ts`
  - Stores `token`, `refreshToken`, and `role` under `AsyncStorage` keys.`
  - `hydrate()` restores language and theme preferences, attempts `silentLogin()` to refresh tokens.
  - `login()` currently mocked (username `admin`, password `1234`) for demo; sets role to `admin`.

Modular Navigation
- Route declarations: `src/core/navigation/routes.ts`
  - Each route has `{ name, module, component, requiredPermission?, options }`.
  - Components are lazy-imported per module.
  - Titles use i18n at declaration time.
- Filtering by role: `filterRoutesByRole(role, hasPermission)` removes routes requiring permissions the role lacks.
- Root navigator: `src/core/navigation/RootNavigator.tsx`
  - Accepts `role` prop, computes permitted routes, renders bottom tabs.
  - Custom tab bar with a center "MENU" opening `FullScreenMenu`.
  - Icons determined by route name.

App Config & Modes
- File: `src/core/config/appConfig.ts`
  - `apiBaseUrl` – from Expo `extra.API_URL`.
  - `defaultLocale` – from `extra.DEFAULT_LOCALE`.
  - `theme` – from `extra.DEFAULT_THEME`.
  - `mode` – `'mock'|'api'` via `extra.APP_MODE`.
- Auth service: `src/shared/services/authService.ts` uses `httpService`; replace TODOs for real API.
- Storage keys: `access_token`, `refresh_token`, `user_role`, `user_id`, `lang`, `themePreference`.

How to Add a New Module
1) Create directory: `src/modules/<moduleName>/` with `screens/`, `services/`, `store/`.
2) Add translations under both `en` and `tr` (new or existing namespace).
3) Register permissions:
   - Add base permissions in `permissionsRegistry` in `src/core/config/permissions.ts`.
   - Update `rolePermissions` if needed.
   - Update mocks in `src/mocks/*` if using detailed permission store.
4) Add routes in `src/core/navigation/routes.ts` with `requiredPermission` for each screen.
5) Use `filterRoutesByRole` automatically via `RootNavigator` – no extra wiring needed.

How to Require a Permission in UI
- Navigation-level: set `requiredPermission` on the route.
- Component-level: use `hasPermission(role, 'module:action')` for conditional rendering, where `role` comes from `useAppStore`.
- For granular checks, consult `usePermissionStore().modulePermissions[module].actions`.

Login / Session Flow (current demo)
- `useAppStore.login(u, p)` – mocked success for `admin`/`1234`; stores tokens and role.
- `useAppStore.silentLogin()` – tries refresh via `authService.refreshToken` using stored `refresh_token`.
- `authService.logout()` – calls API (TODO) and clears storage.

Conventions
- Translation keys: use `namespace:key` consistently.
- Route names: PascalCase, module-aligned (e.g., `Sales`, `SalesDetail`).
- Permission strings: `'<module>:<action>'`.
- Storage keys: stable, lowercase with underscores.

Common Tasks – Cheatsheet
- Switch language: `useAppStore.getState().setLanguage('en')` or `useLocalization().changeLanguage('en')`.
- Switch theme: `useAppStore.getState().setTheme('dark')`.
- Check permission: `hasPermission(useAppStore.getState().role, 'sales:create')`.
- Add route with permission:
  - In `routes.ts`: `{ name: 'MyScreen', module: 'mymodule', component: MyScreen, requiredPermission: 'mymodule:view' }`.

SOLID Screen Architecture
- Pattern: Generic container components + custom hooks for business logic + service adapters
- Core Hooks (`src/core/hooks/`):
  - `useListScreen<T>` – Generic list screen logic (search, filters, pagination, permissions)
  - `useDetailScreen<T>` – Generic detail screen logic (load, edit, delete, permissions)
  - `useFormScreen<T>` – Generic form screen logic (validation, submit, create/edit modes)
  - `usePermissions` – Generic permission checks
  - `useNavigationHandler` – Generic navigation handling
  - `useDashboard` – Dashboard orchestration hook
- Container Components (`src/shared/components/screens/`):
  - `ListScreenContainer<T>` – Generic list UI (search, filters, paginated list, empty state)
  - `DetailScreenContainer<T>` – Generic detail UI (loading, error, edit/delete buttons)
  - `FormScreenContainer<T>` – Generic form UI (validation, submit/cancel buttons)
- Service Layer:
  - `BaseEntityService<T>` interface in `src/core/services/baseEntityService.types.ts`
  - `createBaseServiceAdapter<T>` function adapts existing services to interface
  - Module-specific adapters in `src/modules/{module}/services/{module}ServiceAdapter.ts`
- Screen Structure:
  ```
  List Screen:
    Screen Component (UI composition) → ListScreenContainer → useListScreen → Service Adapter
  
  Detail Screen:
    Screen Component (UI composition) → DetailScreenContainer → useDetailScreen → Service Adapter
  
  Form Screen:
    Screen Component (UI composition) → FormScreenContainer → useFormScreen → Service Adapter
  ```
- Hook Organization:
  - Generic hooks (used by all modules) → `src/core/hooks/` ✅
  - Module-specific hooks (custom logic) → `src/modules/{module}/hooks/` (when needed)
  - Decision: If hook is used by multiple modules or depends on generic interfaces → Core
  - Decision: If hook contains module-specific business logic → Module
- SOLID Principles Applied:
  - Single Responsibility: Each hook/component has one purpose
  - Open/Closed: Extend via composition, not modification
  - Liskov Substitution: Service implementations are interchangeable
  - Interface Segregation: Minimal, focused interfaces
  - Dependency Inversion: Depend on abstractions (BaseEntityService), not concrete implementations

How to Refactor a Screen to SOLID Architecture
1) Create service adapter: `src/modules/{module}/services/{module}ServiceAdapter.ts`
   - Adapt existing service to `BaseEntityService<T>` interface using `createBaseServiceAdapter`
2) Refactor List Screen:
   - Replace custom logic with `ListScreenContainer`
   - Pass service adapter and config
   - Provide `renderItem` and `keyExtractor` props
3) Refactor Detail Screen:
   - Replace custom logic with `DetailScreenContainer`
   - Pass service adapter and config
   - Provide `renderContent` prop for entity-specific UI
4) Refactor Form Screen:
   - Replace custom logic with `FormScreenContainer`
   - Pass service adapter, config, validator, and `renderForm` prop
   - Validator function handles module-specific validation rules

Notes
- Replace mock auth and HTTP with real implementations before production.
- If you introduce a new namespace, ensure it's added to `ns` array during `i18n.init`.
- Keep generic hooks in `src/core/hooks/`, module-specific hooks in `src/modules/{module}/hooks/`.


