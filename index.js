require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./middleware/auth');


const app = express();
app.use(express.json());
console.log("Environment Variables:", {
  FRONTEND_URL: process.env.FRONTEND_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET
});

// TEMPORARY: Allow requests from any origin by reflecting the request origin.
// This is for debugging/development so the browser preflight will succeed.
// IMPORTANT: revert to a stricter origin check before production.
app.use(cors({
  origin: true, // reflect request origin
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('[CORS TEST] OPTIONS request for:', req.originalUrl, 'Origin:', req.headers.origin);
  }
  next();
});


mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://susantkumars18_db_user:susant1234@susant.ugb9iwz.mongodb.net/notes--multitenant', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => {
  console.error('[MONGODB] Initial connection error:', err && err.message ? err.message : err);
});

// Log connection status and verify presence of seed data (counts)
const mongooseConnection = mongoose.connection;
mongooseConnection.on('connected', async () => {
  try {
    console.log('[MONGODB] Connected to', mongooseConnection.name || process.env.MONGODB_URI);
    // attempt to require models and print counts if available
    try {
      const Tenant = require('./models/Tenant');
      const User = require('./models/User');
      const tenantsCount = await Tenant.countDocuments();
      const usersCount = await User.countDocuments();
      console.log(`[MONGODB] Tenants: ${tenantsCount}, Users: ${usersCount}`);
    } catch (errInner) {
      console.warn('[MONGODB] Could not load models to count documents:', errInner && errInner.message);
    }
  } catch (err) {
    console.error('[MONGODB] on connected handler error:', err && err.message ? err.message : err);
  }
});
mongooseConnection.on('error', (err) => {
  console.error('[MONGODB] Connection error:', err && err.message ? err.message : err);
});


app.use('/', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));
app.use('/tenants', require('./routes/tenants'));
app.use('/invite', require('./routes/invite'));


app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant Notes API. See /health for status.' });
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const tenant = await Tenant.findById(user.tenantId);
  const token = jwt.sign({ 
    userId: user._id, 
    tenantId: tenant._id, 
    role: user.role }, process.env.JWT_SECRET || 'secret');

  res.json({ token, role: user.role, tenant: tenant.slug });
});


app.post('/notes', auth, async (req, res) => {
  const { tenantId, userId, role } = req.user;
  const tenant = await Tenant.findById(tenantId);
  if (tenant.plan === 'free') {
    const count = await Note.countDocuments({ tenantId });
    
    if (count >= 3) return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro.' });
  }
  const note = await Note.create({ ...req.body, tenantId, userId });
  res.json(note);
});

app.get('/notes', auth, async (req, res) => {
  const { tenantId } = req.user;
  const notes = await Note.find({ tenantId });
  res.json(notes);
});

app.get('/notes/:id', auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOne({ _id: req.params.id, tenantId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.put('/notes/:id', auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOneAndUpdate({ _id: req.params.id, tenantId }, req.body, { new: true });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.delete('/notes/:id', auth, async (req, res) => {
  const { tenantId } = req.user;
  const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
});

// Upgrade endpoint
app.post('/tenants/:slug/upgrade', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const tenant = await Tenant.findOneAndUpdate({ slug: req.params.slug }, { plan: 'pro' }, { new: true });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ success: true, plan: tenant.plan });
});

// Invite user (Admin only)
app.post('/invite', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { email, role } = req.body;
  const passwordHash = bcrypt.hashSync('password', 10); // Default password
  const user = await User.create({ email, role, tenantId: req.user.tenantId, passwordHash });
  res.json(user);
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
