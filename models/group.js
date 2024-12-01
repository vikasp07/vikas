const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the schema for Group
const groupSchema = new Schema({
  name: {
    type: String,
    required: true, // Name is required
  },
  image: {
    type: String,
    required: true, // Image is required
  },
  category: {
    type: [String], // Array of categories (strings)
    required: true, // Category is required
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create the Group model using the schema
const Group = mongoose.model("Group", groupSchema, "groups"); // "groups" explicitly specifies the collection name

// Export the Group model for use in other files
module.exports = Group;
