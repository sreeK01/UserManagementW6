const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");

app.use(express.json())

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
