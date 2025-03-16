const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    middle_name: {type: String, required: false},
    last_name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profile_pic: {type: String, default: "default.jpg"},
    role_id: {type: mongoose.Schema.Types.ObjectId, ref:"Role", required: true},
    auth_provider: {type: String, enum: ["email", "google", "facebook"], default: "email", required: true},
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },    
}, {timestamps: true});

module.exports = mongoose.model("User", UserSchema)