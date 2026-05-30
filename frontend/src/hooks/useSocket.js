import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket(onNewsUpdate) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    socketRef.current.on('news:update', (articles) => {
      if (onNewsUpdate) onNewsUpdate(articles);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}
