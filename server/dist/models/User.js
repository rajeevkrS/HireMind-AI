import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
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
}, { timestamps: true });
// Checks if user subscription is still active
UserSchema.methods.hasProAccess = function () {
    return !!this.subscription && new Date() < new Date(this.subscription);
};
// Checks if user can use AI feature
UserSchema.methods.canMakeRequest = function () {
    return this.hasProAccess() || this.freeRequestsUsed < 3;
};
const User = mongoose.model("User", UserSchema);
export default User;
