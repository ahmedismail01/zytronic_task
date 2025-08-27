const conversationRepo = require("../modules/conversation/repo");
const Message = require("../modules/message/model");
const { v4: uuidv4 } = require("uuid");

class ChatService {
  async createConversation(user1Id, user2Id) {
    try {
      const existingConversation =
        await conversationRepo.getConversationByParticipants([user1Id, user2Id]);

      if (existingConversation) {
        return existingConversation;
      }

      const newConversation = await conversationRepo.createConversation([
        user1Id,
        user2Id,
      ]);

      return newConversation;
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(conversationId, senderId, messageType, content) {
    try {
      const message = new Message({
        conversation_id: conversationId,
        sender: senderId,
        message_type: messageType,
        content: content,
      });

      const savedMessage = await message.save();
      
      await savedMessage.populate('sender', 'username avatar_url');
      
      return savedMessage;
    } catch (error) {
      throw error;
    }
  }

  async getConversationMessages(conversationId, limit = 50) {
    try {
      const messages = await Message.find({ conversation_id: conversationId })
        .populate('sender', 'username avatar_url')
        .sort({ created_at: -1 })
        .limit(limit);
      
      return messages.reverse();
    } catch (error) {
      throw error;
    }
  }

  async getUserConversations(userId) {
    try {
      const conversations = await conversationRepo.getUserConversations(userId);
      
      // Populate participants and last message for each conversation
      const populatedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          await conversation.populate('participants', 'username avatar_url');
          if (conversation.last_message) {
            await conversation.populate('last_message');
          }
          return conversation;
        })
      );
      
      return populatedConversations;
    } catch (error) {
      throw error;
    }
  }

  async getConversationById(conversationId) {
    try {
      const conversation = await conversationRepo.getConversationById(conversationId);
      if (conversation) {
        await conversation.populate('participants', 'username avatar_url');
        if (conversation.last_message) {
          await conversation.populate('last_message');
        }
      }
      return conversation;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ChatService();
