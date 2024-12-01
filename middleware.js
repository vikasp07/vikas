const Item = require("./models/item");
// const Review = require("./models/review");
const Cart = require("./models/cart");
const { itemSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");

module.exports.setCurrUser = (req, res, next) => {
  res.locals.currUser = req.user || null;
  next();
};

module.exports.setSuccess = (req, res, next) => {
  res.locals.success = req.flash("success") || null;
  next();
};

// module.exports.initializeCart = (req, res, next) => {
//   if (!req.session.cart) {
//     req.session.cart = [];
//   }
//   res.locals.cart = req.locals.cart; // Make the cart available to all views
//   next();
// };

module.exports.ensureCartExists = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id;
    let cart = await Cart.findOne({ owner: userId });
    if (!cart) {
      cart = new Cart({ owner: userId, items: [] }); // Create an empty cart
      await cart.save();
    }
  }
  next();
};

module.exports.setError = (req, res, next) => {
  res.locals.error = req.flash("error") || null;
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a item");
    return res.redirect("/login");
  }
  next();
};

module.exports.initializeCart = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const userId = req.user._id;
    let cart = await Cart.findOne({ owner: userId }).populate("items.item");
    if (!cart) {
      cart = new Cart({ owner: userId, items: [] });
      await cart.save();
    }
    req.session.cart = cart;
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item.owner._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this item");
      return res.redirect(`/vks/${id}`);
    }
    next();
  } catch (error) {
    const errorMessage = "Page does not exist anymore";
    const err = new ExpressError(400, errorMessage);
    next(err);
  }
};

module.exports.validateItem = (req, res, next) => {
  const { error } = itemSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/vks/${id}`);
  }
  next();
};
