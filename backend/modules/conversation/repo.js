const Conversation = require("./model");
class ConversationRepository {
  constructor() {
    this.model = Conversation;
  }

  async createConversation(participants) {
    const conversation = new this.model({
      participants,
    });
    return conversation.save();
  }

  async getConversationById(id) {
    return this.model.findById(id);
  }

  async getConversationByParticipants(participants) {
    return this.model.findOne({
      participants: {
        $all: participants,
      },
    });
  }

  async getUserConversations(participant) {
    return this.model.find({
      participants: {
        $in: [participant],
      },
    });
  }
}

module.exports = new ConversationRepository();
