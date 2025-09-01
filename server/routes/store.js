// server/routes/store.js

// In-memory opslag
export const store = {
  customers: [],   // lijst van klanten
  dogs: [],        // lijst van honden
  passes: []       // lijst van strippenkaarten
};

// 👉 Functie om een klant toe te voegen
export function addCustomer(customer) {
  store.customers.push(customer);
  return customer;
}

// 👉 Functie om een hond toe te voegen
export function addDog(dog) {
  store.dogs.push(dog);
  return dog;
}

// 👉 Functie om een strippenkaart toe te voegen
export function addPass(pass) {
  store.passes.push(pass);
  return pass;
}

// 👉 Functie om een strip te gebruiken
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
