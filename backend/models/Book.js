const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Literature",
        "Business",
        "Test Prep",
        "General",
      ],
      default: "General",
    },
    price: { type: Number, required: true },
    mrp: { type: Number },
    stock: { type: Number, default: 10 },
    rating: { type: Number, default: 4.0 },
    coverColor: { type: String, default: "#4f46e5" },
    description: { type: String, default: "" },
    isbn: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", BookSchema);
