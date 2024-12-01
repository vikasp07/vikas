const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateItem } = require("../middleware.js");
const itemController = require("../controllers/items.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
//Index and Create Item
router
  .route("/")
  .get(wrapAsync(itemController.index))

  .post(
    isLoggedIn,
    upload.single("item[image]"),
    validateItem,
    wrapAsync(itemController.createItem)
  );

// Cart
router.get("/cart", itemController.showCart);
router.post("/cart/add/:id", itemController.addToCart);

//New Route
router.get("/new", isLoggedIn, itemController.renderNewForm);

router.get("/:category", wrapAsync(itemController.categoryItems));

//Search
router.get("/search", wrapAsync(itemController.search));

//Show Item
router
  .route("/:id")
  .get(wrapAsync(itemController.showItem))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("item[image]"),
    validateItem,
    wrapAsync(itemController.updateItem)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(itemController.destroyItem));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(itemController.renderEditForm)
);

// Cart and checkout routes
router.get("/cart", wrapAsync(itemController.showCart));
router.post("/checkout", isLoggedIn, wrapAsync(itemController.checkout));

module.exports = router;
