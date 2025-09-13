const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: { type: String, enum: ['admin', 'member'] },
  tenantId: mongoose.Schema.Types.ObjectId
});


module.exports = mongoose.model('User', UserSchema);
