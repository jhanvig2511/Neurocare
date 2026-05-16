const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Complete Registration (with profile data)
router.post('/register-complete', async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    location,
    occupation,
    education,
    priorSupport,
    therapyHistory,
    challenges = [],
    stressLevel = 5,
    goals,
    preferences = [],
    emergencyName,
    emergencyPhone
  } = req.body;

  // ✅ BASIC VALIDATION
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    db.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email],
      async (err, results) => {
        if (err) return res.status(500).json({ message: err.message });

        if (results.length > 0) {
          return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ INSERT USER
        const userSql = `
          INSERT INTO users 
          (name, email, password, age, gender, location)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
          userSql,
          [name, email, hashedPassword, age || null, gender || null, location || null],
          (err, userResult) => {
            if (err) return res.status(500).json({ message: err.message });

            const userId = userResult.insertId;

            // ✅ INSERT PROFILE
            const profileSql = `
              INSERT INTO user_profiles
              (user_id, occupation, education, prior_support, therapy_history, stress_level, goals, emergency_name, emergency_phone)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(profileSql, [
              userId,
              occupation || null,
              education || null,
              priorSupport || null,
              therapyHistory || null,
              parseInt(stressLevel),
              goals || null,
              emergencyName || null,
              emergencyPhone || null
            ]);

            // ✅ INSERT CHALLENGES
            if (challenges.length > 0) {
              const challengeSql = `
                INSERT INTO user_challenges (user_id, challenge) VALUES ?
              `;
              const challengeValues = challenges.map(c => [userId, c]);
              db.query(challengeSql, [challengeValues]);
            }

            // ✅ INSERT PREFERENCES
            if (preferences.length > 0) {
              const prefSql = `
                INSERT INTO user_preferences (user_id, preference) VALUES ?
              `;
              const prefValues = preferences.map(p => [userId, p]);
              db.query(prefSql, [prefValues]);
            }

            // ✅ JWT TOKEN
            const token = jwt.sign(
              { id: userId, email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            return res.status(201).json({
              message: 'Registration completed successfully',
              token,
              user: {
                id: userId,
                name,
                email
              }
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Simple Register (for basic auth)
router.post('/register', async (req, res) => {
  const { name, email, password, age, gender, location } = req.body;

  try {
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const sql = 'INSERT INTO users (name, email, password, age, gender, location) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sql, [name, email, hashedPassword, age, gender, location], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

// Get user profile
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      u.*,
      up.occupation,
      up.education,
      up.prior_support,
      up.therapy_history,
      up.stress_level,
      up.goals,
      up.emergency_name,
      up.emergency_phone
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    // Get challenges
    db.query('SELECT challenge FROM user_challenges WHERE user_id = ?', [userId], (err, challenges) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get preferences
      db.query('SELECT preference FROM user_preferences WHERE user_id = ?', [userId], (err, preferences) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          ...user,
          challenges: challenges.map(c => c.challenge),
          preferences: preferences.map(p => p.preference)
        });
      });
    });
  });
});

module.exports = router;