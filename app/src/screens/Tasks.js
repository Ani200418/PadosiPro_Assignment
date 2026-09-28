import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen, Button, Banner, c } from '../ui';
import { api } from '../api';

export default function Tasks({ token, selectedTaskId }) {
  const [tasks, setTasks] = useState(null);
  const [selected, setSelected] = useState(selectedTaskId);
  const [saved, setSaved] = useState(null);
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getTasks(token)
      .then((r) => { setTasks(r.tasks); if (r.selectedTaskId) setSelected(r.selectedTaskId); })
      .catch((e) => setBanner(e.message));
  }, [token]);

  async function confirm() {
    setBanner('');
    setLoading(true);
    try {
      const r = await api.selectTask(token, selected);
      setSaved(r.task.title);
    } catch (err) {
      setBanner(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Choose a task" subtitle="Pick the task you'd like us to take care of.">
      <Banner text={banner} />
      {saved ? <Banner kind="info" text={`Task selected: ${saved}`} /> : null}
      {!tasks && !banner ? <ActivityIndicator color={c.green} style={{ marginTop: 32 }} /> : null}
      <View style={{ marginTop: 12 }}>
        {(tasks || []).map((t) => {
          const on = t.id === selected;
          return (
            <Pressable key={t.id} onPress={() => { setSelected(t.id); setSaved(null); }} style={[st.card, on && st.cardOn]}>
              <View style={{ flex: 1 }}>
                <Text style={st.cardTitle}>{t.title}</Text>
                <Text style={st.cardDesc}>{t.description}</Text>
              </View>
              <View style={[st.radio, on && st.radioOn]}>{on ? <View style={st.dot} /> : null}</View>
            </Pressable>
          );
        })}
      </View>
      {tasks ? <Button title="Confirm task" onPress={confirm} loading={loading} disabled={!selected || !!saved} /> : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.line, borderRadius: 14, padding: 16, marginTop: 10 },
  cardOn: { borderColor: c.green, backgroundColor: c.tint },
  cardTitle: { fontSize: 16, fontWeight: '700', color: c.ink },
  cardDesc: { fontSize: 13.5, color: c.muted, marginTop: 3, lineHeight: 19 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c.line, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: c.green },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.green },
});
