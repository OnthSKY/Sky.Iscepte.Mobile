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
1) Create directory: `src/modules/<moduleName>/` with `screens/`, `services/`, `hooks/`, `config/`, `store/`.
2) Add translations under both `en` and `tr` (new or existing namespace).
3) Register permissions:
   - Add base permissions in `permissionsRegistry` in `src/core/config/permissions.ts`.
   - Update `rolePermissions` if needed.
   - Update mocks in `src/mocks/*` if using detailed permission store.
4) Create service: `src/modules/{module}/services/{module}Service.ts`
   - Export entity interface (e.g., `Product`, `Customer`)
   - Export stats interface (e.g., `ProductStats`, `CustomerStats`)
   - Implement `list`, `get`, `stats`, `create`, `update`, `remove` methods
5) Create query hooks: `src/modules/{module}/hooks/use{Module}Query.ts`
   - Export `use{Module}sQuery()`, `use{Module}Query(id)`, `use{Module}StatsQuery()`
   - Export `use{Module}sInfiniteQuery()` for pagination
   - Export mutation hooks: `useCreate{Module}Mutation()`, `useUpdate{Module}Mutation()`, `useDelete{Module}Mutation()`
   - Use `queryKeys` factory from `src/core/services/queryClient.ts`
6) Create form config: `src/modules/{module}/config/{module}FormConfig.ts`
   - Define `{module}FormFields` (DynamicField[])
   - Define `{module}Validator` function using validators from `validators.ts`
7) Create screens:
   - `{Module}ListScreen.tsx` – Uses `use{Module}sQuery()` or `use{Module}sInfiniteQuery()`
   - `{Module}DetailScreen.tsx` – Uses `use{Module}Query(id)`
   - `{Module}DashboardScreen.tsx` – Uses `use{Module}StatsQuery()` with React Query
   - `{Module}FormScreen.tsx` – Unified form for create/edit, uses mutation hooks
   - `{Module}CreateScreen.tsx` and `{Module}EditScreen.tsx` – Wrappers passing `mode` prop
8) Add routes in `src/core/navigation/routes.ts` with `requiredPermission` for each screen.
9) Update `queryKeys` factory in `src/core/services/queryClient.ts` with new module keys.
10) Use `filterRoutesByRole` automatically via `RootNavigator` – no extra wiring needed.

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
  - `useAsyncData<T>` – Generic async data fetching with loading/error state management (legacy, prefer React Query hooks) ⚠️
  - `useApiQuery<T>` – React Query wrapper for queries (caching, retry, prefetch) ⭐
  - `useApiMutation<T>` – React Query wrapper for mutations (optimistic updates, cache invalidation) ⭐
  - `useApiInfiniteQuery<T>` – React Query wrapper for pagination (infinite scroll) ⭐
  - `useDashboardPrefetch` – Prefetches module dashboard stats ⭐
  - `useNavigationPrefetch` – Prefetches data on navigation ⭐
  - `useDetailPrefetch` – Prefetches detail pages from lists ⭐
  - `useAuth` – Authentication hooks (`useLogin`, `useRegister`)
  - `useOwnerDashboard` – Owner dashboard specific logic
  - `useDashboard` – Dashboard orchestration hook
  - `useDashboardData` – Dashboard data fetching hook
  - `usePermissions` – Generic permission checks
  - `useNavigationHandler` – Generic navigation handling
- Container Components (`src/shared/components/screens/`):
  - `ListScreenContainer<T>` – Generic list UI (search, filters, paginated list, empty state)
  - `DetailScreenContainer<T>` – Generic detail UI (loading, error, edit/delete buttons)
  - `FormScreenContainer<T>` – Generic form UI (validation, submit/cancel buttons)
- UI Components (`src/shared/components/`):
  - `LoadingState` – Reusable loading indicator with message ⭐
  - `ErrorState` – Reusable error display with retry option ⭐
- Service Layer:
  - `BaseEntityService<T>` interface in `src/core/services/baseEntityService.types.ts`
  - `createBaseServiceAdapter<T>` function adapts existing services to interface
  - Module-specific adapters in `src/modules/{module}/services/{module}ServiceAdapter.ts`
- Utilities (`src/core/utils/`):
  - `validators.ts` – Common validation functions (required, minLength, maxLength, isEmail, isNumber, isPositive, range, isPhone, isUrl, combine) ⭐
  - `errorUtils.ts` – Standardized error message utilities (getErrorMessage, errorMessages, createError, getErrorCode) ⭐
  - `retryUtils.ts` – Smart retry strategies with exponential backoff and jitter ⭐
  - `screenFactory.tsx` – Factory functions for creating list, detail, and form screens ⭐
- Configuration (`src/core/config/`):
  - `navigationConfig.ts` – Navigation fallback routes configuration ⭐
  - `permissions.ts` – Permission registry and role mappings
- Screen Structure:
  ```
  List Screen:
    Screen Component (UI composition) → ListScreenContainer → useListScreen → Service Adapter
  
  Detail Screen:
    Screen Component (UI composition) → DetailScreenContainer → useDetailScreen → useApiQuery / use{Module}Query → Service Adapter
  
  Form Screen:
    Screen Component (UI composition) → FormScreenContainer → useFormScreen → useApiMutation / use{Module}Mutation → Service Adapter
  ```
- Hook Organization:
  - Generic hooks (used by all modules) → `src/core/hooks/` ✅
  - Module-specific hooks (custom logic) → `src/modules/{module}/hooks/` (when needed)
  - Decision: If hook is used by multiple modules or depends on generic interfaces → Core
  - Decision: If hook contains module-specific business logic → Module
- Form Configuration Pattern:
  - Each module has `src/modules/{module}/config/{module}FormConfig.ts` ⭐
  - Contains: `{module}FormFields` (DynamicField[]) and `{module}Validator` function
  - Centralizes form field definitions and validation logic
  - Used by unified `{Module}FormScreen` component (Create/Edit merged)
- Unified Form Screens:
  - Single `{Module}FormScreen` component handles both create and edit modes ⭐
  - `{Module}CreateScreen` and `{Module}EditScreen` are simple wrappers passing `mode` prop
  - Reduces code duplication by ~60%

React Query & API Performance (NEW - Priority Pattern!) ⭐
- **Library**: `@tanstack/react-query` for data fetching, caching, and synchronization
- **Core Services** (`src/core/services/`):
  - `queryClient.ts` – QueryClient configuration with smart retry and persistence
  - `cacheConfig.ts` – Cache persistence configuration (critical vs non-critical queries)
  - `cacheUtils.ts` – Cache management utilities (invalidation, cleanup, prefetch)
  - `retryUtils.ts` – Smart retry strategies with exponential backoff and jitter
- **Query Hooks** (`src/core/hooks/`):
  - `useApiQuery<T>` – Type-safe query hook with automatic caching, retry, error handling
  - `useApiMutation<T>` – Type-safe mutation hook with optimistic updates, cache invalidation
  - `useApiInfiniteQuery<T>` – Infinite query for pagination with flattened `allItems`
- **Module Hooks** (`src/modules/{module}/hooks/`):
  - `use{Module}sQuery()` – Module list query hook (with filters support)
  - `use{Module}Query(id)` – Single entity query hook
  - `use{Module}StatsQuery()` – Module statistics query hook
  - `use{Module}sInfiniteQuery()` – Infinite query for pagination
  - `useCreate{Module}Mutation()` – Create mutation hook with cache invalidation
  - `useUpdate{Module}Mutation(id?)` – Update mutation hook with optimistic updates
  - `useDelete{Module}Mutation()` – Delete mutation hook with optimistic updates
  - Uses `queryKeys` factory for type-safe cache keys
- **Query Keys** (`src/core/services/queryClient.ts`):
  - Centralized `queryKeys` factory for type-safe cache management
  - Structure: `queryKeys.{module}.{operation}(params)`
  - Example: `queryKeys.products.stats()`, `queryKeys.products.detail(id)`
- **Cache Persistence**:
  - Critical queries persisted (auth, user, permissions, settings, stats)
  - Non-critical queries memory-only (lists, details)
  - AsyncStorage persistence with 24h maxAge
- **Retry Logic**:
  - Smart retry based on error type (network, server, timeout)
  - Exponential backoff with jitter (prevents retry storms)
  - Configurable retry strategies per operation type
- **Prefetching**:
  - `useDashboardPrefetch` – Prefetches all module stats on dashboard load
  - `useNavigationPrefetch` – Prefetches data on route changes
  - `useDetailPrefetch` – Prefetches detail pages from list items
- **Migration Pattern**:
  - Replace `useAsyncData` with `useApiQuery` for queries
  - Replace manual mutations with `useApiMutation`
  - Use module-specific hooks from `src/modules/{module}/hooks/use{Module}Query.ts`
  - Example: `useProductsQuery()`, `useProductQuery(id)`, `useProductStatsQuery()`, `useCreateProductMutation()`
- **Module Hooks Pattern** (All modules now use this):
  - Products: `src/modules/products/hooks/useProductsQuery.ts` ✅
  - Sales: `src/modules/sales/hooks/useSalesQuery.ts` ✅
  - Customers: `src/modules/customers/hooks/useCustomersQuery.ts` ✅
  - Expenses: `src/modules/expenses/hooks/useExpensesQuery.ts` ✅
  - Employees: `src/modules/employees/hooks/useEmployeesQuery.ts` ✅
  - Reports: `src/modules/reports/hooks/useReportsQuery.ts` ✅

Best Practices & Guidelines (IMPORTANT - Follow These Patterns!)
- **ALWAYS use React Query hooks (`useApiQuery`, `useApiMutation`) for data fetching** ⭐ – Provides caching, retry, prefetch automatically
- **ALWAYS use module-specific hooks** ⭐ – `useProductsQuery()`, `useSalesQuery()`, etc. from `src/modules/{module}/hooks/`
- **NEVER use `useAsyncData` for new code** ⚠️ – Use React Query hooks instead (migrate existing code gradually)
- **Always use `errorUtils` for standardized error messages** – Eliminates hardcoded error strings
- **Always use `LoadingState` and `ErrorState` components** – Eliminates duplicate loading/error UI
- **Always create form config file for new modules** – Centralizes form definitions
- **Always use unified FormScreen pattern** – Create/Edit merged, reduces duplication by 60%
- **Always use `validators.ts` utilities** – Don't write custom validation logic
- **Always use `navigationConfig.ts` for navigation fallbacks** – Don't hardcode fallback maps
- Keep error handling consistent: Use `errorMessages` factory functions or `getErrorMessage` utility
- Keep async patterns consistent: Use React Query hooks for all API operations
- When adding new validators, add them to `validators.ts` and use i18n for error messages
- When adding new error patterns, add them to `errorUtils.ts` with proper translation keys
- When adding new navigation routes, update `navigationConfig.ts` fallback map if needed
- When adding new modules, create `use{Module}Query.ts` hooks file with query/mutation hooks

How to Refactor a Screen to SOLID Architecture
1) Create service adapter: `src/modules/{module}/services/{module}ServiceAdapter.ts`
   - Adapt existing service to `BaseEntityService<T>` interface using `createBaseServiceAdapter`
2) Create form config: `src/modules/{module}/config/{module}FormConfig.ts`
   - Define `{module}FormFields` (DynamicField[]) for form fields
   - Define `{module}Validator` function using validators from `validators.ts`
3) Refactor List Screen:
   - Replace custom logic with `ListScreenContainer`
   - Pass service adapter and config
   - Provide `renderItem` and `keyExtractor` props
4) Refactor Detail Screen:
   - Replace custom logic with `DetailScreenContainer`
   - Pass service adapter and config
   - Provide `renderContent` prop for entity-specific UI
   - Uses React Query hooks (`useApiQuery` or module-specific hook) internally for data fetching ⭐
5) Refactor Form Screen:
   - Create unified `{Module}FormScreen` component
   - Replace custom logic with `FormScreenContainer`
   - Pass service adapter, config, validator (from form config), and `renderForm` prop
   - Use `DynamicForm` with fields from form config
   - Use React Query mutations (`useApiMutation` or module-specific mutation hook) for submit ⭐
   - `{Module}CreateScreen` and `{Module}EditScreen` become simple wrappers passing `mode` prop
6) Create Module Query Hooks:
   - Create `src/modules/{module}/hooks/use{Module}Query.ts`
   - Export query hooks: `use{Module}sQuery()`, `use{Module}Query(id)`, `use{Module}StatsQuery()`
   - Export mutation hooks: `useCreate{Module}Mutation()`, `useUpdate{Module}Mutation()`, `useDelete{Module}Mutation()`
   - Use `queryKeys` factory for cache keys
   - Example: See `src/modules/products/hooks/useProductsQuery.ts` ⭐

Notes
- Replace mock auth and HTTP with real implementations before production.
- If you introduce a new namespace, ensure it's added to `ns` array during `i18n.init`.
- Keep generic hooks in `src/core/hooks/`, module-specific hooks in `src/modules/{module}/hooks/`.
- ⭐ marks recently added/refactored patterns - use these as reference for new development.
- ⚠️ marks deprecated patterns - migrate to new React Query pattern when possible.
- React Query is the preferred pattern for all API operations - provides caching, retry, prefetch automatically.
- Module-specific hooks provide type-safe, optimized API access with automatic cache management.


