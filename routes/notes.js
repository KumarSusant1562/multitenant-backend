const express = require('express');
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');
const auth = require('../middleware/auth');

const router = express.Router();

// Create note
router.post('/', auth, async (req, res) => {
  const { tenantId, userId, role } = req.user;
  const tenant = await Tenant.findById(tenantId);
  if (tenant.plan === 'free') {
    const count = await Note.countDocuments({ tenantId });
    if (count >= 3) return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro.' });
  }
  const note = await Note.create({ ...req.body, tenantId, userId });
  res.json(note);
});

// List notes
router.get('/', auth, async (req, res) => {
  const { tenantId } = req.user;
  const notes = await Note.find({ tenantId });
  res.json(notes);
});

// Get note
router.get('/:id', auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOne({ _id: req.params.id, tenantId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Update note
router.put('/:id', auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOneAndUpdate({ _id: req.params.id, tenantId }, req.body, { new: true });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
});

module.exports = router;
