import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add a method to mark the message as sent
scheduledMessageSchema.methods.markAsSent = async function () {
  this.isSent = true;
  await this.save();
};

const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMessageSchema);

export default ScheduledMessage;
