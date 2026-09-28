import React, { useState } from 'react';
import { Screen, Field, Button, Banner, TextLink } from '../ui';
import { api } from '../api';

export default function Register({ go }) {
  const [f, setF] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'Use at least 8 characters with a letter and a number.';
    if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    setBanner('');
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const r = await api.register({ ...f, email: f.email.trim() });
      go('verify', { email: r.email });
    } catch (err) {
      setErrors(err.fields || {});
      setBanner(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Create your account" subtitle="Sign up with your email. We'll send a code to verify it.">
      <Banner text={banner} />
      <Field label="Email" value={f.email} onChangeText={set('email')} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
      <Field label="Password" value={f.password} onChangeText={set('password')} error={errors.password} placeholder="At least 8 characters" secure />
      <Field label="Confirm password" value={f.confirmPassword} onChangeText={set('confirmPassword')} error={errors.confirmPassword} placeholder="Re-enter password" secure />
      <Button title="Register" onPress={submit} loading={loading} />
      <TextLink lead="Already have an account?" action="Log in" onPress={() => go('login')} />
    </Screen>
  );
}
