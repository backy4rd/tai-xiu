const express = require("express");
const router = express.Router();

const Datastore = require("nedb");
const sha256 = require("sha256");

const validateMiddleware = require("../middleware/validate.middleware");

router.post(
  "/register",
  validateMiddleware.validateRegister,
  //add new user to database
  (request, response) => {
    const db = new Datastore("./database/account-storage");
    db.loadDatabase();
    const { username, password } = request.body;
    const hashPassword = sha256(password);
    db.insert({ username, hashPassword, coin: 20 }, (err, res) => {
      if (err) throw err;
      response.cookie("token", res._id, {
        maxAge: 3600 * 1000,
        signed: true
      });
      response.redirect("/");
    });
  }
);

router.post("/login", validateMiddleware.validateLogin, (request, response) => {
  response.cookie("token", request.id, {
    maxAge: 3600 * 1000,
    signed: true
  });
  response.redirect("/");
});

module.exports = router;
