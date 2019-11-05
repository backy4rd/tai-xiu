module.exports.strToObjCookie = strCookie => {
  return strCookie.split(";").reduce((res, c) => {
    const [key, val] = c.trim().split("=").map(decodeURIComponent);
    try {
      return Object.assign(res, { [key]: JSON.parse(val) });
    } catch (e) {
      return Object.assign(res, { [key]: val });
    }
  }, {});
};

module.exports.waitASecond = (callback) => {
  return new Promise((resolve, reject) => {
    callback();
    setTimeout(() => resolve(), 1000);
  })
}