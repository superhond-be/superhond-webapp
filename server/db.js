public/styles.css
public/app.js
public/index.html
import Database from "better-sqlite3";

// Open (of maak) een databasebestand
const db = new Database("superhond.db");

// Maak tabellen aan als ze nog niet bestaan
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS dogs (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    name TEXT,
    breed TEXT,
    birthdate TEXT,
    vaccinated INTEGER,
    vet TEXT,
    emergency_contact TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS passes (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    type TEXT,
    credits INTEGER,
    expiry TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    class_id TEXT,
    date TEXT,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    client_id TEXT,
    dog_id TEXT,
    attended INTEGER,
    FOREIGN KEY(session_id) REFERENCES sessions(id),
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(dog_id) REFERENCES dogs(id)
  );
`);

export default db;
