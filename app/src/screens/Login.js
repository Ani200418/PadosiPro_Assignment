import React, { useState } from 'react';
import { Screen, Field, Button, Banner, TextLink } from '../ui';
import { api } from '../api';

export default function Login({ go, email: initialEmail = '', notice }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !password) return setBanner('Enter your email and password.');
    setBanner('');
    setLoading(true);
    try {
      const { token, user } = await api.login({ email: email.trim(), password });
      go(user.detailsComplete ? 'tasks' : 'details', { token, selectedTaskId: user.selectedTaskId });
    } catch (err) {
      setBanner(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Welcome back" subtitle="Log in to continue.">
      <Banner text={notice} kind="info" />
      <Banner text={banner} />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secure />
      <Button title="Log in" onPress={submit} loading={loading} />
      <TextLink lead="New here?" action="Create an account" onPress={() => go('register')} />
    </Screen>
  );
}
