---
inclusion: auto
---

# TypeScript Best Practices - Steering Rules

These rules MUST be followed for all TypeScript code in this project.

## 1. Type Hinting - MANDATORY

**Rule**: Every function parameter and return type MUST have explicit type annotations.

**Examples:**

```typescript
// ✅ CORRECT - Explicit types everywhere
function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

function getUser(id: number): User | null {
  return users.find(u => u.id === id) ?? null;
}

// ❌ WRONG - Missing return type
function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// ❌ WRONG - Implicit any parameter
function processData(data) {
  return data.map(item => item.value);
}
```

**Enforcement:**
- NO implicit `any` types allowed
- NO missing return type annotations
- NO untyped function parameters
- Use `unknown` instead of `any` when type is truly unknown

## 2. Enums for String/Number Constants - MANDATORY

**Rule**: Use enums instead of string literals or magic numbers for status values, error codes, and other constants.

**Examples:**

```typescript
// ✅ CORRECT - Using enums
enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error',
}

enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

function setStatus(status: AuthStatus): void {
  state.status = status;
}

// ❌ WRONG - Magic strings
function setStatus(status: string): void {
  state.status = status; // Could be any string!
}

const status = 'loading'; // No type safety

// ❌ WRONG - String union (use enum instead)
type Status = 'idle' | 'loading' | 'authenticated'; // Use enum!
```

**When to use enums:**
- Status values (loading, success, error states)
- Error codes (UNAUTHENTICATED, FORBIDDEN, etc.)
- Storage keys (ACCESS_TOKEN, REFRESH_TOKEN)
- API endpoints or routes
- Configuration options
- Any set of related constants

**Const enums for performance:**
```typescript
const enum StorageKey {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}
```

## 3. Array Type Annotations - MANDATORY

**Rule**: All arrays MUST have explicit type annotations. Use `ReadonlyArray<T>` for immutable arrays.

**Examples:**

```typescript
// ✅ CORRECT - Typed arrays
const users: User[] = [];
const ids: number[] = [1, 2, 3];
const errors: ReadonlyArray<ValidationError> = getErrors();

function getUsers(): User[] {
  return database.query('SELECT * FROM users');
}

function processErrors(errors: ReadonlyArray<GraphQLError>): void {
  errors.forEach(error => console.error(error));
}

// ❌ WRONG - Untyped arrays
const users = []; // Type: any[]
const ids = [1, 2, 3]; // Inferred, but should be explicit

function getUsers() {
  return database.query('SELECT * FROM users'); // Returns any[]
}
```

**Array type options:**
- `Type[]` - Standard mutable array
- `Array<Type>` - Alternative syntax (use for complex types)
- `ReadonlyArray<Type>` - Immutable array (cannot push, pop, etc.)
- `readonly Type[]` - Alternative readonly syntax

**When to use ReadonlyArray:**
- Function parameters that shouldn't modify the array
- Return values that shouldn't be modified by caller
- Props in React components
- Configuration arrays

## 4. Const Assertions - MANDATORY

**Rule**: Use `as const` for literal values that should never change.

**Examples:**

```typescript
// ✅ CORRECT - Const assertions
const BCRYPT_SALT_ROUNDS = 10 as const;
const ACCESS_TOKEN_EXPIRY = '15m' as const;
const REFRESH_TOKEN_EXPIRY = '7d' as const;

const CONFIG = {
  port: 4000,
  host: 'localhost',
} as const;

// ❌ WRONG - Mutable constants
const BCRYPT_SALT_ROUNDS = 10; // Type: number (could be changed)
const ACCESS_TOKEN_EXPIRY = '15m'; // Type: string (could be any string)
```

**Benefits:**
- Prevents accidental modification
- Narrows type to literal value
- Better type inference
- Compile-time guarantees

## 5. Null Safety - MANDATORY

**Rule**: Explicitly handle null/undefined cases. Use strict null checks.

**Examples:**

```typescript
// ✅ CORRECT - Explicit null handling
function getUser(id: number): User | null {
  const user = users.find(u => u.id === id);
  return user ?? null;
}

function getUserEmail(id: number): string {
  const user = getUser(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user.email;
}

// Using optional chaining and nullish coalescing
const email = user?.email ?? 'unknown@example.com';
const name = user?.profile?.name ?? 'Anonymous';

// ❌ WRONG - Not handling null
function getUser(id: number): User {
  return users.find(u => u.id === id); // Could be undefined!
}

function getUserEmail(id: number): string {
  const user = getUser(id);
  return user.email; // Could crash if user is null!
}
```

**Required practices:**
- Always use `| null` or `| undefined` in return types when applicable
- Use optional chaining (`?.`) for safe property access
- Use nullish coalescing (`??`) for default values
- Never use `!` (non-null assertion) unless absolutely necessary
- Always check for null/undefined before using values

## 6. Interface vs Type - MANDATORY

**Rule**: Use `interface` for object shapes. Use `type` for unions, intersections, and utility types.

**Examples:**

```typescript
// ✅ CORRECT - Interface for objects
interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// ✅ CORRECT - Type for unions and complex types
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

type Status = 'idle' | 'loading' | 'success' | 'error';

type Nullable<T> = T | null;

// ❌ WRONG - Type for simple objects (use interface)
type User = {
  id: number;
  email: string;
};

// ❌ WRONG - Interface for unions (use type)
interface Status extends 'idle' | 'loading' {} // Not possible!
```

**When to use interface:**
- Object shapes
- Class contracts
- Extensible types (can be extended with `extends`)
- Public APIs

**When to use type:**
- Union types
- Intersection types
- Mapped types
- Utility types
- Type aliases for primitives

## 7. Type Guards - MANDATORY

**Rule**: Use type guards for runtime type checking.

**Examples:**

```typescript
// ✅ CORRECT - Type guard functions
function isAuthError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

function isValidToken(token: string | null): token is string {
  return token !== null && token.length > 0;
}

// Usage
if (isAuthError(error)) {
  console.error(error.code); // TypeScript knows it's AuthenticationError
}

if (isValidToken(token)) {
  // TypeScript knows token is string, not string | null
  const decoded = jwt.decode(token);
}

// ❌ WRONG - No type guard
function checkError(error: unknown) {
  if (error instanceof AuthenticationError) {
    // Works at runtime, but TypeScript doesn't narrow the type
  }
}
```

## 8. Error Handling - MANDATORY

**Rule**: Use typed errors with enums for error codes. Never throw raw strings.

**Examples:**

```typescript
// ✅ CORRECT - Typed error classes
enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

class AuthenticationError extends Error {
  constructor(
    public code: ErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

function authenticate(token: string): User {
  if (!token) {
    throw new AuthenticationError(
      ErrorCode.UNAUTHENTICATED,
      'No token provided'
    );
  }
  // ...
}

// ❌ WRONG - Throwing strings
function authenticate(token: string): User {
  if (!token) {
    throw 'No token provided'; // Never do this!
  }
}

// ❌ WRONG - Generic Error without type
function authenticate(token: string): User {
  if (!token) {
    throw new Error('No token provided'); // No error code!
  }
}
```

## 9. Function Signatures - MANDATORY

**Rule**: Keep function signatures clean and well-typed.

**Examples:**

```typescript
// ✅ CORRECT - Clean, typed signatures
function createUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  // Implementation
}

function validateCredentials(
  credentials: LoginCredentials
): Promise<ValidationResult> {
  // Implementation
}

// ✅ CORRECT - Using interfaces for complex parameters
interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

function createUser(params: CreateUserParams): Promise<User> {
  // Implementation
}

// ❌ WRONG - Too many parameters without interface
function createUser(
  email: string,
  password: string,
  name: string,
  role: string,
  status: string,
  createdBy: string
): Promise<User> {
  // Use an interface instead!
}
```

## 10. Async/Await - MANDATORY

**Rule**: Always use async/await instead of raw promises. Always type async functions.

**Examples:**

```typescript
// ✅ CORRECT - Async/await with types
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function login(
  email: string,
  password: string
): Promise<AuthPayload> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AuthenticationError(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid credentials'
    );
  }
  
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new AuthenticationError(
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid credentials'
    );
  }
  
  return generateAuthPayload(user);
}

// ❌ WRONG - Using .then() chains
function login(email: string, password: string) {
  return getUserByEmail(email)
    .then(user => {
      if (!user) throw new Error('Invalid credentials');
      return comparePassword(password, user.password);
    })
    .then(isValid => {
      // Harder to read and maintain
    });
}
```

## Checklist for Every File

Before committing any TypeScript file, verify:

- [ ] All function parameters have explicit types
- [ ] All function return types are declared
- [ ] No `any` types (use `unknown` if needed)
- [ ] String/number constants use enums
- [ ] All arrays have type annotations
- [ ] Constants use `as const` where appropriate
- [ ] Null/undefined cases are explicitly handled
- [ ] Interfaces used for objects, types for unions
- [ ] Type guards used for runtime checks
- [ ] Errors are typed with error codes
- [ ] Async functions return `Promise<Type>`
- [ ] No magic strings or numbers

## TSConfig Requirements

Your `tsconfig.json` MUST include:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## ESLint Requirements

Your `.eslintrc.json` MUST include:

```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/prefer-enum-initializers": "error",
    "@typescript-eslint/prefer-readonly": "error"
  }
}
```

---

**Remember**: These are not suggestions - they are MANDATORY rules for this project. Code that doesn't follow these practices should not be committed.
