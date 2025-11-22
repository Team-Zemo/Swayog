import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const Practice: React.FC = () => {
  const { poseName } = useParams<{ poseName: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('Waiting for server...');
  const [similarity, setSimilarity] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef(uuidv4());
  
  // Voice feedback throttling refs
  const lastSpokenTime = useRef<number>(0);
  const lastSpokenMessage = useRef<string>('');

  const speak = (text: string) => {
    if (!text) return;
    
    const now = Date.now();
    const isSameMessage = text === lastSpokenMessage.current;
    
    // Throttling: 
    // - If same message: wait 8 seconds
    // - If different message: wait 3 seconds
    const interval = isSameMessage ? 8000 : 3000;
    
    if (now - lastSpokenTime.current > interval) {
      // Cancel current speech to prioritize new feedback
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: Adjust rate/pitch if needed
      // utterance.rate = 1.0; 
      
      window.speechSynthesis.speak(utterance);
      
      lastSpokenTime.current = now;
      lastSpokenMessage.current = text;
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/${clientId.current}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      // Send the selected pose to the server
      if (poseName) {
        ws.send(JSON.stringify({ pose_type: poseName }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.error) {
          setFeedback(`Error: ${data.error}`);
          return;
        }

        if (data.frame) {
          setImageSrc(`data:image/jpeg;base64,${data.frame}`);
        }

        if (data.feedback) {
          setSimilarity(data.feedback.similarity);
          setFeedback(data.feedback.feedback_text);
          
          // Trigger voice feedback if available
          if (data.feedback.voice_message) {
            speak(data.feedback.voice_message);
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Cancel any ongoing speech when disconnected
      window.speechSynthesis.cancel();
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ command: 'stop' }));
        ws.close();
      }
      // Ensure speech stops when component unmounts
      window.speechSynthesis.cancel();
    };
  }, [poseName, token, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Practicing: {poseName}</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        {/* Video Feed */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
          {imageSrc ? (
            <img src={imageSrc} alt="Live Feed" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-gray-500 animate-pulse">Connecting to camera...</div>
          )}
          
          {/* Overlay Similarity Score */}
          <div className="absolute top-4 right-4 bg-black/50 p-2 rounded text-xl font-bold">
            Score: {(similarity * 100).toFixed(1)}%
          </div>
        </div>

        {/* Feedback Panel */}
        <div className="w-full md:w-80 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">AI Feedback</h2>
          <div className="whitespace-pre-wrap text-gray-300 flex-1 overflow-y-auto">
            {feedback}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
