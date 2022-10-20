const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/users.json');

let users = JSON.parse(fs.readFileSync(dbPath));

const findUser = (userid, password) => users.find(user => user.id === userid && user.password === password);

const addUser = userData => {
  users = [...users, userData];
  fs.writeFileSync(dbPath, JSON.stringify(users));
};

module.exports = { findUser, addUser };
