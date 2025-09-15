const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('[LOGIN] Attempt:', { email, origin: req.headers.origin });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('[LOGIN] User not found for', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      console.log('[LOGIN] Invalid password for', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const tenant = await Tenant.findById(user.tenantId);
    const token = jwt.sign({ userId: user._id, tenantId: tenant._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    console.log('[LOGIN] Success for', email);
    return res.json({ token, role: user.role, tenant: tenant.slug });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
