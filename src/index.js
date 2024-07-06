const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");

app.use(express.urlencoded({extended:false})) //learn

app.use(express.json());

app.set("view engine", "hbs");

app.listen(3000, function (req, res) {
  console.log("port connected successfully ");
});

app.get("/", function (req, res) {
  res.render("login");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});



app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  await collection.insertMany([data]);

  res.render("home");
});






app.get("/home", function (req, res) {
  console.log("home connected");
  res.render("home");
});
