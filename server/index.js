const adminGuard = require('./adminGuard');

// Login route (open)
app.use('/api/admin', require('./routes/admin'));

// Beheerroutes (JWT beschermd)
app.use('/api/settings',   adminGuard, require('./routes/settings'));
app.use('/api/courses',    adminGuard, require('./routes/courses'));
app.use('/api/sessions',   adminGuard, require('./routes/sessions'));
app.use('/api/memberships',adminGuard, require('./routes/memberships'));
