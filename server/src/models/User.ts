import mongoose, { Document, Schema } from "mongoose";

export interface iUser extends Document {
  name: string;
  email: string;
  image: string;
  subscription: Date | null;
  freeRequestsUsed: number;

  hasProAccess(): boolean;
  canMakeRequest(): boolean;
}

const UserSchema: Schema<iUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      required: true,
    },

    subscription: {
      type: Date,
      default: null,
    },

    freeRequestsUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Checks if user subscription is still active
UserSchema.methods.hasProAccess = function (): boolean {
  return !!this.subscription && new Date() < new Date(this.subscription);
};

// Checks if user can use AI feature
UserSchema.methods.canMakeRequest = function (): boolean {
  return this.hasProAccess() || this.freeRequestsUsed < 3;
};

const User = mongoose.model<iUser>("User", UserSchema);

export default User;
