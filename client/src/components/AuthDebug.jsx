// AuthDebug.jsx - Component to help debug authentication issues
import React, { useState } from 'react';
import { authService } from '../services/authService';

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    const info = {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      hasUser: !!user,
      userInfo: user ? JSON.parse(user) : null,
      timestamp: new Date().toISOString()
    };

    // Test token validity by calling getMe
    try {
      const response = await authService.getMe();
      info.tokenValid = true;
      info.serverResponse = response;
    } catch (error) {
      info.tokenValid = false;
      info.error = error.message;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setDebugInfo(null);
    alert('Authentication data cleared. Please refresh the page and log in again.');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '15px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🔍 Auth Debug Tool</h4>
      
      <button 
        onClick={checkAuthStatus} 
        disabled={loading}
        style={{ marginRight: '10px', padding: '5px 10px' }}
      >
        {loading ? 'Checking...' : 'Check Auth Status'}
      </button>
      
      <button 
        onClick={clearAuth}
        style={{ padding: '5px 10px', background: '#ff6b6b', color: 'white', border: 'none' }}
      >
        Clear Auth Data
      </button>

      {debugInfo && (
        <div style={{ marginTop: '10px', fontSize: '11px' }}>
          <div><strong>Has Token:</strong> {debugInfo.hasToken ? '✅' : '❌'}</div>
          <div><strong>Token Length:</strong> {debugInfo.tokenLength}</div>
          <div><strong>Token Preview:</strong> {debugInfo.tokenPreview}</div>
          <div><strong>Has User Data:</strong> {debugInfo.hasUser ? '✅' : '❌'}</div>
          <div><strong>Token Valid:</strong> {debugInfo.tokenValid ? '✅' : '❌'}</div>
          
          {debugInfo.userInfo && (
            <div style={{ marginTop: '5px' }}>
              <strong>User:</strong> {debugInfo.userInfo.name} ({debugInfo.userInfo.email})
            </div>
          )}
          
          {debugInfo.error && (
            <div style={{ color: 'red', marginTop: '5px' }}>
              <strong>Error:</strong> {debugInfo.error}
            </div>
          )}
          
          <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
            Last checked: {new Date(debugInfo.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
