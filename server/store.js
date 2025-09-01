// server/store.js (ESM)
export const store = {
  customers: [],   // { id, name, email, phone, lessonType, createdAt }
  dogs: [],        // { id, ownerId, name, breed, birthdate, sex, vaccineStatus, bookRef, vetName, vetPhone, emergencyPhone, photoUrl, createdAt }
  passes: []       // voor later (strippenkaarten): { id, customerId, dogId, lessonType, total, used, createdAt }
};

// Simpele ID-generator op basis van huidige max
export function nextId(list) {
  const max = list.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  return max + 1;
}
