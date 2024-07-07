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

//nocache
app.use(nocache());



const { userCollection, adminCollection } = require("./mongodb");

app.use(express.urlencoded({ extended: false })); //learn

app.use(express.json());

app.set("view engine", "hbs");

app.listen(3000, function (req, res) {
  console.log("port connected successfully ");
});

app.get("/", function (req, res) {


  //session

  if (req.session.user) {
    res.render("home");
  } else {
    res.render("login");
  }
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

//Admin get >>

app.get("/admin", function (req, res) {
  res.render("adminLogin");
});

app.get("/adminSignup", function (req, res) {
  res.render("adminSignup");
});
//Admin get <<

//<<< USER signup and login

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  await userCollection.insertMany([data]);

  res.render("home");
});

app.post("/login", async (req, res) => {
  try {
    const check = await userCollection.findOne({ name: req.body.name });

    if (check.password === req.body.password) {
      //session
      req.session.user = req.body.name;

      res.render("home");
    } else {
      res.render("login", { msg: "Wrong password" });
    }
  } catch {
    res.render("login", {
      msg: "You are not registered. Please create account ",
    });
  }
});

app.get("/home", function (req, res) {
  console.log("home connected");
  res.render("home");
});

// USER signup and login }}}

// {{{ ADMIN signup and login

app.post("/adminSignup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  await adminCollection.insertMany([data]);

  res.render("adminHome");
});

app.post("/adminLogin", async (req, res) => {
  try {
    const check = await adminCollection.findOne({ name: req.body.name });

    if (check.password === req.body.password) {
      res.render("adminHome");
    } else {
      res.send("Wrong password");
    }
  } catch {
    res.send("You are not registered");
  }
});

app.get("/home", function (req, res) {
  console.log("home connected");
  res.render("home");
});

// ADMIN signup and login >>

//USER logout>>

app.get("/userlogout", (req, res) => {
  res.redirect("/");
});
