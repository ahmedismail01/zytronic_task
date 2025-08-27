# Validation System Documentation

This directory contains Zod validation schemas for the Zytronic Chat application. The validation system uses `zod.safeParse` for better error handling and integrates with a unified response service.

## Structure

```
validations/
├── auth.validation.js      # Authentication-related schemas
├── message.validation.js   # Message and conversation schemas
├── index.js               # Main export file
└── README.md              # This file

utils/
├── validationHelper.js    # Safe validation helpers
└── responseService.js     # Unified response service
```

## Usage Examples

### 1. Basic Route Validation with safeParse

```javascript
const { registerSchema } = require('../validations');
const { validateAndRespond } = require('../utils/validationHelper');
const ResponseService = require('../utils/responseService');

router.post('/register', async (req, res) => {
  try {
    // Validate request body using safeParse
    const validatedData = validateAndRespond(registerSchema, req.body, res);
    if (!validatedData) return; // Validation failed, response already sent
    
    // Use validated data
    const result = await authService.register(validatedData);
    ResponseService.created(res, result, "User registered successfully");
  } catch (error) {
    ResponseService.badRequest(res, error.message);
  }
});
```

### 2. Validate Different Request Parts

```javascript
// Validate request body
const validatedBody = validateAndRespond(bodySchema, req.body, res);
if (!validatedBody) return;

// Validate query parameters
const validatedQuery = validateAndRespond(querySchema, req.query, res);
if (!validatedQuery) return;

// Validate URL parameters
const validatedParams = validateAndRespond(paramsSchema, req.params, res);
if (!validatedParams) return;
```

### 3. Multiple Validation Example

```javascript
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    // Validate multiple schemas using safeParse
    const validatedData = validateMultipleAndRespond({
      params: conversationIdSchema,
      body: sendMessageSchema,
    }, req, res);
    
    if (!validatedData) return; // Validation failed, response already sent
    
    const { conversationId } = validatedData.params;
    const { content, messageType } = validatedData.body;

    // Use validated data
    const message = await chatService.saveMessage(conversationId, userId, messageType, content);
    ResponseService.created(res, message, "Message sent successfully");
  } catch (error) {
    ResponseService.internalError(res, "Failed to send message", error);
  }
});
```

## Available Schemas

### Authentication Schemas

- `registerSchema` - User registration validation
- `loginSchema` - User login validation  
- `updateProfileSchema` - Profile update validation

### Message Schemas

- `createConversationSchema` - Create conversation validation
- `sendMessageSchema` - Send message validation
- `getMessagesSchema` - Get messages query validation
- `conversationIdSchema` - Conversation ID parameter validation
- `userIdSchema` - User ID parameter validation

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Helper Functions

### validateAndRespond(schema, data, res)

Validates data using safeParse and automatically handles the response.

```javascript
const validatedData = validateAndRespond(schema, req.body, res);
if (!validatedData) return; // Validation failed, response already sent
// Use validatedData...
```

### validateMultipleAndRespond(schemas, req, res)

Validates multiple parts of the request and returns structured data.

```javascript
const validatedData = validateMultipleAndRespond({
  body: bodySchema,
  query: querySchema,
  params: paramsSchema,
}, req, res);

if (!validatedData) return;
const { body, query, params } = validatedData;
```

### safeValidate(schema, data)

Low-level validation function that returns validation result.

```javascript
const result = safeValidate(schema, data);
if (result.success) {
  // Use result.data
} else {
  // Handle result.errors
}
```

## Response Service Methods

### Success Responses
- `ResponseService.success(res, data, message, statusCode)` - General success
- `ResponseService.created(res, data, message)` - 201 Created
- `ResponseService.noContent(res)` - 204 No Content

### Error Responses
- `ResponseService.error(res, message, statusCode, details)` - General error
- `ResponseService.validationError(res, validationErrors)` - Validation errors
- `ResponseService.badRequest(res, message)` - 400 Bad Request
- `ResponseService.unauthorized(res, message)` - 401 Unauthorized
- `ResponseService.forbidden(res, message)` - 403 Forbidden
- `ResponseService.notFound(res, message)` - 404 Not Found
- `ResponseService.conflict(res, message)` - 409 Conflict
- `ResponseService.internalError(res, message, error)` - 500 Internal Error

## Adding New Schemas

1. Create a new validation file in the `validations/` directory
2. Define your Zod schemas
3. Export them from the file
4. Import them in `validations/index.js`
5. Use them in your routes

### Example: Adding a new schema

```javascript
// validations/custom.validation.js
const { z } = require("zod");

const customSchema = z.object({
  field: z.string().min(1, "Field is required"),
  // ... more fields
});

module.exports = {
  customSchema,
};
```

```javascript
// validations/index.js
const customValidations = require("./custom.validation");

module.exports = {
  ...authValidations,
  ...messageValidations,
  ...customValidations, // Add your new validations
};
```

## Best Practices

1. **Use safeParse**: Always use `safeParse` instead of `parse` for better error handling
2. **Validate early**: Validate data at the beginning of your route handler
3. **Use response service**: Use ResponseService for consistent API responses
4. **Handle validation failures**: Always check if validation succeeded before proceeding
5. **Reuse schemas**: Create reusable schemas for common patterns
6. **Test your schemas**: Write tests to ensure validation works correctly
7. **Keep validation close to business logic**: Validate in the route handler for better control

## Validation Rules

### Username
- Minimum 3 characters
- Maximum 30 characters
- Only letters, numbers, and underscores allowed

### Email
- Must be valid email format
- Required field

### Password
- Minimum 6 characters
- Maximum 100 characters
- Must contain uppercase, lowercase, and number

### Message Content
- Minimum 1 character
- Maximum 1000 characters

### IDs
- Must be valid MongoDB ObjectId format (24 hex characters)

### Message Type
- Must be either "text" or "image"

## Benefits of safeParse + Response Service

1. **Better Error Handling**: safeParse doesn't throw exceptions, making error handling cleaner
2. **Unified Responses**: All API responses follow the same format
3. **Type Safety**: Runtime type checking with detailed error messages
4. **Consistency**: All endpoints return responses in the same structure
5. **Maintainability**: Easy to modify response format across the entire API
6. **Debugging**: Clear error messages and structured responses
7. **Performance**: No exception throwing for validation failures
