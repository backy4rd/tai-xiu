module.exports.roll = () => {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
};

module.exports.isOptionValid = option => {
  switch (option) {
    case "tai":
    case "xiu":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "10":
    case "11":
    case "12":
    case "13":
    case "14":
    case "15":
    case "16":
    case "17":
    case "18":
      return true;
  }
  return false;
};

module.exports.xBase = option => {
  switch (option) {
    case "tai":
    case "xiu":
      return 1;
    case "4":
    case "17":
      return 50;
    case "5":
    case "16":
      return 18;
    case "6":
    case "15":
      return 14;
    case "7":
    case "14":
      return 12;
    case "8":
    case "13":
      return 8;
    case "9":
    case "10":
    case "11":
    case "12":
      return 6;
  }
};

module.exports.isWin = (option, point) => {
  if (option === "xiu" && point >= 4 && point <= 10) return true;
  if (option === "tai" && point >= 11 && point <= 17) return true;
  if (parseInt(option) === point) return true;
  return false;
};
