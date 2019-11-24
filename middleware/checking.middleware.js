const Datastore = require('nedb');

const db = new Datastore("./database/account-storage");

module.exports.isLogin = async (request, response, next) => {
  const _id = request.signedCookies.token;
  db.loadDatabase();
  const [userInfo] = await db.find({ _id });
  if (!userInfo) {
    response.redirect('/login-register');
    return;
  }
  next();
}