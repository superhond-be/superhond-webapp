// server/index.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();   // <<< deze regel is verplicht
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
