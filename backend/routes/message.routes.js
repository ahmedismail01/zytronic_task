const express = require("express");
const chatService = require("../service/chat.service.js");
const { authenticateToken } = require("./auth.routes.js");
const {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema,
  conversationIdSchema,
} = require("../validations/index.js");
const validationMiddleware = require("../middleware/validation.middleware.js");
const responseService = require("../utils/handleResponse.js");

const router = express.Router();

// Get user conversations
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const conversations = await chatService.getUserConversations(req.user._id);
    responseService.success(
      res,
      "Conversations retrieved successfully",
      conversations,
      200
    );
  } catch (error) {
    responseService.failer(
      res,
      "Failed to retrieve conversations",
      error.message,
      500
    );
  }
});

// Get conversation by ID
router.get(
  "/conversations/:conversationId",
  authenticateToken,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      // Basic validation for conversation ID
      if (!conversationId || conversationId.length !== 24) {
        return responseService.success(
          res,
          "Invalid conversation ID",
          null,
          400
        );
      }

      const conversation = await chatService.getConversationById(
        conversationId
      );

      if (!conversation) {
        return responseService.failer(res, "Conversation not found", null, 404);
      }

      // Check if user is a participant
      const isParticipant = conversation.participants.some(
        (participant) => participant._id.toString() === req.user._id.toString()
      );

      if (!isParticipant) {
        return responseService.failer(res, "Access denied", null, 403);
      }

      responseService.success(
        res,
        "Conversation retrieved successfully",
        conversation,
        200
      );
    } catch (error) {
      responseService.failer(
        res,
        "Failed to retrieve conversation",
        error.message,
        500
      );
    }
  }
);

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { limit = 50 } = req.query;

      // Basic validation
      if (!conversationId || conversationId.length !== 24) {
        return responseService.failer(
          res,
          "Invalid conversation ID",
          null,
          400
        );
      }

      const messages = await chatService.getConversationMessages(
        conversationId,
        parseInt(limit)
      );
      responseService.success(
        res,
        "Messages retrieved successfully",
        messages,
        200
      );
    } catch (error) {
      responseService.failer(
        res,
        "Failed to retrieve messages",
        error.message,
        500
      );
    }
  }
);

// Create a new conversation
router.post(
  "/conversations",
  [authenticateToken, validationMiddleware(createConversationSchema)],
  async (req, res) => {
    try {
      const { participantId } = req.body;

      if (participantId === req.user._id.toString()) {
        return responseService.failer(
          res,
          "Cannot create conversation with yourself",
          null,
          400
        );
      }

      const conversation = await chatService.createConversation(
        req.user._id,
        participantId
      );
      responseService.success(
        res,
        "Conversation created successfully",
        conversation,
        201
      );
    } catch (error) {
      responseService.failer(
        res,
        "Failed to create conversation",
        error.message,
        500
      );
    }
  }
);

// Send a message
router.post(
  "/conversations/:conversationId/messages",
  [authenticateToken, validationMiddleware(sendMessageSchema)],
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { content, messageType = "text" } = req.body;

      // Basic validation for conversation ID
      if (!conversationId || conversationId.length !== 24) {
        return responseService.failer(
          res,
          "Invalid conversation ID",
          null,
          400
        );
      }

      const message = await chatService.saveMessage(
        conversationId,
        req.user._id,
        messageType,
        content
      );

      responseService.success(res, "Message sent successfully", message, 201);
    } catch (error) {
      responseService.failer(res, "Failed to send message", error.message, 500);
    }
  }
);

module.exports = router;
