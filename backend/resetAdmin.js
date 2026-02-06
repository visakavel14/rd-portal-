import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const client = new MongoClient('mongodb://localhost:27017'); // use your DB URI
await client.connect();

const db = client.db('portal'); // your database name
const users = db.collection('users');

const newPassword = 'admin123'; // the password you want to use
const hashedPassword = await bcrypt.hash(newPassword, 10);

await users.updateOne(
  { username: 'admin' },
  { $set: { password: hashedPassword } }
);

console.log('Admin password reset successfully');
await client.close();
