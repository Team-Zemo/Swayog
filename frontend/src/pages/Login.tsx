import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  
  const { login, verifyMfa, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mfaRequired) {
        await verifyMfa({ totpCode, mfaToken });
        navigate('/dashboard');
      } else {
        const response = await login({ usernameOrEmail, password });
        if (response && response.mfaRequired) {
          setMfaRequired(true);
          setMfaToken(response.mfaToken);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Invalid credentials or code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {mfaRequired ? 'Two-Factor Authentication' : 'Login'}
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!mfaRequired ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Username or Email</label>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Enter Authenticator Code</label>
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="123456"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mfaRequired ? 'Verify' : 'Login')}
          </button>
        </form>
        {!mfaRequired && (
          <p className="mt-4 text-center text-gray-400">
            Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
