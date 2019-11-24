require('dotenv').config();
const express = require('express');
const app = express();
const server = app.listen(process.env.PORT, (err, res) => {
  if (err) throw err;
  console.log('server listening port: ' + process.env.PORT);
});

const io = require('socket.io')(server);
const Datastore = require('nedb');
const urlDecode = require('urldecode');

const gameFunction = require('./gameFunction');
const tool = require('./tool');

const authenticationRouter = require('./router/authentication.router');
const viewsRouter = require('./router/views.router');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const db = new Datastore('./database/account-storage');
let onlineUsers = [];
let betUsers = [];

app.use('/authentication', authenticationRouter);
app.use('/', viewsRouter);

setInterval(async () => {
  for (let i = 15; i >= 0; i--) {
    await tool.waitASecond(() => io.emit('countDown', i));
  }

  const _3dice = gameFunction.roll();
  const point = _3dice[0] + _3dice[1] + _3dice[2];
  await tool.waitASecond(() => io.emit('roll', _3dice));

  gameFunction.processBet(point, betUsers, onlineUsers, io);
  betUsers = [];
}, 20 * 1000);

io.on('connection', async socket => {
  //fix signedCookie that was encoded by url encoder
  const cookie = tool.strToObjCookie(socket.handshake.headers.cookie);
  const token = urlDecode(cookie.token);
  const _id = cookieParser.signedCookie(token, process.env.COOKIE_SECRET);
  const socketId = socket.id;

  //store user information to session
  db.loadDatabase();
  const [userInfo] = await db.find({ _id });
  onlineUsers.push(userInfo);
  console.log(userInfo.username + ' login to server!');

  //show old status to user just connect
  io.emit('bet users', betUsers);

  //show username and coin to client
  socket.emit('yourInfo', { username: userInfo.username, coin: userInfo.coin });

  //handle bet
  socket.on('bet', betInfo => {
    const { option, bet } = betInfo;
    const { username, coin } = userInfo;
    if (!gameFunction.isBetInfoValid(option, bet, coin, socket)) return;
    //handle change bet
    for (let i = 0; i < betUsers.length; i++) {
      if (betUsers[i].username === username) {
        //delete bet
        if (bet === 0) {
          betUsers = betUsers.filter(betUser => betUser.username !== username);
          io.emit('bet users', betUsers);
          return;
        }
        betUsers[i].betInfo = betInfo;
        io.emit('bet users', betUsers);
        return;
      }
    }
    betUsers.push({ socketId, username, betInfo });
    io.emit('bet users', betUsers);
  });

  socket.on('disconnect', () => {
    const disconnectUser = onlineUsers.find(
      onlineUser => onlineUser._id === _id
    );
    if (disconnectUser.coin) {
      db.loadDatabase();
      db.update({ _id }, { $set: { coin: disconnectUser.coin } });
    }
    betUsers = betUsers.filter(betUser => betUser.username !== disconnectUser.username);
    io.emit('bet users', betUsers);
    onlineUsers = onlineUsers.filter(onlineUser => onlineUser.username !== disconnectUser.username);
  });
});
