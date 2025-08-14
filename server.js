import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      "font-src": ["'self'", "https://cdn.jsdelivr.net"]
    }
  }
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DB
await mongoose.connect(process.env.MONGO_URI);

// Sessions
app.use(session({
  name: 'mgf.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000*60*60*8 },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, touchAfter: 24*3600 })
}));

// Rate limit login attempts
const loginLimiter = rateLimit({ windowMs: 15*60*1000, max: 30, standardHeaders: true, legacyHeaders: false });
app.use('/login', loginLimiter);

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Login handler
app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.redirect('/index.html?error=missing');
  const user = await User.findOne({ name: name.trim() });
  if (!user) return res.redirect('/index.html?error=invalid');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.redirect('/index.html?error=invalid');
  req.session.userId = user._id.toString();
  req.session.userName = user.name;
  res.redirect(`/loveletters/${encodeURIComponent(user.letterFile)}`);
});

// Protect /loveletters so only the logged-in user's file can be opened
app.use('/loveletters', async (req, res, next) => {
  if (!req.session?.userId) return res.redirect('/index.html?error=login');
  const me = await User.findById(req.session.userId).lean();
  if (!me) { req.session.destroy(()=>{}); return res.redirect('/index.html?error=login'); }
  const requested = req.path.replace(/^\//, '');
  if (requested !== me.letterFile) return res.status(403).send('Forbidden');
  next();
}, express.static(path.join(__dirname, 'public', 'loveletters')));

// Root
app.get('/', (req, res) => res.redirect('/index.html'));

// 404
app.use((req, res) => res.status(404).send('Not Found'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
