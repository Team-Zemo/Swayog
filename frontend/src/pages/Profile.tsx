import React, { useEffect, useState } from 'react';
import { userApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  bio: string;
  age: number | '';
  gender: string;
  height: number | '';
  weight: number | '';
  experienceLevel: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    bio: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    experienceLevel: 'BEGINNER'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userApi.get('/profile');
      // Merge with default values to handle nulls
      setProfile(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await userApi.post('/profile', profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-600' : 'bg-red-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
            <textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
              <select
                name="gender"
                value={profile.gender || ''}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={profile.height}
                onChange={handleChange}
                step="0.1"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={profile.weight}
                onChange={handleChange}
                step="0.1"
                className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Experience Level</label>
            <select
              name="experienceLevel"
              value={profile.experienceLevel || 'BEGINNER'}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
