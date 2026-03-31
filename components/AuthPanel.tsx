'use client';

import { useState } from 'react';

type AuthPanelProps = {
  onAuthed: (email: string) => void;
};

export function AuthPanel({ onAuthed }: AuthPanelProps) {
  const [email, setEmail] = useState('demo@trainer.com');
  const [password, setPassword] = useState('demo123');
  const [message, setMessage] = useState('');

  const submit = async (mode: 'login' | 'register') => {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? 'Auth failed');
      return;
    }

    localStorage.setItem('trainer_email', data.email);
    setMessage(`Authenticated as ${data.email}`);
    onAuthed(data.email);
  };

  return (
    <div className="card">
      <h3>Sign in</h3>
      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />
      <div className="row">
        <button className="primary" onClick={() => submit('login')}>Login</button>
        <button className="secondary" onClick={() => submit('register')}>Register</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
