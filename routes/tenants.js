const express = require('express');
const Tenant = require('../models/Tenant');
const auth = require('../middleware/auth');

const router = express.Router();

// Upgrade plan
router.post('/:slug/upgrade', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const tenant = await Tenant.findOneAndUpdate({ slug: req.params.slug }, { plan: 'pro' }, { new: true });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ success: true, plan: tenant.plan });
});

module.exports = router;
