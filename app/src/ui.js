import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

export const c = {
  green: '#155C49', tint: '#E7F1ED', bg: '#FFFFFF',
  ink: '#16211D', muted: '#67766F', line: '#D9E2DE', error: '#B3372B', errorBg: '#FBECEA',
};

export function Screen({ title, subtitle, children }) {
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.brand}>PadosiPro</Text>
          <Text style={s.tagline}>You don't manage tasks — we do.</Text>
        </View>
        <View style={s.sheet}>
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Field({ label, error, secure, style, ...props }) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputRow, error && { borderColor: c.error }]}>
        <TextInput style={[s.input, style]} placeholderTextColor="#9AA8A2" secureTextEntry={hidden} autoCapitalize="none" {...props} />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Text style={s.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={s.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Button({ title, onPress, loading, disabled }) {
  const off = loading || disabled;
  return (
    <Pressable onPress={onPress} disabled={off} style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }, off && { opacity: 0.5 }]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{title}</Text>}
    </Pressable>
  );
}

export const Banner = ({ text, kind = 'error' }) =>
  text ? (
    <View style={[s.banner, kind === 'info' && { backgroundColor: c.tint }]}>
      <Text style={[s.bannerText, kind === 'info' && { color: c.green }]}>{text}</Text>
    </View>
  ) : null;

export const TextLink = ({ lead, action, onPress }) => (
  <Pressable onPress={onPress} style={{ alignSelf: 'center', marginTop: 20, padding: 6 }}>
    <Text style={{ color: c.muted, fontSize: 15 }}>
      {lead} <Text style={{ color: c.green, fontWeight: '700' }}>{action}</Text>
    </Text>
  </Pressable>
);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.green },
  scroll: { flexGrow: 1 },
  hero: { paddingTop: 72, paddingBottom: 44, paddingHorizontal: 28 },
  brand: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: '#BFE0D4', fontSize: 15, marginTop: 6 },
  sheet: { flexGrow: 1, backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: c.ink },
  subtitle: { fontSize: 15, color: c.muted, marginTop: 6, marginBottom: 8, lineHeight: 21 },
  fieldWrap: { marginTop: 16 },
  label: { fontSize: 14, fontWeight: '600', color: c.ink, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.line, borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#FAFCFB' },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 14 : 11, fontSize: 16, color: c.ink },
  toggle: { color: c.green, fontWeight: '700', fontSize: 14, marginLeft: 8 },
  fieldError: { color: c.error, fontSize: 13, marginTop: 5 },
  btn: { backgroundColor: c.green, borderRadius: 12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 24, minHeight: 52 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  banner: { backgroundColor: c.errorBg, borderRadius: 10, padding: 12, marginTop: 14 },
  bannerText: { color: c.error, fontSize: 14, lineHeight: 20 },
});
