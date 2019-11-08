const socket = io();

socket.on("countDown", sec => {
  document.querySelector(".dice").innerText = JSON.stringify(sec);
});

socket.on("roll", _3dice => {
  document.querySelector(".status ul").innerHTML = "";
  document.querySelector(".dice").innerText = JSON.stringify(_3dice);
});

socket.on("yourInfo", ({ username, coin }) => {
  document.querySelector(".username").innerHTML = "username: " + username;
  document.querySelector(".coin").innerHTML = "coin: " + coin;
});

socket.on("result", ({ status, gain }) => {
  document.querySelector(".result").innerHTML = status + ": " + gain;
});

socket.on("err", err => {
  document.querySelector(".result").innerHTML = err;
});

socket.on("bet users", betUsers => {
  document.querySelector(".status ul").innerHTML = "";
  betUsers.forEach(({ username, betInfo: { option, bet } }) => {
    document.querySelector(
      ".status ul"
    ).innerHTML += `<li>${username} bet "${option}" with ${bet} coin</li>`;
  });
});

socket.on("currentCoin", coin => {
  document.querySelector(".coin").innerHTML = "coin: " + coin;
});

document.querySelector(".unbet").onclick = () => {
  socket.emit("bet", { option: "4", bet: 0 });
};

document.querySelector("form").addEventListener("submit", e => {
  e.preventDefault();
  const checkers = [...document.querySelectorAll('input[type="radio"]')];
  if (checkers.every(checker => checker.checked === false)) {
    alert("wrong mn");
    return;
  }
  const checked = checkers.find(checker => checker.checked === true);
  const option = checked.id[0] === "_" ? checked.id.slice(1) : checked.id;

  const bet = document.querySelector('input[type="number"]').value * 1;
  if (!bet && bet !== 0) {
    alert("wrong man");
    return;
  }
  socket.emit("bet", { option, bet });
});
