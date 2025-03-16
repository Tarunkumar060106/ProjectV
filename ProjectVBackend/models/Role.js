const mongoose = require("mongoose")

const RoleSchema = new mongoose.Schema({
    role_name: {type: String, enum: ["student", "teacher", "admin"], required: true, unique: true},
    permissions: {type: [String], required: true}
}, {timestamps: true, collection: "Role"})

module.exports = mongoose.model("Role", RoleSchema)