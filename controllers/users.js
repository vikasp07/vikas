const User = require("../models/user");

// Redirect to the default page
module.exports.redirect = (req, res) => {
  res.redirect("/vks");
};

// Handle signup logic
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/vks");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render the login form
module.exports.renderLoginForm = (req, res) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.render("users/login.ejs");
};

module.exports.renderSignupForm = (req, res) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.render("users/signup.ejs");
};

// Handle login logic
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.redirectUrl || "/vks";

  // Sync the user's cart
  if (req.body.cart) {
    for (const item of req.body.cart) {
      const user = await User.findById(req.user._id);
      const existingItem = user.cart.find(
        (cartItem) => cartItem.itemId === item.itemId
      );

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        user.cart.push(item);
      }

      await user.save();
    }
  }

  res.redirect(redirectUrl);
};

// Handle logout logic
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/vks");
  });
};
