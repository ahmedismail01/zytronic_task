const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  last_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

conversationSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);
