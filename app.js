if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Item = require("./models/item.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const bodyparser = require("body-parser");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const {
  setCurrUser,
  setSuccess,
  setError,
  initializeCart,
  ensureCartExists,
} = require("./middleware");
const itemRouter = require("./routes/item");
// const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const Group = require("./models/group.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/vikas";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.use(setCurrUser);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET || "thisshouldbeabettersecret!",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success") || null;
  res.locals.error = req.flash("error") || null;
  res.locals.currUser = req.user || null;
  // res.locals.cart = req.locals;
  next();
});

app.use("/vks", itemRouter);
app.use("/", userRouter);
app.use(initializeCart);
app.use(ensureCartExists);

// app.post("/payment", function (req, res) {
//   // Moreover you can take more details from user
//   // like Address, Name, etc from form
//   stripe.customers
//     .create({
//       email: req.body.stripeEmail,
//       source: req.body.stripeToken,
//       name: "Gourav Hammad",
//       address: {
//         line1: "TC 9/4 Old MES colony",
//         postal_code: "452331",
//         city: "Indore",
//         state: "Madhya Pradesh",
//         country: "India",
//       },
//     })
//     .then((customer) => {
//       return stripe.charges.create({
//         amount: 2500, // Charging Rs 25
//         description: "Web Development Product",
//         currency: "INR",
//         customer: customer.id,
//       });
//     })
//     .then((charge) => {
//       res.send("Success"); // If no error occurs
//     })
//     .catch((err) => {
//       res.send(err); // If some error occurs
//     });
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});
// app.get("/vks/cart", (req, res) => {
//   const cart = req.session.cart; // Use session or a global cart object if needed
//   res.render("cart", { cart });
// });

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
