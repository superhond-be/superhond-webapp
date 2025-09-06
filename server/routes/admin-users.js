const SETUP_TOKEN = process.env.SETUP_TOKEN || "Superhond1983";

// Als er nog geen admins zijn, gebruik het SETUP_TOKEN voor de eerste superadmin
router.post("/setup", async (req, res) => {
  try {
    if (admins.length > 0) {
      return res.status(400).json({ error: "Er is al een admin geregistreerd." });
    }

    const { name, email, password, token } = req.body;

    if (token !== SETUP_TOKEN) {
      return res.status(403).json({ error: "Ongeldig setup-token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = {
      id: `adm_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: "superadmin",
      createdAt: new Date().toISOString(),
    };

    admins.push(superAdmin);

    res.json({
      ok: true,
      message: "Superadmin succesvol aangemaakt",
      user: { id: superAdmin.id, name: superAdmin.name, email: superAdmin.email, role: superAdmin.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Serverfout bij setup superadmin." });
  }
});
