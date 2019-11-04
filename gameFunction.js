module.exports.roll = () => {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1]
}

module.exports.isWin = (option, point) => {
  if (option === 'xiu' && point >= 4 && point <= 10) return true;
  if (option === 'tai' && point >= 11 && point <= 17) return true;
  return false;
}