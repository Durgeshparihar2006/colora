const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// MySQL कनेक्शन पूल
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP डिफॉल्ट पासवर्ड खाली होता है
  database: 'game_db'
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// लॉगिन राउट
app.post('/login', async (req, res) => {
  console.log('Login request received:', req.body);
  try {
    const { email, password } = req.body;
    
    // यूजर को डेटाबेस से खोजें
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = rows[0];
    
    // पासवर्ड वेरिफाई करें
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // पासवर्ड फील्ड हटाकर यूजर डेटा भेजें
    const { password: _, ...userData } = user;
    
    console.log('Login successful for:', email);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// साइनअप राउट
app.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  try {
    const { email, password, username } = req.body;
    
    // चेक करें कि ईमेल पहले से मौजूद तो नहीं है
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // पासवर्ड हैश करें
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // नया यूजर इंसर्ट करें
    const [result] = await pool.query(
      'INSERT INTO users (email, password, username, balance) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, username, 100] // शुरुआती बैलेंस 100
    );
    
    console.log('Signup successful for:', email);
    res.status(201).json({ 
      id: result.insertId,
      email,
      username,
      balance: 100
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ट्रांजैक्शन्स API राउट
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// यूजर के ट्रांजैक्शन्स प्राप्त करने का राउट
app.get('/api/transactions/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(`Error fetching transactions for user ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// नया ट्रांजैक्शन बनाने का राउट
app.post('/api/transactions', async (req, res) => {
  try {
    const { user_id, amount, type, description } = req.body;
    
    // ट्रांजैक्शन बनाएं
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [user_id, amount, type, description]
    );
    
    // यूजर का बैलेंस अपडेट करें
    if (type === 'deposit') {
      await pool.query(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [amount, user_id]
      );
    } else if (type === 'withdraw') {
      // चेक करें कि यूजर के पास पर्याप्त बैलेंस है
      const [userRows] = await pool.query('SELECT balance FROM users WHERE id = ?', [user_id]);
      
      if (userRows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const currentBalance = userRows[0].balance;
      
      if (currentBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      await pool.query(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [amount, user_id]
      );
    }
    
    // अपडेटेड यूजर डेटा प्राप्त करें
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user_id]);
    const { password: _, ...userData } = userRows[0];
    
    res.status(201).json({
      transaction: {
        id: result.insertId,
        user_id,
        amount,
        type,
        description,
        created_at: new Date()
      },
      user: userData
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// सर्वर स्टार्ट करने से पहले डेटाबेस कनेक्शन चेक करें
async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// सर्वर स्टार्ट करें
const PORT = process.env.PORT || 5000;
checkDatabaseConnection().then(isConnected => {
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } else {
    console.error('Server not started due to database connection failure');
  }
}); 