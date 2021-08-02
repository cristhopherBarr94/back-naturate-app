const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  create_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creation_date: { type: String, required: false },
  img: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Post", postSchema);
