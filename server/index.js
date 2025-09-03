// ---------- CRUD: Email Templates ----------
const emailFile = "email-templates.json";
const emailBase = "/api/email-templates";

// GET all
app.get(emailBase, (_req, res) => {
  res.json(readDB(emailFile));
});

// POST new
app.post(emailBase, (req, res) => {
  const list = readDB(emailFile);
  const item = { id: Date.now().toString(), ...req.body };
  list.push(item);
  writeDB(emailFile, list);
  res.status(201).json(item);
});

// PUT update
app.put(`${emailBase}/:id`, (req, res) => {
  const list = readDB(emailFile);
  const idx = list.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  list[idx] = { ...list[idx], ...req.body, id: req.params.id };
  writeDB(emailFile, list);
  res.json(list[idx]);
});

// DELETE
app.delete(`${emailBase}/:id`, (req, res) => {
  let list = readDB(emailFile);
  const before = list.length;
  list = list.filter((x) => x.id !== req.params.id);
  if (list.length === before)
    return res.status(404).json({ error: "Not found" });
  writeDB(emailFile, list);
  res.json({ ok: true });
});
