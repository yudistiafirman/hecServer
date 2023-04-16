const {
  getUsers,
  registerUsers,
  loginUsers,
} = require("../controllers/authControllers");

const route = require("express").Router();

route.get("/all", getUsers);
route.post("/register", registerUsers);
route.post("/login", loginUsers);

module.exports = route;
