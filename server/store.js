// store.js

// In-memory opslag
export const store = {
  customers: [],
  dogs: [],
  passes: []
};

// Klant toevoegen
export function addCustomer(customer) {
  store.customers.push(customer);
  return customer;
}

// Hond toevoegen
export function addDog(dog) {
  store.dogs.push(dog);
  return dog;
}

// Strippenkaart toevoegen
export function addPass(pass) {
  store.passes.push(pass);
  return pass;
}

// Strip gebruiken
export function useStrip(passId) {
  const pass = store.passes.find(p => p.id === passId);
  if (!pass) throw new Error("Strippenkaart niet gevonden");

  if (pass.remaining > 0) {
    pass.remaining -= 1;
  } else {
    throw new Error("Geen strippen meer beschikbaar");
  }
  return pass;
}
