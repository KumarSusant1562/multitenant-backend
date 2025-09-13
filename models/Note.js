const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  tenantId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Note', NoteSchema);
