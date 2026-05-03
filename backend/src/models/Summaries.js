import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoTitle: {
      type: String,
      required: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
    },

    transcript: {
      type: String,
    },

    summary: [
      {
        prompt: {
          type: String,
          required: true,
        },
        response: {
          type: String,
        },
        modelUsed: {
          type: String,
          default: "gpt-4",
        },
        timestamps: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Summaries", summarySchema);
