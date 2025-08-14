import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

const seedUsers = [
  { name: 'Beby', password: 'loveyoujaan',  letterFile: 'Beby.html' },
  { name: 'Rita', password: 'loveyouyassh', letterFile: 'Rita.html' },
  { name: 'Nitu', password: 'loveyoupagal', letterFile: 'Nitu.html' },
  { name: 'Sumi', password: 'loveyoudada',  letterFile: 'Sumi.html' },
  { name: 'Bina', password: 'loveyourunna', letterFile: 'Bina.html' }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    const docs = [];
    for (const u of seedUsers) {
      const hash = await bcrypt.hash(u.password, 12);
      docs.push({ name: u.name, passwordHash: hash, letterFile: u.letterFile });
    }
    await User.insertMany(docs);
    console.log('Seeded users successfully.');
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await mongoose.disconnect();
  }
})();
