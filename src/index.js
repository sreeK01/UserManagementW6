const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");

// Middleware setup
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(nocache()); // Disable caching

// Database connection (assuming userCollection and adminCollection are properly imported)
const { userCollection, adminCollection } = require("./mongodb");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// View engine setup
app.set("view engine", "hbs");
// app.set("views", path.join(__dirname, "views"));

// Server listening on port 3000
app.listen(3000, () => {
  console.log("Server connected successfully on port 3000");
});

// Root route - login or home based on session
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.render("login", { msg: req.session.msg });
    req.session.msg = null; // Clear the error message after displaying it
  }
});

// Signup page
app.get("/signup", (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.render("signup");
  }
});

// Admin login and signup pages
app.get("/admin", (req, res) => {
  if (req.session.admin) {
    res.redirect("/adminHome");
  } else {
    res.render("adminLogin", { msg: req.session.adminMsg });
    req.session.adminMsg = null; // Clear the error message after displaying it
  }
});

// Admin signup look compare >>

app.get("/adminSignup", (req, res) => {
  res.render("adminSignup");
});

// User signup
app.post("/signup", async (req, res) => {
  const { name, password } = req.body;

  // Check if user is already authenticated
  if (req.session.user) {
    return res.redirect("/home");
  }

  try {
    // Check if the user already exists
    const existingUser = await userCollection.findOne({ name });
    if (existingUser) {
      req.session.msg = "User already exists. Please choose a different name.";
      res.redirect("/");
    } else {
      // Insert the new user into the database
      await userCollection.insertMany([{ name, password }]);
      req.session.user = name; // Set session for the new user
      res.redirect("/home");
    }
  } catch (error) {
    console.error("Error signing up user:", error);
    res.render("signup", { msg: "Error signing up. Please try again." });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await userCollection.findOne({ name });
    if (user && user.password === password) {
      req.session.user = name; // Set session
      res.redirect("/home");
    } else {
      req.session.msg = "Wrong credentials";
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    req.session.msg = "You are not registered. Please create an account.";
    res.redirect("/");
  }
});

// Home route - check session for user
app.get("/home", (req, res) => {
  if (req.session.user) {
    res.render("home", { user: req.session.user });
  } else {
    res.redirect("/");
  }
});

// Admin signup
app.post("/adminSignup", async (req, res) => {
  const { name, password } = req.body;
  try {
    await adminCollection.insertMany({ name, password });
    req.session.admin = name; // Set session for the new admin
    res.redirect("/adminHome");
  } catch (error) {
    console.error("Error signing up admin:", error);
    res.render("adminSignup", {
      msg: "Error signing up admin. Please try again.",
    });
  }
});

// Admin login
app.post("/adminLogin", async (req, res) => {
  const { name, password } = req.body;
  try {
    const admin = await adminCollection.findOne({ name });
    if (admin && admin.password === password) {
      req.session.admin = name; // Set session
      res.redirect("/adminHome");
    } else {
      req.session.adminMsg = "Wrong credentials";
      res.redirect("/admin");
    }
  } catch (error) {
    console.error("Error logging in admin:", error);
    req.session.adminMsg = "You are not registered. Please create an account.";
    res.redirect("/admin");
  }
});

// Admin home route - check session for admin
app.get("/adminHome", (req, res) => {
  if (req.session.admin) {
    res.render("adminHome", { admin: req.session.admin });
  } else {
    res.redirect("/admin");
  }
});

// User logout
app.get("/userlogout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/home");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/");
  });
});

// Admin logout
app.get("/adminlogout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying admin session:", err);
      return res.redirect("/adminHome");
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/admin");
  });
});
