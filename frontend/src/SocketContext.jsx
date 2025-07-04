import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from './config/constants';

export const SocketContext = createContext(null);

export const SocketProvider = ({ userId, children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    socketRef.current = io(getApiBaseUrl(), {
      transports: ['websocket']
    });
    socketRef.current.emit('join', userId);
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 