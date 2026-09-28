require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { sendOtpEmail } = require('./mailer');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
const JWT_SECRET = process.env.JWT_SECRET;
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const app = express();
app.use(cors());
app.use(express.json());

const fail = (res, status, message, code, fields) => res.status(status).json({ message, code, fields });
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const normEmail = (e) => String(e || '').trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function issueOtp(userId, email) {
  const otp = String(crypto.randomInt(100000, 1000000));
  db.prepare(
    `INSERT INTO email_otps (user_id, otp_hash, expires_at, attempts) VALUES (?, ?, ?, 0)
     ON CONFLICT(user_id) DO UPDATE SET otp_hash = excluded.otp_hash, expires_at = excluded.expires_at, attempts = 0`
  ).run(userId, sha(otp), Date.now() + OTP_TTL_MS);
  await sendOtpEmail(email, otp);
}

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    fail(res, 401, 'Your session has expired. Please log in again.', 'UNAUTHORIZED');
  }
}

const detailsComplete = (u) => !!(u.name && u.mobile && u.address && u.business_name);

// 1. Register
app.post('/api/auth/register', async (req, res) => {
  const email = normEmail(req.body.email);
  const { password, confirmPassword } = req.body;
  const fields = {};
  if (!EMAIL_RE.test(email)) fields.email = 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    fields.password = 'Use at least 8 characters with a letter and a number.';
  if (password !== confirmPassword) fields.confirmPassword = 'Passwords do not match.';
  if (Object.keys(fields).length) return fail(res, 400, 'Please fix the highlighted fields.', 'VALIDATION', fields);

  const existing = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email);
  if (existing && existing.email_verified)
    return fail(res, 409, 'An account with this email already exists. Log in instead.', 'EMAIL_TAKEN', { email: 'Already registered.' });

  const hash = await bcrypt.hash(password, 10);
  let userId;
  if (existing) {
    // Unverified account: refresh password and send a new code.
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, existing.id);
    userId = existing.id;
  } else {
    userId = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash).lastInsertRowid;
  }
  try {
    await issueOtp(userId, email);
  } catch (e) {
    console.error('Email send failed:', e.message);
    return fail(res, 502, 'We could not send the verification email. Try again in a moment.', 'EMAIL_FAILED');
  }
  res.status(201).json({ message: 'Verification code sent.', email });
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const email = normEmail(req.body.email);
  const otp = String(req.body.otp || '').trim();
  const user = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email);
  if (!user) return fail(res, 400, 'Invalid code.', 'INVALID_OTP');
  if (user.email_verified) return res.json({ message: 'Email already verified.' });

  const row = db.prepare('SELECT * FROM email_otps WHERE user_id = ?').get(user.id);
  if (!row || row.expires_at < Date.now())
    return fail(res, 400, 'This code has expired. Register again with the same email to get a new one.', 'OTP_EXPIRED');
  if (row.attempts >= MAX_OTP_ATTEMPTS)
    return fail(res, 429, 'Too many attempts. Register again with the same email to get a new code.', 'OTP_LOCKED');

  const ok = /^\d{6}$/.test(otp) && crypto.timingSafeEqual(Buffer.from(sha(otp)), Buffer.from(row.otp_hash));
  if (!ok) {
    db.prepare('UPDATE email_otps SET attempts = attempts + 1 WHERE user_id = ?').run(user.id);
    return fail(res, 400, 'Incorrect code. Check the email and try again.', 'INVALID_OTP');
  }
  db.transaction(() => {
    db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').run(user.id);
    db.prepare('DELETE FROM email_otps WHERE user_id = ?').run(user.id);
  })();
  res.json({ message: 'Email verified.' });
});

// 3. Login (verified users only)
app.post('/api/auth/login', async (req, res) => {
  const email = normEmail(req.body.email);
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const match = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !match) return fail(res, 401, 'Incorrect email or password.', 'INVALID_CREDENTIALS');
  if (!user.email_verified)
    return fail(res, 403, 'Email not verified. Register again with the same email to get a new code.', 'EMAIL_NOT_VERIFIED');

  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { email: user.email, detailsComplete: detailsComplete(user), selectedTaskId: user.selected_task_id },
  });
});

// 4. Save basic details
app.put('/api/user/basic-details', auth, (req, res) => {
  const clean = (v) => String(v || '').trim();
  const name = clean(req.body.name);
  const mobile = clean(req.body.mobile).replace(/[\s-]/g, '');
  const address = clean(req.body.address);
  const businessName = clean(req.body.businessName);
  const fields = {};
  if (name.length < 2 || name.length > 100) fields.name = 'Enter your full name.';
  if (!/^\+?\d{10,13}$/.test(mobile)) fields.mobile = 'Enter a valid mobile number (10 digits).';
  if (address.length < 5 || address.length > 300) fields.address = 'Enter your address.';
  if (businessName.length < 2 || businessName.length > 120) fields.businessName = 'Enter your business name.';
  if (Object.keys(fields).length) return fail(res, 400, 'Please fix the highlighted fields.', 'VALIDATION', fields);

  db.prepare('UPDATE users SET name = ?, mobile = ?, address = ?, business_name = ? WHERE id = ?').run(
    name, mobile, address, businessName, req.userId
  );
  res.json({ message: 'Details saved.' });
});

// 5a. List tasks
app.get('/api/tasks', auth, (req, res) => {
  const tasks = db.prepare('SELECT id, title, description FROM tasks ORDER BY id').all();
  const { selected_task_id } = db.prepare('SELECT selected_task_id FROM users WHERE id = ?').get(req.userId);
  res.json({ tasks, selectedTaskId: selected_task_id });
});

// 5b. Select task
app.post('/api/tasks/select', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!detailsComplete(user)) return fail(res, 403, 'Save your basic details first.', 'DETAILS_REQUIRED');
  const task = db.prepare('SELECT id, title FROM tasks WHERE id = ?').get(Number(req.body.taskId));
  if (!task) return fail(res, 404, 'That task does not exist.', 'TASK_NOT_FOUND');
  db.prepare('UPDATE users SET selected_task_id = ? WHERE id = ?').run(task.id, req.userId);
  res.json({ message: 'Task selected.', task });
});

app.use((err, req, res, next) => {
  console.error(err);
  fail(res, 500, 'Something went wrong on our side.', 'SERVER_ERROR');
});

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`PadosiPro API listening on :${port}`));
