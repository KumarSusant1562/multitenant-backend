const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();


router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { email, role } = req.body;
  const passwordHash = bcrypt.hashSync('password', 10); // Default password
  const user = await User.create({ email, role, tenantId: req.user.tenantId, passwordHash });
  res.json(user);
});

module.exports = router;
