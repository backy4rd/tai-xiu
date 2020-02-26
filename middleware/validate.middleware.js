const Datastore = require('../nedb');
const bcrypt = require('bcrypt');

const db = new Datastore('./database/account-storage');

module.exports.validateRegister = async (request, response, next) => {
  const { username, password, confirmPassword } = request.body;
  let error = [];
  if (password !== confirmPassword) {
    error.push('confirm password does not match');
  }
  if (/\s/.test(password)) {
    error.push("password can not contain 'space' charater");
  }
  if (password.length < 5) {
    error.push('password must contain at least 5 charater');
  }
  if (username.length < 5) {
    error.push('username must contain at least 5 charater');
  }
  if (
    JSON.stringify(username.match(/[\w_\.]+/)) !== JSON.stringify([username])
  ) {
    error.push(
      'username just contain alpabelt, number, dot(.) and underline(_)'
    );
  }
  db.loadDatabase();
  const [userInfo] = await db.find({ username });
  console.log(userInfo);
  if (userInfo) {
    error.push('username already exist');
  }
  if (error.length !== 0) {
    response.send({ error });
    return;
  }
  next();
};

module.exports.validateLogin = async (request, response, next) => {
  const { username, password } = request.body;
  db.loadDatabase();
  const [userInfo] = await db.find({ username });
  if (!userInfo) {
    response.send({ error: 'account not exist'});
    return;
  }
  const isLoginTrue = bcrypt.compareSync(password, userInfo.hashPassword);
  if (!isLoginTrue) {
    response.send({ error: 'invalid account' });
    return;
  }
  request._id = userInfo._id;
  next();
};
