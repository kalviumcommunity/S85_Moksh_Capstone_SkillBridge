import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from './config/constants';

export const SocketContext = createContext(null);

export const SocketProvider = ({ userId, children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const connectionTimeoutRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setIsConnected(false);
      setIsAuthenticated(false);
      return;
    }
    
    const socketUrl = getApiBaseUrl();
    console.log('🔌 [Socket] Connecting to:', socketUrl, 'for user:', userId);
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    
    // Set connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        console.error('❌ [Socket] Connection timeout after 20 seconds');
        socketRef.current?.disconnect();
      }
    }, 20000);
    
    socketRef.current.on('connect', () => {
      console.log('✅ [Socket] Connected successfully');
      setIsConnected(true);
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // Join user room with retry logic
      const joinWithRetry = (attempts = 3) => {
        if (attempts <= 0) {
          console.error('❌ [Socket] Failed to join room after retries');
          return;
        }
        
        // Check if socket is still available
        if (!socketRef.current || !socketRef.current.connected) {
          console.log('⚠️ [Socket] Socket not available for join retry');
          return;
        }
        
        console.log('🏠 [Socket] Attempting to join room, attempts left:', attempts);
        socketRef.current.emit('join', userId);
        
        // Set timeout for join confirmation
        const joinTimeout = setTimeout(() => {
          if (!isAuthenticated) {
            console.log('⚠️ [Socket] Join timeout, retrying...');
            joinWithRetry(attempts - 1);
          }
        }, 3000);
        
        // Clear timeout when join is confirmed
        const handleJoined = (data) => {
          clearTimeout(joinTimeout);
          console.log('✅ [Socket] Successfully joined room:', data);
          setIsAuthenticated(true);
          socketRef.current.off('joined', handleJoined);
        };
        
        socketRef.current.once('joined', handleJoined);
      };
      
      joinWithRetry();
    });
    
    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ [Socket] Disconnected:', reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error);
      setIsConnected(false);
      setIsAuthenticated(false);
    });
    
    socketRef.current.on('error', (error) => {
      console.error('❌ [Socket] Socket error:', error);
    });
    
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log('🔄 [Socket] Reconnected after', attemptNumber, 'attempts');
    });
    
    socketRef.current.on('reconnect_error', (error) => {
      console.error('❌ [Socket] Reconnection error:', error);
    });
    
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      
      if (socketRef.current) {
        console.log('🧹 [Socket] Cleaning up connection');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      setIsConnected(false);
      setIsAuthenticated(false);
    };
  }, [userId]);

  // Enhanced socket object with connection state
  const socketWithState = socketRef.current ? {
    ...socketRef.current,
    isConnected,
    isAuthenticated,
    // Safe emit that checks connection state
    safeEmit: (event, data, callback) => {
      if (!socketRef.current || !isConnected) {
        console.warn('⚠️ [Socket] Cannot emit - not connected:', event);
        if (callback) callback({ error: 'Not connected' });
        return false;
      }
      
      if (event !== 'join' && !isAuthenticated) {
        console.warn('⚠️ [Socket] Cannot emit - not authenticated:', event);
        if (callback) callback({ error: 'Not authenticated' });
        return false;
      }
      
      socketRef.current.emit(event, data, callback);
      return true;
    }
  } : null;

  return (
    <SocketContext.Provider value={socketWithState}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  
  return {
    socket,
    isConnected: socket?.isConnected || false,
    isAuthenticated: socket?.isAuthenticated || false,
    emit: socket?.safeEmit || (() => {
      console.warn('⚠️ [Socket] No socket available for emit');
      return false;
    }),
    on: socket?.on || (() => {}),
    off: socket?.off || (() => {}),
    once: socket?.once || (() => {})
  };
}; 