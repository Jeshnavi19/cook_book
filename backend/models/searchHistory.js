const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    searchQuery: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("SearchHistory", historySchema);
