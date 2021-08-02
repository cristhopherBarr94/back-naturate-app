// import mongoose
const mongoose = require("mongoose");
// import unique validator from mongoose
const uniqueValidator = require("mongoose-unique-validator");

// create user schema to storage front end incomming data
const userSchema = mongoose.Schema({
  user_name: { type: String, required: false },
  user_last_name: { type: String, required: false },
  user_intro: { type: String, required: false },
  user_photo: { type: String, required: false },
  user_banner: { type: String, required: false },
  user_email: { type: String, required: true, unique: true },
  user_password: { type: String, required: true },
  user_role: { type: String, required: true },
});

// add a plug in to ther user squema in order to validad the unique email
// it returns an error if exist an user created previously with this email

userSchema.plugin(uniqueValidator);

// create and export the model

module.exports = mongoose.model("User", userSchema);
