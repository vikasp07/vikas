const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users");

// Route to redirect to a default page
router.route("/").get(userController.redirect);

// Routes for signup
router
  .route("/signup")
  .get(userController.renderSignupForm) // Render signup form
  .post(wrapAsync(userController.signup)); // Handle signup logic

// Routes for login
router
  .route("/login")
  .get(userController.renderLoginForm) // Render login form
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login) // Handle login logic
  );

// Route for logout
router.get("/logout", wrapAsync(userController.logout));

module.exports = router;
