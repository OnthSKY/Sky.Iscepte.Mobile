# Form Validation İyileştirmeleri Kılavuzu

**Oluşturulma Tarihi:** 2025-02-18

Bu dokümantasyon, projede yapılan form validation iyileştirmelerini ve kullanımını açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Zod Schema-Based Validation](#zod-schema-based-validation)
3. [Async Validation](#async-validation)
4. [Field-Level Validation](#field-level-validation)
5. [Kullanım Örnekleri](#kullanım-örnekleri)
6. [Best Practices](#best-practices)

---

## 🎯 Genel Bakış

Form validation iyileştirmeleri şunları içerir:

- ✅ **Zod Schema-Based Validation** - Type-safe schema-based validation
- ✅ **Async Validation** - Server-side validation desteği
- ✅ **Field-Level Validation** - Real-time field validation
- ✅ **Validation Schema Builder** - Schema builder utilities
- ✅ **Enhanced useFormScreen** - Async ve schema validation desteği

---

## 📐 Zod Schema-Based Validation

### Genel Bakış

Zod, TypeScript-first schema validation library'sidir. Type-safe validation sağlar.

**Dosya:** `src/core/utils/validationSchema.ts`

### Özellikler

- Type-safe validation
- Schema builder utilities
- Common validation schemas
- Field-level schema creation

### Kullanım

#### Basic Schema

```tsx
import { z } from 'zod';
import { validateSchema } from '@/core/utils/validationSchema';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().min(18).max(100),
});

const result = validateSchema(userSchema, {
  email: 'test@example.com',
  name: 'John',
  age: 25,
});

if (result.isValid) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

#### Common Validation Schemas

```tsx
import { validationSchemas } from '@/core/utils/validationSchema';

const schema = z.object({
  email: validationSchemas.email(),
  phone: validationSchemas.phone(),
  url: validationSchemas.url(),
  positiveNumber: validationSchemas.positiveNumber(),
  stringLength: validationSchemas.stringLength(2, 50),
  numberRange: validationSchemas.numberRange(0, 100),
});
```

#### Field Schema Creation

```tsx
import { createFieldSchema } from '@/core/utils/validationSchema';

const emailSchema = createFieldSchema(
  {
    name: 'email',
    type: 'email',
    required: true,
  },
  'users'
);

const result = emailSchema.parse('test@example.com');
```

#### Form Schema Creation

```tsx
import { createFormSchema } from '@/core/utils/validationSchema';

const formSchema = createFormSchema(
  [
    { name: 'email', type: 'email', required: true },
    { name: 'name', type: 'text', required: true, minLength: 2 },
    { name: 'age', type: 'number', required: true, min: 18, max: 100 },
  ],
  'users'
);

const result = formSchema.parse({
  email: 'test@example.com',
  name: 'John',
  age: 25,
});
```

---

## 🔄 Async Validation

### Genel Bakış

Async validation, server-side validation için kullanılır.

**Dosya:** `src/core/utils/asyncValidators.ts`

### Özellikler

- Async field validation
- Server-side validation support
- Debounced validation
- Validation caching

### Kullanım

#### Async Zod Validator

```tsx
import { createAsyncZodValidator } from '@/core/utils/asyncValidators';
import { z } from 'zod';

const emailSchema = z.string().email();
const validateEmail = createAsyncZodValidator(emailSchema);

const result = await validateEmail('test@example.com');
// { isValid: true } or { isValid: false, error: 'Invalid email' }
```

#### Async API Validator

```tsx
import { createAsyncApiValidator } from '@/core/utils/asyncValidators';

const validateUniqueEmail = createAsyncApiValidator('/api/users/check-email', 'email');

const result = await validateUniqueEmail('test@example.com');
// { isValid: true } or { isValid: false, error: 'Email already exists' }
```

#### Combine Async Validators

```tsx
import { combineAsyncValidators } from '@/core/utils/asyncValidators';

const validateEmail = createAsyncZodValidator(z.string().email());
const validateUnique = createAsyncApiValidator('/api/users/check-email', 'email');

const combined = combineAsyncValidators(validateEmail, validateUnique);
const result = await combined('test@example.com');
```

#### Debounced Async Validator

```tsx
import { debounceAsyncValidator } from '@/core/utils/asyncValidators';

const validateEmail = createAsyncApiValidator('/api/users/check-email', 'email');
const debouncedValidate = debounceAsyncValidator(validateEmail, 500);

// Multiple calls within 500ms will only execute the last one
await debouncedValidate('test@example.com');
```

#### Cached Async Validator

```tsx
import { cacheAsyncValidator } from '@/core/utils/asyncValidators';

const validateEmail = createAsyncApiValidator('/api/users/check-email', 'email');
const cachedValidate = cacheAsyncValidator(validateEmail, 5 * 60 * 1000);

// First call: API request
await cachedValidate('test@example.com');
// Second call (within TTL): Returns cached result
await cachedValidate('test@example.com');
```

---

## 🎯 Field-Level Validation

### Genel Bakış

Field-level validation, real-time field validation sağlar.

**Dosya:** `src/core/utils/fieldLevelValidation.ts`

### Özellikler

- Real-time field validation
- Debounced validation
- Field validation state management
- Integration with form validation

### Kullanım

#### useFieldValidation Hook

```tsx
import { useFieldValidation } from '@/core/utils/fieldLevelValidation';
import { z } from 'zod';

function EmailInput() {
  const [email, setEmail] = useState('');
  const { state, validate, clear } = useFieldValidation(email, {
    schema: z.string().email(),
    validateOnChange: true,
    debounceDelay: 500,
  });

  return (
    <TextInput
      value={email}
      onChangeText={(text) => {
        setEmail(text);
        validate();
      }}
      error={state.error}
      helperText={state.isValidating ? 'Validating...' : undefined}
    />
  );
}
```

#### useFormFieldValidation Hook

```tsx
import { useFormFieldValidation } from '@/core/utils/fieldLevelValidation';

function FormField({ fieldName, value }) {
  const { state, validate, clear } = useFormFieldValidation(fieldName, value, {
    schema: z.string().email(),
    validateOnChange: true,
  });

  return <TextInput value={value} onChangeText={validate} error={state.error} />;
}
```

#### Async Field Validation

```tsx
import { useFieldValidation } from '@/core/utils/fieldLevelValidation';
import { createAsyncApiValidator } from '@/core/utils/asyncValidators';

function EmailInput() {
  const [email, setEmail] = useState('');
  const validateUnique = createAsyncApiValidator('/api/users/check-email', 'email');

  const { state, validate } = useFieldValidation(email, {
    asyncValidator: validateUnique,
    validateOnChange: true,
    debounceDelay: 500,
  });

  return (
    <TextInput
      value={email}
      onChangeText={(text) => {
        setEmail(text);
        validate();
      }}
      error={state.error}
    />
  );
}
```

---

## 💡 Kullanım Örnekleri

### Schema-Based Form Validation

```tsx
import { useFormScreen } from '@/core/hooks/useFormScreen';
import { z } from 'zod';
import { validationSchemas } from '@/core/utils/validationSchema';

const userSchema = z.object({
  email: validationSchemas.email(),
  name: validationSchemas.requiredString(),
  age: validationSchemas.numberRange(18, 100),
});

function UserFormScreen() {
  const { formData, errors, handleSubmit, updateField } = useFormScreen(
    userService,
    { entityName: 'user', translationNamespace: 'users', mode: 'create' },
    undefined,
    userSchema // Zod schema as validator
  );

  return (
    <Form>
      <TextInput
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
      />
      <Button onPress={handleSubmit}>Submit</Button>
    </Form>
  );
}
```

### Async Form Validation

```tsx
import { useFormScreen } from '@/core/hooks/useFormScreen';
import { createAsyncApiValidator } from '@/core/utils/asyncValidators';

async function validateUser(data) {
  const errors = {};

  // Sync validation
  if (!data.name) {
    errors.name = 'Name is required';
  }

  // Async validation
  const validateEmail = createAsyncApiValidator('/api/users/check-email', 'email');
  const emailResult = await validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  return errors;
}

function UserFormScreen() {
  const { formData, errors, handleSubmit, updateField } = useFormScreen(
    userService,
    { entityName: 'user', translationNamespace: 'users', mode: 'create' },
    undefined,
    validateUser // Async validator function
  );

  return (
    <Form>
      <TextInput
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
      />
      <Button onPress={handleSubmit}>Submit</Button>
    </Form>
  );
}
```

### Field-Level Real-Time Validation

```tsx
import { useFieldValidation } from '@/core/utils/fieldLevelValidation';
import { z } from 'zod';

function EmailField({ value, onChange }) {
  const { state, validate } = useFieldValidation(value, {
    schema: z.string().email(),
    validateOnChange: true,
    debounceDelay: 500,
  });

  return (
    <TextInput
      value={value}
      onChangeText={(text) => {
        onChange(text);
        validate();
      }}
      error={state.error}
      helperText={state.isValidating ? 'Validating...' : undefined}
    />
  );
}
```

### Combined Validation (Sync + Async)

```tsx
import { z } from 'zod';
import { validationSchemas } from '@/core/utils/validationSchema';
import { createAsyncApiValidator, combineAsyncValidators } from '@/core/utils/asyncValidators';

const emailSchema = z.string().email();
const validateEmailFormat = createAsyncZodValidator(emailSchema);
const validateUniqueEmail = createAsyncApiValidator('/api/users/check-email', 'email');

const validateEmail = combineAsyncValidators(validateEmailFormat, validateUniqueEmail);

function EmailField({ value, onChange }) {
  const { state, validate } = useFieldValidation(value, {
    asyncValidator: validateEmail,
    validateOnChange: true,
    debounceDelay: 500,
  });

  return (
    <TextInput
      value={value}
      onChangeText={(text) => {
        onChange(text);
        validate();
      }}
      error={state.error}
    />
  );
}
```

---

## ✅ Best Practices

### 1. Use Schema-Based Validation

Schema-based validation kullanın (Zod):

```tsx
// ✅ Good
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

// ❌ Bad
const validator = (data) => {
  const errors = {};
  if (!data.email || !data.email.includes('@')) {
    errors.email = 'Invalid email';
  }
  return errors;
};
```

### 2. Use Async Validation for Server-Side Checks

Server-side validation için async validation kullanın:

```tsx
// ✅ Good
const validateUniqueEmail = createAsyncApiValidator('/api/users/check-email', 'email');

// ❌ Bad
const validateUniqueEmail = async (email) => {
  const response = await fetch('/api/users/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  // ... manual handling
};
```

### 3. Use Field-Level Validation for Real-Time Feedback

Real-time feedback için field-level validation kullanın:

```tsx
// ✅ Good
const { state, validate } = useFieldValidation(value, {
  schema: z.string().email(),
  validateOnChange: true,
});

// ❌ Bad
const [error, setError] = useState('');
const validate = () => {
  if (!value.includes('@')) {
    setError('Invalid email');
  }
};
```

### 4. Debounce Async Validations

Async validation'ları debounce edin:

```tsx
// ✅ Good
const debouncedValidate = debounceAsyncValidator(validateEmail, 500);

// ❌ Bad
const validate = async (value) => {
  await validateEmail(value); // Called on every keystroke
};
```

### 5. Cache Validation Results

Validation sonuçlarını cache'leyin:

```tsx
// ✅ Good
const cachedValidate = cacheAsyncValidator(validateEmail, 5 * 60 * 1000);

// ❌ Bad
const validate = async (value) => {
  await validateEmail(value); // Always makes API call
};
```

---

## 📚 İlgili Dokümantasyon

- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/) (Alternative approach)
- [Formik](https://formik.org/) (Alternative approach)

---

**Son Güncelleme:** 2025-02-18
