// Load environment variables if not in production
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const initItemData = require("./data.js"); // Assuming data.js has item data
const initGroupData = require("./group.js"); // Assuming group.js has group data
const Item = require("../models/item.js");
const Group = require("../models/group.js"); // Importing the Group model

const MONGO_URL = "mongodb://127.0.0.1:27017/vikas";

// Connect to MongoDB
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Initialize data for Item and Group collections
const initDB = async () => {
  // Initialize Items
  await Item.deleteMany({}); // Clear existing Item data
  await Item.insertMany(
    initItemData.data.map((obj) => ({
      ...obj,
      owner: "673adab6a72f2434c12c9cdc",
    }))
  ); // Insert new Item data
  console.log("Item data was initialized");

  // Initialize Groups
  await Group.deleteMany({}); // Clear existing Group data
  await Group.insertMany(
    initGroupData.data.map((obj) => ({
      ...obj,
      owner: "673adab6a72f2434c12c9cdc",
    }))
  ); // Insert new Group data
  console.log("Group data was initialized");
};

// Call the initDB function to initialize the database
initDB();
