# Implementation Plan: User Authentication

## Overview

This implementation plan breaks down the user authentication system into incremental coding tasks. The approach follows a bottom-up strategy: starting with core backend services (password hashing, JWT tokens), then building GraphQL resolvers, followed by frontend state management, and finally wiring everything together with UI components.

Each task builds on previous work, ensuring no orphaned code. Testing tasks are included as optional sub-tasks to validate correctness properties and catch errors early.

## Tasks

- [ ] 0. Set up project configuration and tooling
  - [x] 0.1 Configure TypeScript with strict mode
    - Enable strict mode in tsconfig.json
    - Enable strictNullChecks, noImplicitAny, strictFunctionTypes
    - Set explicit function return types requirement
    - _Best Practice: Type safety_
  
  - [x] 0.2 Set up ESLint with TypeScript rules
    - Install @typescript-eslint/parser and @typescript-eslint/eslint-plugin
    - Configure rules: explicit-function-return-type, no-explicit-any, no-unused-vars
    - Add lint script to package.json
    - _Best Practice: Code quality_
  
  - [x] 0.3 Configure Prettier for code formatting
    - Install prettier and eslint-config-prettier
    - Create .prettierrc with project standards
    - Add format script to package.json
    - _Best Practice: Consistent formatting_
  
  - [x] 0.4 Set up Husky and lint-staged for pre-commit hooks
    - Install husky and lint-staged
    - Configure pre-commit hook to run linter and formatter
    - Ensure commits are always formatted and linted
    - _Best Practice: Automated quality checks_

- [ ] 1. Set up backend authentication infrastructure
  - [x] 1.1 Create auth service with password hashing and JWT token generation
    - Define enums: TokenType (ACCESS, REFRESH), TokenValidationResult
    - Define constants: BCRYPT_SALT_ROUNDS, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY
    - Define interfaces: JWTPayload, TokenPair, TokenValidation with explicit types
    - Implement `hashPassword(password: string): Promise<string>` using bcrypt with 10 salt rounds
    - Implement `comparePassword(password: string, hash: string): Promise<boolean>` using bcrypt
    - Implement `generateTokens(userId: number): TokenPair` to create access token (15m expiry) and refresh token (7d expiry)
    - Implement `verifyToken(token: string, type: TokenType): TokenValidation` to validate and decode JWT tokens
    - All functions must have explicit return type annotations
    - _Requirements: 1.4, 2.5, 3.1, 3.2, 9.1, 9.2, 9.3_
    - _Best Practice: Enums for constants, type hints for all parameters and returns_
  
  - [ ]* 1.2 Write property test for password hashing round-trip
    - **Property 6: Password verification round-trip**
    - **Validates: Requirements 2.5, 9.3**
    - Generate random passwords, hash them, verify original matches and wrong passwords don't match
  
  - [ ]* 1.3 Write property test for JWT token round-trip
    - **Property 9: Token validation round-trip**
    - **Validates: Requirements 3.2, 3.5**
    - Generate random user IDs, create tokens, verify decoded user ID matches original
  
  - [ ]* 1.4 Write unit tests for token expiration
    - Test expired tokens are rejected
    - Test invalid signature tokens are rejected
    - _Requirements: 3.3, 3.4_

- [ ] 2. Implement database layer for user management
  - [x] 2.1 Create user repository with CRUD operations
    - Define enum: UserStatus (ACTIVE, INACTIVE, SUSPENDED)
    - Define interfaces: UserRecord, User, CreateUserInput with all fields typed
    - Implement `createUser(input: CreateUserInput): Promise<User>` with explicit types
    - Implement `findUserByEmail(email: string): Promise<UserRecord | null>` with null handling
    - Implement `findUserById(id: number): Promise<UserRecord | null>` with null handling
    - Implement `toPublicUser(record: UserRecord): User` helper to strip password
    - Ensure email uniqueness is enforced at database level
    - Use typed arrays for query results: `User[]` not `any[]`
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
    - _Best Practice: Enums for status, explicit null handling, typed arrays_
  
  - [ ]* 2.2 Write property test for user persistence
    - **Property 19: User persistence with required fields**
    - **Validates: Requirements 10.1, 10.4**
    - Generate random user data, create users, verify all fields are stored correctly
  
  - [ ]* 2.3 Write property test for user retrieval
    - **Property 20: User retrieval by identifier**
    - **Validates: Requirements 10.2, 10.3**
    - Create users, verify retrieval by email and ID returns same data
  
  - [ ]* 2.4 Write unit test for email uniqueness constraint
    - Test duplicate email registration fails with appropriate error
    - _Requirements: 1.2, 10.4_

- [ ] 3. Create GraphQL schema and type definitions
  - [x] 3.1 Define GraphQL schema for authentication (PARTIAL - missing enums and proper types)
    - Define enums in schema: ErrorCode, UserStatus
    - Define User type (id, email, name, status, createdAt) with proper types
    - Define AuthPayload type (user, accessToken, refreshToken)
    - Define RegisterInput and LoginInput input types
    - Define register and login mutations with typed inputs
    - Define me query with proper return type
    - Use GraphQL enums for status fields
    - _Requirements: 1.5, 2.4, 4.4_
    - _Best Practice: GraphQL enums for type safety_

- [ ] 4. Implement authentication middleware and context
  - [x] 4.1 Create auth middleware for GraphQL context
    - Define interface: GraphQLContext with userId, isAuthenticated, userStatus
    - Implement `buildContext({ req }: { req: Request }): Promise<GraphQLContext>` to extract and verify JWT from Authorization header
    - Return context with typed fields (no implicit any)
    - Implement `requireAuth(context: GraphQLContext): void` helper to throw error if not authenticated
    - Use type guards for token validation
    - _Requirements: 3.2, 4.1, 4.2, 4.3_
    - _Best Practice: Explicit types for context, type guards_
  
  - [ ]* 4.2 Write property test for protected resolver authentication
    - **Property 11: Protected resolvers require valid authentication**
    - **Validates: Requirements 4.1**
    - Generate valid and invalid tokens, verify protected resolvers behave correctly

- [ ] 5. Implement GraphQL resolvers for authentication
  - [x] 5.1 Implement register mutation resolver (PARTIAL - missing dependencies)
    - Validate input (email format, required fields)
    - Check if email already exists
    - Hash password using auth service
    - Create user in database
    - Generate JWT tokens
    - Return AuthPayload
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 5.2 Implement login mutation resolver (PARTIAL - missing dependencies)
    - Find user by email
    - Verify password using auth service
    - Generate JWT tokens
    - Return AuthPayload
    - Return generic error for invalid credentials (security)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 5.3 Implement me query resolver (PARTIAL - missing dependencies)
    - Require authentication using requireAuth helper
    - Fetch user by ID from context
    - Return user data (exclude password hash)
    - _Requirements: 4.4, 9.4_
  
  - [ ]* 5.4 Write property test for registration flow
    - **Property 1: Registration creates authenticated user**
    - **Validates: Requirements 1.1, 1.5**
    - Generate random valid registration inputs, verify user creation and token generation
  
  - [ ]* 5.5 Write property test for login flow
    - **Property 3: Login with valid credentials returns tokens**
    - **Validates: Requirements 2.1, 2.4**
    - Create users with known passwords, verify login succeeds with correct credentials
  
  - [ ]* 5.6 Write property test for authentication response format
    - **Property 4: Authentication response format consistency**
    - **Validates: Requirements 1.5, 2.4**
    - Verify all auth responses contain user, accessToken, and refreshToken
  
  - [ ]* 5.7 Write unit tests for error cases
    - Test registration with duplicate email returns error
    - Test login with wrong password returns error
    - Test login with non-existent email returns error
    - _Requirements: 1.2, 2.2, 2.3_

- [ ] 6. Checkpoint - Backend authentication complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [ ] 7. Set up frontend Redux authentication slice
  - [x] 7.1 Create auth slice with state and reducers
    - Define enums: AuthStatus (IDLE, LOADING, AUTHENTICATED, UNAUTHENTICATED, ERROR), AuthErrorType
    - Define interfaces: AuthState, User, AuthError with all fields typed
    - Define typed action payloads for all reducers
    - Implement setUser, setTokens, clearAuth, setError, setStatus reducers with typed payloads
    - Create typed selectors: selectIsAuthenticated, selectCurrentUser, selectAuthStatus
    - Use ReadonlyArray for immutable arrays
    - _Requirements: 7.1, 7.2, 7.3_
    - _Best Practice: Enums for status, typed reducers and selectors_
  
  - [x] 7.2 Implement async thunks for authentication actions
    - Define typed parameter interfaces: LoginCredentials, RegisterData
    - Create loginUser thunk with typed parameters: `AsyncThunk<User, LoginCredentials>`
    - Create registerUser thunk with typed parameters: `AsyncThunk<User, RegisterData>`
    - Create logoutUser thunk: `AsyncThunk<void, void>`
    - Create initializeAuth thunk: `AsyncThunk<User | null, void>`
    - All thunks must have explicit return types
    - _Requirements: 7.1, 7.2, 7.4_
    - _Best Practice: Typed async thunks, explicit return types_
  
  - [ ]* 7.3 Write property test for Redux state synchronization
    - **Property 16: Redux state synchronization**
    - **Validates: Requirements 7.1, 7.3, 7.4**
    - Test state updates correctly for login, logout, and initialization

- [ ] 8. Implement token storage service
  - [x] 8.1 Create localStorage token storage utilities
    - Define enum: StorageKey (ACCESS_TOKEN, REFRESH_TOKEN, USER_DATA)
    - Define interface: TokenStorage with all methods typed
    - Implement `saveTokens(accessToken: string, refreshToken: string): void`
    - Implement `getAccessToken(): string | null` with explicit null handling
    - Implement `getRefreshToken(): string | null` with explicit null handling
    - Implement `clearTokens(): void`
    - Implement `isTokenExpired(token: string): boolean` with type guard
    - Use enum values for localStorage keys (no magic strings)
    - _Requirements: 5.1, 5.2, 5.3_
    - _Best Practice: Enums for keys, explicit null handling_
  
  - [ ]* 8.2 Write property test for token storage round-trip
    - **Property 13: Token storage round-trip**
    - **Validates: Requirements 5.1, 5.2**
    - Generate random tokens, store and retrieve them, verify values match

- [ ] 9. Configure Apollo Client with authentication
  - [x] 9.1 Create auth link for Apollo Client
    - Define enum: GraphQLErrorCode (UNAUTHENTICATED, FORBIDDEN, etc.)
    - Implement setContext link with typed headers: `Record<string, string>`
    - Add Authorization header with token from storage (typed as `string | null`)
    - Only add header if token exists (explicit null check)
    - _Requirements: 8.1, 8.3_
    - _Best Practice: Typed headers, explicit null checks_
  
  - [x] 9.2 Create error link for authentication error handling
    - Define type guard: `isAuthError(errors: ReadonlyArray<GraphQLError>): boolean`
    - Detect authentication errors using enum values
    - Clear tokens from storage on auth errors
    - Dispatch typed Redux action to clear auth state
    - Use ReadonlyArray for error arrays
    - _Requirements: 5.4, 8.2_
    - _Best Practice: Type guards, readonly arrays, enums for error codes_
  
  - [x] 9.3 Wire Apollo Client with links
    - Combine auth link, error link, and HTTP link
    - Configure Apollo Client with combined link
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 9.4 Write property test for Apollo auth headers
    - **Property 17: Apollo client includes auth headers conditionally**
    - **Validates: Requirements 8.1, 8.3**
    - Test requests include Authorization header when token exists, exclude it when not

- [ ] 10. Create GraphQL mutations and queries for frontend
  - [x] 10.1 Define GraphQL operations using Apollo Client
    - Create REGISTER_MUTATION with RegisterInput
    - Create LOGIN_MUTATION with LoginInput
    - Create ME_QUERY
    - Export typed hooks (useRegisterMutation, useLoginMutation, useMeQuery)
    - _Requirements: 1.5, 2.4, 4.4_

- [ ] 11. Implement authentication UI components
  - [x] 11.1 Create Register component with form
    - Material-UI form with email, password, name fields
    - Client-side validation
    - Call registerUser thunk on submit
    - Display errors from Redux state
    - Redirect to home on success
    - _Requirements: 1.1, 1.3_
  
  - [x] 11.2 Create Login component with form
    - Material-UI form with email and password fields
    - Client-side validation
    - Call loginUser thunk on submit
    - Display errors from Redux state
    - Redirect to home on success
    - _Requirements: 2.1_
  
  - [x] 11.3 Create ProtectedRoute component
    - Check isAuthenticated from Redux state
    - Redirect to /login if not authenticated
    - Render children if authenticated
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 11.4 Write property test for protected route behavior
    - **Property 15: Protected routes enforce authentication**
    - **Validates: Requirements 6.1, 6.4**
    - Test routes render with valid auth, redirect without auth

- [ ] 12. Implement navigation and logout functionality
  - [x] 12.1 Create navigation bar with auth-aware links
    - Show Login/Register links when not authenticated
    - Show Logout button when authenticated
    - Display current user name when authenticated
    - _Requirements: 7.1_
  
  - [x] 12.2 Implement logout functionality
    - Call logoutUser thunk on logout button click
    - Clear tokens from storage
    - Clear Redux state
    - Redirect to login page
    - _Requirements: 5.3, 7.2_

- [ ] 13. Initialize authentication on app load
  - [x] 13.1 Add auth initialization to app entry point
    - Dispatch initializeAuth thunk when app loads
    - Load tokens from localStorage
    - Validate tokens by calling ME_QUERY
    - Update Redux state based on validation result
    - _Requirements: 5.2, 7.4_
  
  - [ ]* 13.2 Write integration test for auth initialization
    - Test app initializes with valid stored tokens
    - Test app clears invalid stored tokens
    - _Requirements: 5.2, 5.4, 7.4_

- [ ] 14. Wire protected routes in app routing
  - [x] 14.1 Set up React Router with protected routes
    - Create public routes (/login, /register)
    - Create protected routes (/, /profile, etc.) wrapped with ProtectedRoute
    - Configure redirects based on auth state
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 15. Final checkpoint - End-to-end authentication flow
  - [ ] 15.1 Test complete registration flow
    - Register new user → tokens stored → redirected to home → can access protected routes
    - _Requirements: 1.1, 1.5, 5.1, 6.1, 7.1_
  
  - [ ] 15.2 Test complete login flow
    - Login existing user → tokens stored → redirected to home → can access protected routes
    - _Requirements: 2.1, 2.4, 5.1, 6.1, 7.1_
  
  - [ ] 15.3 Test logout flow
    - Logout → tokens cleared → redirected to login → cannot access protected routes
    - _Requirements: 5.3, 6.2, 7.2_
  
  - [ ] 15.4 Test token expiration handling
    - Access protected route with expired token → redirected to login → tokens cleared
    - _Requirements: 3.3, 5.4, 6.3, 6.4_
  
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows
- Backend tasks (1-6) can be completed before frontend tasks (7-15)
- Checkpoints ensure incremental validation at major milestones


## Additional Features

- [ ] 16. Implement password visibility toggle
  - [x] 16.1 Add eye icon to Login password field
    - Add Material-UI Visibility/VisibilityOff icons
    - Toggle between text and password input types
    - _Requirements: UX improvement_
  
  - [x] 16.2 Add eye icon to Register password field
    - Add Material-UI Visibility/VisibilityOff icons
    - Toggle between text and password input types
    - _Requirements: UX improvement_

- [x] 17. Implement forgot password functionality
  - [x] 17.1 Create password reset token system (Backend)
    - Add `password_reset_token` and `password_reset_expires` columns to users table
    - Create `generateResetToken()` function to create secure random token
    - Create `saveResetToken(email, token, expiry)` function
    - Create `validateResetToken(token)` function
    - Tokens should expire after 1 hour
    - _Requirements: Password recovery_
  
  - [x] 17.2 Create forgot password GraphQL mutation (Backend)
    - Define `forgotPassword(email: String!): Boolean!` mutation
    - Validate email exists in database
    - Generate reset token and save to database
    - Return success (don't reveal if email exists for security)
    - _Requirements: Password recovery_
  
  - [x] 17.3 Create reset password GraphQL mutation (Backend)
    - Define `resetPassword(token: String!, newPassword: String!): Boolean!` mutation
    - Validate token exists and not expired
    - Hash new password with bcrypt
    - Update user password
    - Clear reset token from database
    - _Requirements: Password recovery_
  
  - [x] 17.4 Create ForgotPassword component (Frontend)
    - Material-UI form with email field
    - Call forgotPassword mutation
    - Show success message with instructions
    - Link from login page
    - _Requirements: Password recovery_
  
  - [x] 17.5 Create ResetPassword component (Frontend)
    - Material-UI form with new password field
    - Get token from URL query parameter
    - Call resetPassword mutation
    - Redirect to login on success
    - Show error if token invalid/expired
    - _Requirements: Password recovery_
  
  - [x] 17.6 Add email service integration
    - Install nodemailer or similar email service
    - Configure SMTP settings in .env
    - Create `sendPasswordResetEmail(email, token)` function
    - Email should contain reset link with token
    - _Requirements: Password recovery_

- [x] 18. Implement email verification
  - [x] 18.1 Add email verification fields to database
    - Add `email_verified` boolean column (default false)
    - Add `verification_token` column
    - Add `verification_token_expires` column
    - Update users table migration
    - _Requirements: Email verification_
  
  - [x] 18.2 Create email verification system (Backend)
    - Generate verification token on registration
    - Create `verifyEmail(token: String!): Boolean!` mutation
    - Create `resendVerificationEmail(email: String!): Boolean!` mutation
    - Tokens should expire after 24 hours
    - _Requirements: Email verification_
  
  - [x] 18.3 Update registration flow
    - Generate verification token on user creation
    - Set `email_verified` to false by default
    - Send verification email after registration
    - Show "Please verify your email" message
    - _Requirements: Email verification_
  
  - [x] 18.4 Create email verification page (Frontend)
    - Get token from URL query parameter
    - Call verifyEmail mutation automatically
    - Show success/error message
    - Redirect to login after success
    - _Requirements: Email verification_
  
  - [x] 18.5 Add email verification check to login
    - Check if email is verified before allowing login
    - Show error message if not verified
    - Provide "Resend verification email" button
    - _Requirements: Email verification_
  
  - [x] 18.6 Create verification email template
    - HTML email template with verification link
    - Include user name and expiry time
    - Professional styling
    - _Requirements: Email verification_

- [ ] 19. Email service setup
  - [ ] 19.1 Configure email service provider
    - Choose provider (mailtrap)
    - Add credentials to .env file
    - Install required npm packages
    - _Requirements: Email functionality_
  
  - [ ] 19.2 Create email service module
    - Create `src/services/email.service.ts`
    - Implement `sendEmail(to, subject, html)` function
    - Implement `sendPasswordResetEmail(email, token)` function
    - Implement `sendVerificationEmail(email, token)` function
    - Add error handling and logging
    - _Requirements: Email functionality_
  
  - [ ] 19.3 Create email templates
    - Create `templates/password-reset.html`
    - Create `templates/email-verification.html`
    - Create `templates/welcome.html` (optional)
    - Use template variables for dynamic content
    - _Requirements: Email functionality_

## Notes for Additional Features

- Email verification is recommended for production applications
- Password reset tokens should be cryptographically secure (use crypto.randomBytes)
- Email templates should be mobile-responsive
- Consider rate limiting for forgot password and resend verification endpoints
- Store email service credentials securely in environment variables
- Test email functionality in development with services like Mailtrap
- For production, use reliable email service providers (SendGrid, AWS SES, etc.)
