import { useEffect, useState } from 'react';
import { isOnline } from '../utils/pwa.js';

const Offline = () => {
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    
    // Wait a bit to show loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isOnline()) {
      // Redirect to home page if back online
      window.location.href = '/';
    } else {
      setIsCheckingConnection(false);
    }
  };

  useEffect(() => {
    // Listen for online event
    const handleOnline = () => {
      window.location.href = '/';
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white border border-white/20">
        {/* Offline Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center text-4xl">
          📡
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>

        {/* Description */}
        <p className="text-lg mb-6 opacity-90">
          Don't worry! You can still access some features of AI E-Learning while offline. 
          Your progress will sync when you're back online.
        </p>

        {/* Retry Button */}
        <button
          onClick={checkConnection}
          disabled={isCheckingConnection}
          className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 border-2 border-white/30 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 mb-6"
        >
          {isCheckingConnection ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking Connection...
            </span>
          ) : (
            'Try Again'
          )}
        </button>

        {/* Available Features */}
        <div className="text-left space-y-3">
          <h3 className="font-semibold text-lg mb-3">Available Offline:</h3>
          
          <div className="flex items-center space-x-3 opacity-80">
            <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-sm">
              📚
            </div>
            <span>View cached course materials</span>
          </div>
          
          <div className="flex items-center space-x-3 opacity-80">
            <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-sm">
              ✅
            </div>
            <span>Complete offline quizzes</span>
          </div>
          
          <div className="flex items-center space-x-3 opacity-80">
            <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-sm">
              📊
            </div>
            <span>Review your progress</span>
          </div>
          
          <div className="flex items-center space-x-3 opacity-80">
            <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-sm">
              🔄
            </div>
            <span>Auto-sync when online</span>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-white/10 rounded-lg text-sm opacity-80">
          <p className="font-semibold mb-2">💡 Tip:</p>
          <p>
            Install this app on your device for a better offline experience. 
            Look for the install button in your browser or app menu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offline;
