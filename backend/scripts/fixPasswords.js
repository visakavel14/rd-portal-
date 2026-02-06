// scripts/fixPasswords.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User"); // adjust path

mongoose.connect("mongodb://localhost:27017/portal").then(async () => {
  console.log("Connected to DB");
  const users = await User.find();

  for (const u of users) {
    if (u.password.startsWith("$2b$")) continue; // already hashed
    u.password = await bcrypt.hash(u.password, 10);
    await u.save();
    console.log("Hashed password for:", u.username);
  }

  console.log("Passwords fixed!");
  mongoose.connection.close();
});
