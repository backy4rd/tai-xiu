const express = require("express");
const app = express();
const PORT = 5000;
const secret = "285xKOPfNhBBjfoD";
const server = app.listen(PORT, (err, res) => {
  if (err) throw err;
  console.log("server listening port: " + PORT);
});

const io = require("socket.io")(server);
const Datastore = require("nedb");
const urlDecode = require("urldecode");

const gameFunction = require("./gameFunction");

const authenticationRouter = require("./router/authentication.router");
const viewsRouter = require("./router/viewsRouter.router");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use("/public", express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(secret));

const db = new Datastore("./database/account-storage");
db.loadDatabase();
let betUsers = [];

app.use("/authentication", authenticationRouter);
app.use("/", viewsRouter);

setInterval(() => {
  const _3dice = gameFunction.roll();
  const point = _3dice[0] + _3dice[1] + _3dice[2];
  //io.emit("roll", _3dice);
  console.log(betUsers);
  betUsers.forEach(betUser => {
    const _id = betUser._id;
    db.find({ _id }, (err, [{ coin }]) => {
      if (err) throw err;
      if (gameFunction.isWin(betUser.betInfo.option, point)) {
        coin += betUser.betInfo.bet;
        console.log('you win: ' + coin);
      } else {
        coin -= betUser.betInfo.bet;
        console.log('you lose: ' + coin);
      }
      if (coin === 0) coin = 2;
      db.update({ _id }, { $set: { coin }});
    })
  })
  betUsers = [];
}, 20 * 1000);

io.on("connection", socket => {
  const token = urlDecode(
    socket.handshake.headers.cookie.match(/(?<=token=).+?(?=(;|$))/)[0]
  );
  const _id = cookieParser.signedCookie(token, secret);
  console.log(_id);

  //handle bet
  socket.on("bet", betInfo => {
    if ((!betInfo.option || !betInfo.bet) && betInfo.bet !== 0) return;
    db.find({_id}, (err, [userInfo]) => {
      if (err) throw err;
      if (betInfo.bet > userInfo.coin) {
        socket.emit("err", "not enough monney");
        return;
      }
      if (betInfo.bet < 0) {
        socket.emit('err', "invalid bet monney");
        return;
      }
      //handle change bet
      for (let i = 0; i < betUsers.length; i++) {
        const betUser = betUsers[i];
        if (betUser._id === _id) {
          betUser.betInfo = betInfo;
          // console.log(betUsers);
          return;
        }
      }
      
      betUsers.push({ _id, betInfo });
      // console.log(betUsers);
    })
  });
});