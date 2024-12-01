const Item = require("../models/item.js");
const Cart = require("../models/cart.js"); // Add a Cart model
const Group = require("../models/group.js");

module.exports.index = async (req, res) => {
  const allItems = await Item.find({});
  const allGroup = await Group.find({});
  res.render("items/index.ejs", { allItems, allGroup });
};

module.exports.renderNewForm = (req, res) => {
  res.render("items/new.ejs");
};

module.exports.showItem = async (req, res) => {
  let { id } = req.params;
  const item = await Item.findById(id).populate("owner");
  if (!item) {
    req.console("error", "Item you requested for does not exist!");
    res.redirect("/items");
  }
  res.render("items/show.ejs", { item });
};

module.exports.createItem = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);

  const newItem = new Item(req.body.item);
  newItem.owner = req.user._id;
  newItem.image = { url, filename };
  let savedItem = await newItem.save();
  console.log(savedItem);
  req.console("success", "New Item Created");
  res.redirect("/vks");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const item = await Item.findById(id);
  if (!item) {
    req.console("error", "Item you requested for does not exist!");
    res.redirect("/vks");
  }

  let originalImageUrl = item.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("items/edit.ejs", { item, originalImageUrl });
};

module.exports.updateItem = async (req, res) => {
  let { id } = req.params;
  let item = await Item.findByIdAndUpdate(id, { ...req.body.item });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    item.image = { url, filename };
    await item.save();
  }

  req.console("success", "Item Updated");
  res.redirect(`/vks/${id}`);
};

module.exports.categoryItems = async (req, res, next) => {
  const { category } = req.params; // Get the category from the URL
  const allItems = await Item.find({ category }); //exec error de sakta hai usko hata do
  if (!allItems.length) {
    req.console("error", "No Items exists for this filter!");
    res.redirect("/vks");
    return;
  }
  res.locals.success = `Items in ${category}`;
  res.render("items/group.ejs", { allItems, category }); // Pass category to the view
};

////////////////////////
module.exports.addToCart = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      req.console("error", "You must be logged in to add items to the cart.");
      return res.redirect("/login");
    }

    const userId = req.user._id; // Logged-in user's ID
    const itemId = req.params.id; // Item to be added
    const item = await Item.findById(itemId);

    if (!item) {
      req.console("error", "Item not found!");
      return res.redirect("/vks");
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ owner: userId });

    // Check if the item is already in the cart
    const existingItem = cart.items.find((cartItem) =>
      cartItem.item.equals(item._id)
    );
    if (existingItem) {
      existingItem.quantity += 1; // Increment quantity
    } else {
      // Add new item to cart
      cart.items.push({
        item: item._id,
        title: item.name,
        price: item.price,
        quantity: 1,
      });
    }

    // Save the cart
    await cart.save();

    req.console("success", `${item.name} has been added to your cart.`);
    res.redirect("/vks/cart");
  } catch (error) {
    console.error("Error adding item to cart:", error);
    req.console("error", "An error occurred while adding the item.");
    res.redirect("/vks");
  }
};

module.exports.showCart = async (req, res) => {
  if (!req.isAuthenticated()) {
    req.console("error", "You must be logged in to view your cart.");
    return res.redirect("/login");
  }

  const userId = req.user._id;
  const cart = await Cart.findOne({ owner: userId }).populate("items.item");

  res.render("items/cart.ejs", { cart: cart.items });
};

///////////

module.exports.destroyItem = async (req, res) => {
  let { id } = req.params;
  let deletedItem = await Item.findByIdAndDelete(id);
  console.log(deletedItem);
  req.console("success", "Item Deleted");
  res.redirect("/items");
};

module.exports.search = async (req, res) => {
  console.log(req.query.q);
  let input = req.query.q.trim().replace(/\s+/g, " "); //remove start and end space
  console.log(input);
  if (input == "" || input == " ") {
    //search value is empty
    req.console("error", "Search value empty!!!");
    res.redirect("/items");
  }

  //convert every word first letter capital and other small
  let data = input.split("");
  let element = "";
  let flag = false;
  for (let index = 0; index < data.length; index++) {
    if (index == 0 || flag) {
      element = element + data[index].toUpperCase();
    } else {
      element = element + data[index].toLowerCase();
    }
    flag = data[index] == " ";
  }
  console.log(element);

  let allItems = await Item.find({
    title: { $regex: element, $options: "i" },
  });
  if (allItems.length != 0) {
    res.locals.success = "Items searched by title";
    res.render("items/index.ejs", { allItems });
    return;
  }
  if (allItems.length == 0) {
    allItems = await Item.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allItems.length != 0) {
      res.locals.success = "Items searched by category";
      res.render("items/index.ejs", { allItems });
      return;
    }
  }
  if (allItems.length == 0) {
    allItems = await Item.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allItems.length != 0) {
      res.locals.success = "Items searched by country";
      res.render("items/index.ejs", { allItems });
      return;
    }
  }
  if (allItems.length == 0) {
    allItems = await Item.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allItems.length != 0) {
      res.locals.success = "Items searched by location";
      res.render("items/index.ejs", { allItems });
      return;
    }
  }

  const intValue = parseInt(element, 10); //10 for decimal return - int ya NaN
  const intDec = Number.isInteger(intValue); //check intValue is number or not

  if (allItems.length == 0 && intDec) {
    allItems = await Item.find({ price: { $lte: element } }).sort({
      price: 1,
    });
    if (allItems.length != 0) {
      res.locals.success = `Items searched for less than Rs ${element}`;
      res.render("items/index.ejs", { allItems });
      return;
    }
  }
  if (allItems.length == 0) {
    req.console("error", "Items is not here !!!");
    res.redirect("/items");
  }
};
