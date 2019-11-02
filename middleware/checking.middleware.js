module.exports.isLogin = (request, response, next) => {
  if (!request.signedCookies.token) {
    response.redirect('/login-register');
    return;
  }
  next();
}