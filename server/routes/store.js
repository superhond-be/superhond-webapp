// server/store.js

// Simpele in-memory store
export const store = {
  customers: [],
  dogs: [],
  passes: []
};

// ----------------------
// Customer functies
// ----------------------
export function addCustomer(customer) {
  customer.id = store.customers.length + 1;
  store.customers.push(customer);
  return customer;
}

export function findCustomerById(id) {
  return store.customers.find(c => c.id === id);
}

// ----------------------
// Dog functies
// ----------------------
export function addDog(dog) {
  dog.id = store.dogs.length + 1;
  store.dogs.push(dog);
  return dog;
}

export function findDogById(id) {
  return store.dogs.find(d => d.id === id);
}

// ----------------------
// Pass (strippenkaart) functies
// ----------------------
export function addPass(pass) {
  pass.id = store.passes.length + 1;
  pass.remaining = pass.remaining || 0; // standaard geen strippen
  store.passes.push(pass);
  return pass;
}

export function findPassById(id) {
  return store.passes.find(p => p.id === id);
}

export function useStrip(passId) {
  const pass = findPassById(passId);
  if (pass && pass.remaining > 0) {
    pass.remaining -= 1;
    return pass;
  }
  return null;
}
