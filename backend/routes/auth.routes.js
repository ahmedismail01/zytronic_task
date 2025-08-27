const router = require("express").Router();
const authService = require("../service/auth.service.js");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validations/index.js");
const validationMiddleware = require("../middleware/validation.middleware.js");
const responseService = require("../utils/handleResponse.js");
const { sanitizeUser, sanitizeUserForPublic } = require("../dtos/user.dto.js");

router.post(
  "/register",
  validationMiddleware(registerSchema),
  async (req, res) => {
    try {
      const result = await authService.register(req.body);
      responseService.success(res, "User registered successfully", result, 201);
    } catch (error) {
      responseService.failer(res, error.message, null, 400);
    }
  }
);

router.post("/login", validationMiddleware(loginSchema), async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    responseService.success(res, "Login successful", result, 200);
  } catch (error) {
    responseService.failer(res, error.message, null, 401);
  }
});

router.get("/profile", authService.authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUser(req.user._id);
    const sanitizedUser = sanitizeUser(user);
    responseService.success(
      res,
      "Profile retrieved successfully",
      sanitizedUser,
      200
    );
  } catch (error) {
    responseService.failer(res, error.message, null, 404);
  }
});

router.get("/users", authService.authenticateToken, async (req, res) => {
  try {
    const users = await authService.getAllUsers(req.user._id);
    const sanitizedUsers = users.map((user) => sanitizeUserForPublic(user));
    responseService.success(
      res,
      "Users retrieved successfully",
      sanitizedUsers,
      200
    );
  } catch (error) {
    responseService.failer(
      res,
      "Failed to retrieve users",
      error.message,
      500
    );
  }
});

router.put(
  "/profile",
  [authService.authenticateToken, validationMiddleware(updateProfileSchema)],
  async (req, res) => {
    try {
      const updatedUser = await authService.updateProfile(
        req.user._id,
        req.body
      );

      const sanitizedUser = sanitizeUser(updatedUser);

      responseService.success(
        res,
        "Profile updated successfully",
        sanitizedUser,
        200
      );
    } catch (error) {
      responseService.failer(res, error.message, null, 400);
    }
  }
);

module.exports = { router, authenticateToken: authService.authenticateToken };
