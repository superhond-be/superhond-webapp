// store.js

// --- Centrale data store ---
const store = {
  customers: [],  // alle klanten
  dogs: [],       // alle honden
  passes: []      // strippenkaarten
};

// --- Functies voor klanten ---
function addCustomer(customer) {
  store.customers.push(customer);
  return customer;
}

function findCustomerById(id) {
  return store.customers.find(c => c.id === id);
}

// --- Functies voor honden ---
function addDog(dog) {
  store.dogs.push(dog);
  return dog;
}

function findDogById(id) {
  return store.dogs.find(d => d.id === id);
}

// --- Functies voor strippenkaarten ---
function addPass(pass) {
  store.passes.push(pass);
  return pass;
}

function findPassById(id) {
  return store.passes.find(p => p.id === id);
}

// --- Exports ---
export { store, addCustomer, findCustomerById, addDog, findDogById, addPass, findPassById };
