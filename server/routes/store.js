// Eenvoudige gedeelde in-memory "database"
const store = {
  customers: [],   // { id, name, email, phone, lessonType }
  dogs: [],        // { id, customerId, name, breed, birthdate, gender, vaccinationStatus, passportRef, vetPhone, vetName, emergencyPhone, photoUrl }
  passes: []       // { id, customerId, dogId, type, totalStrips, usedStrips, createdAt }
};

// Helper om nieuwe ID's te maken (uniek genoeg voor demo)
function nextId(list) {
  const max = list.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  return max + 1;
}

module.exports = { store, nextId };
