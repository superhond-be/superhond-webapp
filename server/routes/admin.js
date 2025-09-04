router.patch('/users/:id/password', adminGuard, async (req, res) => {
  if (req.admin?.role !== 'superadmin') return res.status(403).json({ error: 'forbidden' });
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'missing_password' });
  const { readUsers, writeUsers, publicUser } = require('../helpers/adminUsers');
  const bcrypt = require('bcryptjs');

  const users = readUsers();
  const i = users.findIndex(u => u.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });

  users[i].passhash = await bcrypt.hash(password, 10);
  writeUsers(users);
  res.json({ ok: true, user: publicUser(users[i]) });
});
