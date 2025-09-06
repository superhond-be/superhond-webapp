// server/store/adminStore.js
const store = {
  users: [], // later vervangen door DB
};

module.exports = {
  getUsers: () => store.users,
  addUser: (u) => { store.users.push(u); return u; },
  count: () => store.users.length,
};
