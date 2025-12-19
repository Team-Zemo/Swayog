import React, { useEffect, useState } from 'react';
import { poseApi, userApi, practiceApi } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Recommendation {
  poseName: string;
  difficulty: string;
  reason: string;
}

const Dashboard: React.FC = () => {
  const [poses, setPoses] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, maxStreak: 0 });
  const { logout, setupMfa, enableMfa, token } = useAuth();
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');

  useEffect(() => {
    const fetchPoses = async () => {
      try {
        const response = await poseApi.get('/poses');
        setPoses(response.data.poses);
      } catch (error) {
        console.error('Failed to fetch poses', error);
      }
    };
    
    const fetchStreak = async () => {
      try {
        const response = await userApi.get('/streak');
        setStreak(response.data);
      } catch (error) {
        console.error('Failed to fetch streak', error);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const response = await practiceApi.get('/recommendations');
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      }
    };

    fetchPoses();
    fetchStreak();
    fetchRecommendations();
  }, []);

  const isMfaToken = (t: string | null) => {
    if (!t) return false;
    try {
      const parts = t.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(atob(parts[1]));
      return !!payload.mfa;
    } catch (e) {
      return false;
    }
  };

  const handleSetupMfa = async () => {
    if (!token) {
      alert('You must be logged in to setup MFA.');
      return;
    }

    if (isMfaToken(token)) {
      alert('Current token is a temporary MFA token. Complete login first before setting up MFA.');
      return;
    }

    try {
      const data = await setupMfa();
      setQrCodeUrl(data.qrCodeUrl);
      setShowMfaSetup(true);
    } catch (error: any) {
      // Give more helpful feedback to the user
      if (error?.response?.status === 403) {
        alert('Not authorized to setup MFA. Ensure you are logged in with a full session token.');
      } else {
        alert('Failed to setup MFA. Try again later.');
      }
      console.error('setupMfa error', error);
    }
  };

  const handleEnableMfa = async () => {
    console.log('Enabling MFA with code:', totpCode);
    try {
      await enableMfa(totpCode);
      console.log('MFA Enabled Successfully');
      alert('MFA Enabled Successfully!');
      setShowMfaSetup(false);
    } catch (error) {
      console.error('MFA Enable Failed', error);
      alert('Invalid Code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/profile" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors">
            Profile
          </Link>
          <button onClick={handleSetupMfa} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors">
            Enable MFA
          </button>
          <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Streak Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-500">🔥 Your Streak</h2>
          <p className="text-gray-400">Keep practicing daily to increase your streak!</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{streak.currentStreak} <span className="text-lg text-gray-500">days</span></div>
          <div className="text-sm text-gray-500">Max Streak: {streak.maxStreak} days</div>
        </div>
      </div>

      {showMfaSetup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Setup 2FA</h3>
            <p className="mb-4 text-gray-300">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
            {qrCodeUrl && <img src={qrCodeUrl} alt="MFA QR Code" className="mx-auto mb-4 border-4 border-white rounded" />}
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={handleEnableMfa} className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded">Verify & Enable</button>
              <button onClick={() => setShowMfaSetup(false)} className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">✨ Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <Link 
                key={rec.poseName} 
                to={`/practice/${rec.poseName}`}
                className="block p-6 bg-gradient-to-br from-purple-900 to-gray-800 rounded-lg hover:from-purple-800 hover:to-gray-700 transition-all transform hover:-translate-y-1 shadow-lg border border-purple-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{rec.poseName}</h3>
                  <span className="text-xs px-2 py-1 bg-purple-600 rounded-full">{rec.difficulty}</span>
                </div>
                <p className="text-gray-300 text-sm">{rec.reason}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <h2 className="text-2xl mb-6">All Poses</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {poses.map((pose) => (
          <Link 
            key={pose} 
            to={`/practice/${pose}`}
            className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all transform hover:-translate-y-1 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-2">{pose}</h3>
            <p className="text-gray-400">Click to start practicing {pose} pose.</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
