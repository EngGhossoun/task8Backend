const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { authenticate, authorizeRole } = require('../middleware/auth');


// GET /users (admin only)
router.get('/', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }});
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id (admin or owner)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });

    const user = await User.findByPk(id, { attributes: { exclude: ['password'] }});
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /users/:id (admin or owner)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, email, password, role } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    // تغيير الدور مسموح للمسؤول فقط
    if (role && req.user.role === 'admin') user.role = role;

    await user.save();
    const data = user.toJSON();
    delete data.password;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /users/:id (admin only)
router.delete('/:id', authenticate, authorizeRole(['admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
