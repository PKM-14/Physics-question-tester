'use client';

import { useEffect, useMemo, useState } from 'react';
import { AuthPanel } from '@/components/AuthPanel';

const failureTypes = ['wrong_model', 'wrong_method', 'execution_error', 'stuck'] as const;

type ProblemPayload = {
  weakTechnique: { id: number; name: string; description: string };
  masteryScore: number;
  hint: string | null;
  partialSolution: string | null;
  problem: {
    id: number;
    statement: string;
    difficulty: number;
    solution: string;
    keyInsight: string;
    answer: string;
  };
};

export default function PracticePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [payload, setPayload] = useState<ProblemPayload | null>(null);
  const [failureType, setFailureType] = useState<string>('wrong_model');
  const [message, setMessage] = useState('');

  const isAuthed = useMemo(() => Boolean(email), [email]);

  useEffect(() => {
    const saved = localStorage.getItem('trainer_email');
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    if (!email) return;
    void loadNextProblem(email);
  }, [email]);

  const loadNextProblem = async (activeEmail: string) => {
    const response = await fetch('/api/next-problem', {
      headers: { 'x-user-email': activeEmail }
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? 'Could not load problem');
      return;
    }
    setPayload(data);
    setMessage('');
  };

  const submit = async (correct: boolean) => {
    if (!payload || !email) return;

    const response = await fetch('/api/submit-attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': email
      },
      body: JSON.stringify({
        problemId: payload.problem.id,
        correct,
        failureType: correct ? undefined : failureType,
        timeTaken: 120
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? 'Could not submit');
      return;
    }

    setMessage('Attempt submitted. Next problem loaded.');
    await loadNextProblem(email);
  };

  return (
    <div>
      <h2>Practice</h2>
      {!isAuthed && <AuthPanel onAuthed={setEmail} />}
      {message && <p>{message}</p>}

      {isAuthed && payload && (
        <>
          <div className="card">
            <p><strong>Weakest technique:</strong> {payload.weakTechnique.name}</p>
            <p><strong>Mastery:</strong> {(payload.masteryScore * 100).toFixed(0)}%</p>
            {payload.hint && <p><strong>Hint:</strong> {payload.hint}</p>}
            {payload.partialSolution && <p><strong>Partial solution:</strong> {payload.partialSolution}</p>}
          </div>

          <div className="card">
            <h3>Problem (Difficulty {payload.problem.difficulty})</h3>
            <p>{payload.problem.statement}</p>
            <div className="row" style={{ marginBottom: '0.5rem' }}>
              <button className="primary" onClick={() => submit(true)}>Solved</button>
              <button className="secondary" onClick={() => submit(false)}>Not solved</button>
            </div>
            <label htmlFor="failure">Failure type (if not solved)</label>
            <select id="failure" value={failureType} onChange={(event) => setFailureType(event.target.value)}>
              {failureTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="card">
            <h4>Solution</h4>
            <p>{payload.problem.solution}</p>
            <p><strong>Key insight:</strong> {payload.problem.keyInsight}</p>
            <p><strong>Answer:</strong> {payload.problem.answer}</p>
          </div>
        </>
      )}
    </div>
  );
}
