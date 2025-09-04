// server/dogs.js

const { readJSON } = require('./helpers');

const FILE = 'dogs.json';

// Vind hond op ID
function findDog(id) {
  const list = readJSON(FILE, []);
  return list.find(d => d.id === id) || null;
}

// Vind honden van een bepaalde klant
function findDogsByClient(client_id) {
  const list = readJSON(FILE, []);
  return list.filter(d => d.client_id === client_id);
}

module.exports = {
  findDog,
  findDogsByClient
};
