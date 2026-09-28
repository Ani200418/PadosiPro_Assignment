import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import Register from './src/screens/Register';
import VerifyOtp from './src/screens/VerifyOtp';
import Login from './src/screens/Login';
import BasicDetails from './src/screens/BasicDetails';
import Tasks from './src/screens/Tasks';

const screens = { register: Register, verify: VerifyOtp, login: Login, details: BasicDetails, tasks: Tasks };

// Flow: register -> verify -> login -> details (first login) -> tasks
export default function App() {
  const [route, setRoute] = useState({ name: 'register', params: {} });
  const go = (name, params = {}) => setRoute({ name, params });
  const Current = screens[route.name];
  return (
    <>
      <StatusBar style="light" />
      <Current key={route.name} go={go} {...route.params} />
    </>
  );
}
