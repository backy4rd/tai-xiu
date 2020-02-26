const nedb = require('nedb');

class DataStore extends nedb {
  constructor(storage) {
    super(storage);
  }

  find(finder) {
    return new Promise((resolve, reject) => {
      super.find(finder, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
    })
  }

  update(finder, updater) {
    super.update(finder, updater);
  }

  insert(data) {
    return new Promise((resolve, reject) => {
      super.insert(data, (err, newData) => {
        if (err) reject(err);
        else resolve(newData);
      })
    })
  }
}

module.exports = DataStore;
