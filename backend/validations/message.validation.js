const { z } = require("zod");

const createConversationSchema = z.object({
  participantId: z
    .string()
    .min(1, "Participant ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid participant ID format"),
});

const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content is required")
    .max(1000, "Message content must be less than 1000 characters"),
  messageType: z
    .enum(["text", "image"], {
      errorMap: () => ({
        message: "Message type must be either 'text' or 'image'",
      }),
    })
    .default("text"),
});

const getMessagesSchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .default("50"),
});

const conversationIdSchema = z.object({
  conversationId: z
    .string()
    .min(1, "Conversation ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid conversation ID format"),
});

const userIdSchema = z.object({
  userId: z
    .string()
    .min(1, "User ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

module.exports = {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema,
  conversationIdSchema,
  userIdSchema,
};
