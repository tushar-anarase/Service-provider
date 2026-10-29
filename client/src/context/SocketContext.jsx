import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000', { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('newMessage', (msg) => {
      window.dispatchEvent(new CustomEvent('newMessage', { detail: msg }));
    });

    return () => { socket.disconnect(); };
  }, [user]);

  const markAllRead = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, unreadCount, markAllRead, setNotifications, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
