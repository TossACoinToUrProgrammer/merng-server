const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  username: String,
  img: String,
  password: String,
  email: String,
  createdAt: String,
  follows: [String],
  followers: [String],
});

module.exports = model("User", userSchema);
