// store.js

// Geheugen-opslag (in-memory database)
export const store = {
  customers: [],
  dogs: [],
  passes: []
};

// 👉 Functie: klant toevoegen
export function addCustomer(customer) {
  store.customers.push(customer);
  return customer;
}

// 👉 Functie: hond toevoegen
export function addDog(dog) {
  store.dogs.push(dog);
  return dog;
}

// 👉 Functie: strippenkaart toevoegen
export function addPass(pass) {
  store.passes.push(pass);
  return pass;
}

// 👉 Functie: strip gebruiken
export function useStrip(passId) {
  const pass = store.passes.find(p => p.id === passId);
  if (!pass) throw new Error("Strippenkaart niet gevonden");

  if (pass.remaining > 0) {
    pass.remaining -= 1;
  } else {
    throw new Error("Geen strippen meer over");
  }
  return pass;
}
