import React, { useState } from 'react';
import { Screen, Field, Button, Banner, TextLink } from '../ui';
import { api } from '../api';

export default function VerifyOtp({ go, email }) {
  const [otp, setOtp] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!/^\d{6}$/.test(otp)) return setBanner('Enter the 6-digit code from your email.');
    setBanner('');
    setLoading(true);
    try {
      await api.verifyOtp({ email, otp });
      go('login', { email, notice: 'Email verified. Log in to continue.' });
    } catch (err) {
      setBanner(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Verify your email" subtitle={`We sent a 6-digit code to ${email}. It expires in 10 minutes.`}>
      <Banner text={banner} />
      <Field label="Verification code" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" keyboardType="number-pad" maxLength={6} textContentType="oneTimeCode" style={{ fontSize: 24, letterSpacing: 8, fontWeight: '700' }} />
      <Button title="Verify email" onPress={submit} loading={loading} />
      <TextLink lead="Wrong email?" action="Back to register" onPress={() => go('register')} />
    </Screen>
  );
}
