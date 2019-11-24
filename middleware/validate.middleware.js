const Datastore = require("nedb");
const sha256 = require("sha256");

const db = new Datastore("./database/account-storage");

module.exports.validateRegister = async (request, response, next) => {
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
  db.loadDatabase();
  const [result] = await db.find({ username })
  if (result) {
    error.push("username already exist");
  }
  if (error.length !== 0) {
    response.send({ error });
    return;
  }
  next();
};

module.exports.validateLogin = async (request, response, next) => {
  db.loadDatabase();
  const { username, password } = request.body;
  const hashPassword = sha256(password);
  const [result] = await db.find({ username, hashPassword });
  if (!result) {
    response.send({ error: "invalid account" });
    return;
  }
  request.id = result[0]._id;
  next();
};
