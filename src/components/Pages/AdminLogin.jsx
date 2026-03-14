import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin');
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('E-posta veya şifre hatalı.');
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', backgroundColor: '#220d1c' }}
    >
      <div className="card p-5 shadow" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <img src="/images/konf_logo.png" alt="Logo" style={{ maxHeight: '80px' }} />
          <h4 className="mt-3 mb-0">Admin Girişi</h4>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">E-posta</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ backgroundColor: '#742640', borderColor: '#742640' }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Giriş yapılıyor...
              </>
            ) : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
