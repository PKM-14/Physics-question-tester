'use client';

import { useEffect, useState } from 'react';
import { AuthPanel } from '@/components/AuthPanel';

type ProgressItem = {
  masteryScore: number;
  technique: {
    name: string;
    description: string;
  };
};

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('trainer_email');
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    if (!email) return;

    void (async () => {
      const response = await fetch('/api/progress', {
        headers: { 'x-user-email': email }
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? 'Could not load progress');
        return;
      }

      setProgress(data);
      setMessage('');
    })();
  }, [email]);

  return (
    <div>
      <h2>Dashboard</h2>
      {!email && <AuthPanel onAuthed={setEmail} />}
      {message && <p>{message}</p>}
      {email && (
        <div className="card">
          {progress.map((item) => (
            <div key={item.technique.name} style={{ marginBottom: '1rem' }}>
              <p>
                <strong>{item.technique.name}</strong> — {item.technique.description}
              </p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.masteryScore * 100}%` }} />
              </div>
              <small>{(item.masteryScore * 100).toFixed(0)}%</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
