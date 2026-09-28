import React, { useState } from 'react';
import { Screen, Field, Button, Banner } from '../ui';
import { api } from '../api';

export default function BasicDetails({ go, token }) {
  const [f, setF] = useState({ name: '', mobile: '', address: '', businessName: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^\+?\d{10,13}$/.test(f.mobile.replace(/[\s-]/g, ''))) e.mobile = 'Enter a valid mobile number (10 digits).';
    if (f.address.trim().length < 5) e.address = 'Enter your address.';
    if (f.businessName.trim().length < 2) e.businessName = 'Enter your business name.';
    setErrors(e);
    setBanner('');
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await api.saveDetails(token, f);
      go('tasks', { token, selectedTaskId: null });
    } catch (err) {
      setErrors(err.fields || {});
      setBanner(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Tell us about you" subtitle="A few basic details to get you started.">
      <Banner text={banner} />
      <Field label="Name" value={f.name} onChangeText={set('name')} error={errors.name} placeholder="Full name" autoCapitalize="words" autoComplete="name" />
      <Field label="Mobile number" value={f.mobile} onChangeText={set('mobile')} error={errors.mobile} placeholder="10-digit mobile number" keyboardType="phone-pad" autoComplete="tel" />
      <Field label="Address" value={f.address} onChangeText={set('address')} error={errors.address} placeholder="House no., street, city" autoCapitalize="sentences" multiline style={{ minHeight: 64, textAlignVertical: 'top' }} />
      <Field label="Business name" value={f.businessName} onChangeText={set('businessName')} error={errors.businessName} placeholder="Business name" autoCapitalize="words" />
      <Button title="Save and continue" onPress={submit} loading={loading} />
    </Screen>
  );
}
