const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: String,
  slug: String,
  plan: { type: String, enum: ['free', 'pro'], default: 'free' }
});


module.exports = mongoose.model('Tenant', TenantSchema);
