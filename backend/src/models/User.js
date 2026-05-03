import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Email verification fields
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("Users", userSchema);

export default User;
