func = {
  xBase(option) {
    switch (option) {
      case 'tai':
      case 'xiu':
        return 1;
      case '4':
      case '17':
        return 50;
      case '5':
      case '16':
        return 18;
      case '6':
      case '15':
        return 14;
      case '7':
      case '14':
        return 12;
      case '8':
      case '13':
        return 8;
      case '9':
      case '10':
      case '11':
      case '12':
        return 6;
    }
  },

  isWin(option, point) {
    if (option === 'xiu' && point >= 4 && point <= 10) return true;
    if (option === 'tai' && point >= 11 && point <= 17) return true;
    if (parseInt(option) === point) return true;
    return false;
  }
}



module.exports.isBetInfoValid = (option, bet, userCoin, socket) => {
  //is option valid
  let isOptionValid = false;
  switch (option) {
    case 'tai':
    case 'xiu':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '10':
    case '11':
    case '12':
    case '13':
    case '14':
    case '15':
    case '16':
    case '17':
    case '18':
      isOptionValid = true;
  }
  if (!isOptionValid) return false;
  //is betInfo valid
  if ((!option || !bet) && bet !== 0) return false;
  //is betCoin valid
  if (bet < 0) {
    socket.emit('err', 'invalid bet monney');
    return false;
  }
  if (bet > userCoin) {
    socket.emit('err', 'not enough monney');
    return false;
  }
  return true;
};

module.exports.processBet = (point, betUsers, onlineUsers, io) => {
  betUsers.forEach(({ socketId, username, betInfo: { option, bet } }) => {
    const userInfo = onlineUsers.find(
      onlineUser => onlineUser.username == username
    );

    if (func.isWin(option, point)) {
      const betxbase = bet * func.xBase(option);
      userInfo.coin += betxbase;
      io.to(socketId).emit('result', {
        status: 'you win',
        gain: `+${betxbase} coin`
      });
    } else {
      userInfo.coin -= bet;
      io.to(socketId).emit('result', {
        status: 'you lose',
        gain: `-${bet} coin`
      });
    }

    if (userInfo.coin === 0) userInfo.coin = 2;

    io.to(socketId).emit('currentCoin', userInfo.coin);
  });

  // emptyfy bets
  betUsers.length = 0;
};

module.exports.roll = () => {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
};

