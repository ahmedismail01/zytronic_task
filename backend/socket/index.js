const { default: mongoose } = require("mongoose");
const authService = require("../service/auth.service");
const chatService = require("../service/chat.service");

module.exports = establishSocket = (io) => {
  io.engine.opts.cors = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const user = await authService.verifyToken(token);
      socket.userId = user._id;
      next();
    } catch (error) {
      console.log(error);
      next(new Error("Invalid token"));
    }
  });

  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);
    userSockets.set(socket.userId.toString(), socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId.toString());
    });

    socket.on("start_conversation", async (otherUserId, callback) => {
      try {
        console.log(socket.userId, otherUserId);
        const conversation = await chatService.createConversation(
          socket.userId,
          otherUserId
        );
        console.log(conversation)
        callback({ success: true, conversation });
      } catch (error) {
        console.log(error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("send_message", async (data, callback) => {
      try {
        const { conversationId, messageType, content } = data;

        const message = await chatService.saveMessage(
          conversationId,
          socket.userId,
          messageType,
          content
        );

        const conversation = await chatService.getConversationById(
          conversationId
        );
        if (conversation) {
          const otherUserId = conversation.participants.find(
            (participant) =>
              participant._id.toString() !== socket.userId.toString()
          );

          if (otherUserId) {
            const otherSocket = userSockets.get(otherUserId._id.toString());
            if (otherSocket) {
              otherSocket.emit("new_message", message);
            }
          }
        }

        callback({ success: true, message });
      } catch (error) {
        if (data.messageType === "image") {
          const conversation = await chatService.getConversationById(
            data.conversationId
          );
          if (conversation) {
            const otherUserId = conversation.participants.find(
              (participant) =>
                participant._id.toString() !== socket.userId.toString()
            );

            if (otherUserId) {
              const otherSocket = userSockets.get(otherUserId._id.toString());
              if (otherSocket) {
                otherSocket.emit("image_upload_failed", {
                  conversationId: data.conversationId,
                  error: error.message,
                });
              }
            }
          }
        }
        callback({ success: false, error: error.message });
      }
    });

    socket.on("get_messages", async (conversationId, callback) => {
      try {
        const messages = await chatService.getConversationMessages(
          conversationId
        );
        console.log(conversationId);
        callback({ success: true, messages });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("get_conversations", async (callback) => {
      try {
        const conversations = await chatService.getUserConversations(
          socket.userId
        );
        callback({ success: true, conversations });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on("get_users", async (callback) => {
      try {
        const users = await authService.getAllUsers(socket.userId);
        callback({ success: true, users });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });
  });
};
