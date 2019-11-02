const Datastore = require("nedb");
const sha256 = require("sha256");

module.exports.validateRegister = (request, response, next) => {
  const db = new Datastore("./database/account-storage");
  db.loadDatabase();
  const { username, password, confirmPassword } = request.body;
  let error = [];
  if (password !== confirmPassword) {
    error.push("confirm password does not match");
  }
  if (/\s/.test(password)) {
    error.push("password can not contain 'space' charater");
  }
  if (username.length < 5) {
    error.push("username must contain at least 5 charater");
  }
  if (password.length < 5) {
    error.push("password must contain at least 5 charater");
  }
  if (
    JSON.stringify(username.match(/[\w_\.]+/)) !== JSON.stringify([username])
  ) {
    error.push(
      "username just contain alpabelt, number, dot(.) and underline(_)"
    );
  }
  db.find({ username }, (err, result) => {
    if (err) throw err;
    if (result.length !== 0) {
      error.push("username already exist");
    }
    if (error.length !== 0) {
      response.send({ error });
      return;
    }
    next();
  });
};

module.exports.validateLogin = (request, response, next) => {
  const db = new Datastore("./database/account-storage");
  db.loadDatabase();
  const { username, password } = request.body;
  const hashPassword = sha256(password);
  db.find({ username, hashPassword }, (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      response.send({ error: "invalid account" });
      return;
    }
    request.id = result[0]._id;
    next();
  });
};
