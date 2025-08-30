const express = require("express");
const chatService = require("../service/chat.service.js");
const { authenticateToken } = require("./auth.routes.js");
const {
  createConversationSchema,
  sendMessageSchema,
} = require("../validations/index.js");
const validationMiddleware = require("../middleware/validation.middleware.js");
const responseService = require("../utils/handleResponse.js");

const router = express.Router();

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
    responseService.failure(
      res,
      "Failed to retrieve conversations",
      error.message,
      500
    );
  }
});

router.get(
  "/conversations/:conversationId",
  authenticateToken,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

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
        return responseService.failure(
          res,
          "Conversation not found",
          null,
          404
        );
      }

      const isParticipant = conversation.participants.some(
        (participant) => participant._id.toString() === req.user._id.toString()
      );

      if (!isParticipant) {
        return responseService.failure(res, "Access denied", null, 403);
      }

      responseService.success(
        res,
        "Conversation retrieved successfully",
        conversation,
        200
      );
    } catch (error) {
      responseService.failure(
        res,
        "Failed to retrieve conversation",
        error.message,
        500
      );
    }
  }
);

router.get(
  "/conversations/:conversationId/messages",
  authenticateToken,
  async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!conversationId || conversationId.length !== 24) {
        return responseService.failure(
          res,
          "Invalid conversation ID",
          null,
          400
        );
      }

      const messages = await chatService.getConversationMessages(
        conversationId
      );
      responseService.success(
        res,
        "Messages retrieved successfully",
        messages,
        200
      );
    } catch (error) {
      responseService.failure(
        res,
        "Failed to retrieve messages",
        error.message,
        500
      );
    }
  }
);

router.post(
  "/conversations",
  [authenticateToken, validationMiddleware(createConversationSchema)],
  async (req, res) => {
    try {
      const { participantId } = req.body;

      if (participantId === req.user._id.toString()) {
        return responseService.failure(
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
      responseService.failure(
        res,
        "Failed to create conversation",
        error.message,
        500
      );
    }
  }
);

router.post(
  "/conversations/:conversationId/messages",
  [authenticateToken, validationMiddleware(sendMessageSchema)],
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { content, messageType = "text" } = req.body;

      if (!conversationId || conversationId.length !== 24) {
        return responseService.failure(
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
      responseService.failure(
        res,
        "Failed to send message",
        error.message,
        500
      );
    }
  }
);

module.exports = router;
