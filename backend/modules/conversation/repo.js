const Conversation = require("./model");
class ConversationRepository {
  constructor() {
    this.model = Conversation;
  }

  async createConversation(participants) {
    const conversation = new this.model({
      participants,
    });

    conversation.save();

    await conversation.populate("participants", "username avatar_url");

    return conversation;
  }

  async getConversationById(id) {
    return this.model.findById(id);
  }

  async getConversationByParticipants(participants) {
    const conversation = await this.model.findOne({
      participants: { $all: participants },
    });

    if (!conversation) {
      console.log("No conversation found");
      return null;
    }

    await conversation.populate("participants", "username avatar_url");
    await conversation.populate("last_message");

    return conversation;
  }

  async getUserConversations(participant) {
    const conversation = await this.model
      .find({
        participants: { $in: [participant] },
      })
      .populate("last_message", "content message_type sender created_at")
      .populate("participants", "username avatar_url");
    return conversation;
  }
}

module.exports = new ConversationRepository();
