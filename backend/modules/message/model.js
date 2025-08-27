const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message_type: {
    type: String,
    enum: ["text", "image", "voice"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ conversation_id: 1, created_at: -1 });

messageSchema.post("save", async function (doc) {
  try {
    await mongoose
      .model("Conversation")
      .findByIdAndUpdate(doc.conversation_id, {
        last_message: doc._id,
        updated_at: Date.now(),
      });
  } catch (error) {
    console.error("Error updating conversation:", error);
  }
});

module.exports = mongoose.model("Message", messageSchema);
