const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://susantkumars18_db_user:susant1234@susant.ugb9iwz.mongodb.net/notes--multitenant');

const Tenant = mongoose.model('Tenant', new mongoose.Schema({
  name: String,
  slug: String,
  plan: { type: String, 
    enum: ['free', 'pro'], default: 'free' }
}));

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  passwordHash: String,
    role: { type: String, 
    enum: ['admin', 'member'] },
  tenantId: mongoose.Schema.Types.ObjectId
}));

async function seed() {
  await Tenant.deleteMany({});
  await User.deleteMany({});

  const acme = await Tenant.create({
      name: 'Acme',
      slug: 'acme', 
      plan: 'free',
    });
    
  const globex = await Tenant.create({ 
     name: 'Globex', 
     slug: 'globex', 
     plan: 'free' ,
    });

  const passwordHash = bcrypt.hashSync('password', 10);

  await User.create({ 
     email: 'admin@acme.test', 
     passwordHash, 
     role: 'admin', 
     tenantId: acme._id 
    });

  await User.create({ 
     email: 'user@acme.test', 
     passwordHash, 
     role: 'member', 
     tenantId: acme._id 
    });

  await User.create({ 
     email: 'admin@globex.test', 
     passwordHash, 
     role: 'admin', 
     tenantId: globex._id 
    });

  await User.create({ 
     email: 'user@globex.test', 
     passwordHash, 
     role: 'member', 
     tenantId: globex._id 
    });

  console.log('Seeded tenants and users');
  process.exit();
}

seed();
