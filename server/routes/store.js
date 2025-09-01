// server/routes/store.js
// server/routes/store.js

// Klanten
export const customers = [
  { 
    id: 1, 
    name: "Paul Thijs", 
    email: "paul@example.com", 
    phone: "0476123456" 
  },
  { 
    id: 2, 
    name: "Sofie Thijs", 
    email: "sofie@example.com", 
    phone: "0476987654" 
  }
];

// Honden
export const dogs = [
  { 
    id: 1, 
    name: "Diva", 
    breed: "Dobermann", 
    ownerId: 1   // gekoppeld aan Paul
  },
  { 
    id: 2, 
    name: "Rocky", 
    breed: "Border Collie", 
    ownerId: 2   // gekoppeld aan Sofie
  }
];

// Strippenkaarten
export const passes = [
  { 
    id: 1, 
    dogId: 1,          // Diva
    type: "Puppycursus", 
    total: 9,          // totaal aantal lessen
    remaining: 9       // nog niet gebruikt
  },
  { 
    id: 2, 
    dogId: 2,          // Rocky
    type: "Pubercursus", 
    total: 5, 
    remaining: 5
  }
];

// Lessen (voorlopig leeg, je kunt later vullen)
export const lessons = [];


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
