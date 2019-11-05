require('dotenv').config();
const express = require("express");
const app = express();
const server = app.listen(process.env.PORT, (err, res) => {
  if (err) throw err;
  console.log("server listening port: " + process.env.PORT);
});

const io = require("socket.io")(server);
const Datastore = require("nedb");
const urlDecode = require("urldecode");

const gameFunction = require("./gameFunction");
const tool = require('./tool');

const authenticationRouter = require("./router/authentication.router");
const viewsRouter = require("./router/views.router");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use("/public", express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const db = new Datastore("./database/account-storage");
let betUsers = [];

app.use("/authentication", authenticationRouter);
app.use("/", viewsRouter);

setInterval(() => { 
  const _3dice = gameFunction.roll();
  const point = _3dice[0] + _3dice[1] + _3dice[2];
  //io.emit("roll", _3dice);
  console.log(betUsers);

  betUsers.forEach(({ _id, betInfo: { option, bet } }) => {
    db.loadDatabase();
    db.find({ _id }, (err, [{ coin }]) => {
      if (err) throw err;
      if (gameFunction.isWin(option, point)) {
        coin += bet;
      } else {
        coin -= bet;
      }
      if (coin === 0) coin = 2;
      db.update({ _id }, { $set: { coin } });
    });
  });

  betUsers = [];
}, 20 * 1000);

io.on("connection", socket => {
  //fix signedCookie that was encoded by url encoder
  const cookie = tool.strToObjCookie(socket.handshake.headers.cookie);
  const token = urlDecode(cookie.token);
  const _id = cookieParser.signedCookie(token, process.env.COOKIE_SECRET);
  console.log(_id);
  
  //handle bet
  socket.on("bet", betInfo => {
    if ((!betInfo.option || !betInfo.bet) && betInfo.bet !== 0) return;
    if (betInfo.bet < 0) {
      socket.emit("err", "invalid bet monney");
      return;
    }
    db.loadDatabase();
    db.find({ _id }, (err, [ userInfo ]) => {
      if (err) throw err;
      if (!userInfo) return;
      if (betInfo.bet > userInfo.coin) {
        socket.emit("err", "not enough monney");
        return;
      }
      //handle change bet
      for (let i = 0; i < betUsers.length; i++) {
        if (betUsers[i]._id === _id) {
          betUsers[i].betInfo = betInfo;
          return;
        }
      }
      betUsers.push({ _id, betInfo });
    });
  });
});
