// backend/routes/data.js
const express = require('express');
const router = express.Router();

router.get('/get-items', (req, res) => {
  // Example: return all items
  res.json([
    { id: 1, name: 'Dashboard', roles: ['admin', 'user'] },
    { id: 2, name: 'Admin Panel', roles: ['admin'] },
    { id: 3, name: 'User Page', roles: ['user'] },
  ]);
});

module.exports = router;
