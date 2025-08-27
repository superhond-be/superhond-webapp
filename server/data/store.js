// server/data/store.js
// Eenvoudige in-memory data voor snelle tests

// KLASSEN (les-types)
export const classes = [
  { id: 1, name: "Puppy",  description: "Basistraining voor pups",  maxLessons: 9, validityMonths: 6 },
  { id: 2, name: "Pubers", description: "Vervolgtraining pubers",   maxLessons: 8, validityMonths: 3 },
];

// SESSIES (momenten), optioneel met capacity
export const sessions = [
  { id: 1, classId: 1, date: "2025-08-31", start: "10:00", end: "11:00", location: "Retie",    capacity: 10 },
  { id: 2, classId: 1, date: "2025-09-07", start: "10:00", end: "11:00", location: "Retie",    capacity: 10 },
  { id: 3, classId: 2, date: "2025-09-03", start: "18:30", end: "19:30", location: "Turnhout", capacity: 12 },
];

// KLANTEN (demo)
export const clients = [
  { id: 1, name: "Jan Janssens", email: "jan@example.com" },
  { id: 2, name: "Sofie Peeters", email: "sofie@example.com" },
];

// PACKAGES / STRIPPENKAARTEN: per klant en klas
// credits_used telt enkel ATTENDED, niet RESERVED
export const packages = [
  // Jan heeft Puppy 9 lessen, geldig tot 2026-02-28
  { id: 1, clientId: 1, classId: 1, credits_total: 9, credits_used: 0, valid_until: "2026-02-28" },
  // Sofie heeft Pubers 8 lessen
  { id: 2, clientId: 2, classId: 2, credits_total: 8, credits_used: 0, valid_until: "2025-12-31" },
];

// BOOKINGS
// status: RESERVED | ATTENDED | CANCELLED | NO_SHOW
export const bookings = [];

// Helpers
export const MAX_ACTIVE_RES = 2; // max 2 toekomstige reserveringen per klant per klas
export const defaultCapacity = 12;

export function getClassById(id)    { return classes.find(c => c.id === Number(id)); }
export function getSessionById(id)  { return sessions.find(s => s.id === Number(id)); }
export function getClientById(id)   { return clients.find(c => c.id === Number(id)); }
export function getPackage(clientId, classId) {
  return packages.find(p => p.clientId === Number(clientId) && p.classId === Number(classId));
}
