const express = require("express");
const app = express();
const PORT = 5000;
const server = app.listen(PORT, (err, res) => {
  if (err) throw err;
  console.log("server listening port: " + PORT);
});

const authenticationRouter = require("./router/authentication.router");
const viewsRouter = require("./router/viewsRouter.router");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Datastore = require("nedb");

app.use("/public", express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("285xKOPfNhBBjfoD"));

const db = new Datastore("./database/account-storage");
db.loadDatabase();

app.use("/authentication", authenticationRouter);
app.use("/", viewsRouter);
