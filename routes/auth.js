const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const tenant = await Tenant.findById(user.tenantId);
  const token = jwt.sign({ userId: user._id, tenantId: tenant._id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ token, role: user.role, tenant: tenant.slug });
});



module.exports = router;
