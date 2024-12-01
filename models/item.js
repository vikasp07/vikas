const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for Item
const itemSchema = new Schema({
  name: {
    type: String,
    required: true, // Name is required
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  info: {
    type: String,
    default: "No additional information", // Default info if not provided
  },
  category: {
    type: String,
    enum: [
      "grocery",
      "vks_grocery",
      "packaged_food",
      "beverages",
      "home_kitchen",
      "personal_care",
      "beauty_cosmetics",
      "school_supplies",
    ], // Allowed categories
  },
  price: {
    type: Number,
    required: true, // Price is required
    min: 0, // Ensure price is non-negative
  },
  mrp: {
    type: Number,
    required: true, // MRP is required
    min: 0, // Ensure MRP is non-negative
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create the Item model using the schema
const Item = mongoose.model("Item", itemSchema, "items"); // "items" explicitly specifies the collection name

// Export the Item model for use in other files
module.exports = Item;
