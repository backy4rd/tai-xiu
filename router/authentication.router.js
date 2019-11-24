const express = require('express');
const router = express.Router();

const Datastore = require('nedb');
const bcrypt = require('bcrypt');

const validateMiddleware = require('../middleware/validate.middleware');

router.post(
  '/register',
  validateMiddleware.validateRegister,
  //add new user to database
  async (request, response) => {
    const db = new Datastore('./database/account-storage');
    db.loadDatabase();
    const { username, password } = request.body;
    const hashPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );
    const { _id } = await db.insert({ username, hashPassword, coin: 20 });
    response.cookie('token', _id, {
      maxAge: 3 * 3600 * 1000,
      signed: true
    });
    response.redirect('/');
  }
);

router.post('/login', validateMiddleware.validateLogin, (request, response) => {
  response.cookie('token', request._id, {
    maxAge: 3 * 3600 * 1000,
    signed: true
  });
  response.redirect('/');
});

module.exports = router;
