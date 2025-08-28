import { useState, useEffect, useCallback } from 'react';
import wsService from '../services/ws.js';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleMessage = (data) => {
      setLastMessage(data);
    };

    const handleError = (error) => {
      setError(error);
    };

    // Set up event listeners
    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('message', handleMessage);
    wsService.on('error', handleError);

    // Connect if not already connected
    if (!wsService.isConnected()) {
      wsService.connect().catch(setError);
    } else {
      setIsConnected(true);
    }

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('message', handleMessage);
      wsService.off('error', handleError);
    };
  }, []);

  const sendMessage = useCallback((data) => {
    return wsService.send(data);
  }, []);

  const addEventListener = useCallback((event, callback) => {
    wsService.on(event, callback);
    return () => wsService.off(event, callback);
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    addEventListener
  };
}