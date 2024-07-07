const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

// Use nocache to disable caching
app.use(nocache());

const { userCollection, adminCollection } = require("./mongodb");

app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies
app.use(express.json()); // To parse JSON bodies

app.set("view engine", "hbs");

// Server listening on port 3000
app.listen(3000, function (req, res) {
  console.log("Server connected successfully on port 3000");
});

// Root route - login or home based on session
app.get("/", function (req, res) {
  if (req.session.user) {
    res.render("home");
  } else {
    res.render("login", { msg: req.session.msg });
    req.session.msg = null; // Clear the error message after displaying it
  }
});

// Signup page
app.get("/signup", function (req, res) {
  res.render("signup");
});

// Admin login and signup pages
app.get("/admin", function (req, res) {
  res.render("adminLogin", { msg: req.session.adminMsg });
  req.session.adminMsg = null; // Clear the error message after displaying it
});

app.get("/adminSignup", function (req, res) {
  res.render("adminSignup");
});

// User signup
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  await userCollection.insertMany([data]);
  req.session.user = req.body.name; // Set session for the new user
  res.redirect("/home");
});

// User login
app.post("/login", async (req, res) => {
  try {
    const check = await userCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      req.session.user = req.body.name; // Set session
      res.redirect("/home");
    } else {
      req.session.msg = "Wrong password";
      res.redirect("/");
    }
  } catch {
    req.session.msg = "You are not registered. Please create an account.";
    res.redirect("/");
  }
});

// Home route - check session
app.get("/home", function (req, res) {
  if (req.session.user) {
    res.render("home");
  } else {
    res.redirect("/");
  }
});

// Admin signup
app.post("/adminSignup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  await adminCollection.insertMany([data]);
  req.session.admin = req.body.name; // Set session for the new admin
  res.redirect("/adminHome");
});

// Admin login
app.post("/adminLogin", async (req, res) => {
  try {
    const check = await adminCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      req.session.admin = req.body.name; // Set session
      res.redirect("/adminHome");
    } else {
      req.session.adminMsg = "Wrong password";
      res.redirect("/admin");
    }
  } catch {
    req.session.adminMsg = "You are not registered. Please create an account.";
    res.redirect("/admin");
  }
});
 
// Admin home route - check session
app.get("/adminHome", function (req, res) {
  if (req.session.admin) {
    res.render("adminHome");
  } else {
    res.redirect("/admin");
  }
});

// User logout
app.get("/userlogout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("/home");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/");
  });
});

// Admin logout
app.get("/adminlogout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("/adminHome");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/admin");
  });
});
