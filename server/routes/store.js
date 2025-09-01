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


// --- Dummy testdata ---
const testCustomer = addCustomer({
  id: "C1",
  name: "Mitchell de Heer",
  email: "mitchell@example.com",
  phone: "0470 12 34 56"
});

const testDog = addDog({
  id: "D1",
  customerId: "C1",
  name: "Seda",
  breed: "Border Collie",
  birthdate: "2023-05-10"
});

const testPass = addPass({
  id: "P1",
  dogId: "D1",
  lessonType: "Puppy Pack",
  totalLessons: 9,
  usedLessons: 2,
  validUntil: "2026-03-11"
});

console.log("✅ Dummy data geladen:", { testCustomer, testDog, testPass });
