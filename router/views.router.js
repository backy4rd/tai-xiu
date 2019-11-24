const express = require('express');
const router = express.Router();

const checkingMiddleware = require('../middleware/checking.middleware');

router.get('/', checkingMiddleware.isLogin, (request, response) => {
  response.sendFile(process.cwd() + '/views/index.html');
});

router.get('/login-register', (request, response) => {
  response.sendFile(process.cwd() + '/views/login-register.html');
});

module.exports = router;
