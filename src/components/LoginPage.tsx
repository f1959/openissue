import { FormEvent, useState } from 'react';

type Props = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <h1>Open Issue Tracker</h1>
        <p className="muted">Sign in with your Firebase account.</p>
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </div>
  );
}
