const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/w6database")

  .then(() => {
    console.log("mongodb connected successfully");
  })

  .catch(() => {
    console.log("mongodb failed to connect!");
  });

const LogInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, 
  },
});

const AdminLogInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, 
  },
});

const collection = new mongoose.model("Collection1", LogInSchema);

const adminCollection = new mongoose.model("adminCollection", AdminLogInSchema);

module.exports = { collection, adminCollection };

