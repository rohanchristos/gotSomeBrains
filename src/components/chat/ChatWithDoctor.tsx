import { useState, useEffect, useRef, useCallback } from 'react';
import { chatService, type ChatMessage, type ChatRoom } from '../../services/chatService';

interface ChatWithDoctorProps {
  patientName: string;
  patientId: string;
  assessmentData?: any;
  onClose: () => void;
}

const ChatWithDoctor = ({ patientName, patientId, assessmentData, onClose }: ChatWithDoctorProps) => {
  console.log('ChatWithDoctor component loaded', { patientName, patientId });
  const [socket, setSocket] = useState<any>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = useCallback((socketConnection: any, currentRoomId: string) => {
    socketConnection.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    socketConnection.on('message_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socketConnection.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socketConnection.on('doctor_joined', (data: { doctorName: string; message: string }) => {
      setChatRoom(prev => prev ? { ...prev, doctorName: data.doctorName, status: 'active' } : null);
      // Add system message
      const systemMessage: ChatMessage = {
        _id: `system-${Date.now()}`,
        roomId: currentRoomId,
        senderId: 'system',
        senderName: 'System',
        senderType: 'doctor',
        message: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socketConnection.on('user_typing', (data: { userName: string; userType: string; isTyping: boolean }) => {
      if (data.userType !== 'patient') {
        setOtherUserTyping(data.isTyping ? `${data.userName} is typing...` : '');
      }
    });

    socketConnection.on('chat_ended', () => {
      setChatRoom(prev => prev ? { ...prev, status: 'completed' } : null);
    });

    socketConnection.on('error', (data: { message: string }) => {
      setError(data.message);
    });
  }, []);

  const initializeChat = useCallback(async () => {
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('Chat already initialized, skipping...');
      return;
    }

    try {
      console.log('Initializing chat...');
      setIsLoading(true);
      setError('');
      setIsInitialized(true);

      // Create or get existing chat room
      const roomResponse = await chatService.createChatRoom(
        patientId,
        patientName,
        assessmentData,
        'medium'
      );

      setRoomId(roomResponse.roomId);
      
      // Get room details
      const room = await chatService.getChatRoom(roomResponse.roomId);
      setChatRoom(room);

      // Connect to socket
      const socketConnection = chatService.connect();
      setSocket(socketConnection);

      // Set up socket event listeners
      setupSocketListeners(socketConnection, roomResponse.roomId);

      // Join the room
      socketConnection.emit('join_room', {
        roomId: roomResponse.roomId,
        userId: patientId,
        userType: 'patient',
        userName: patientName
      });

      setIsLoading(false);
      console.log('Chat initialized successfully');

    } catch (err) {
      console.error('Error initializing chat:', err);
      setError('Failed to initialize chat. Please try again.');
      setIsLoading(false);
      setIsInitialized(false); // Reset on error
    }
  }, [patientId, patientName, assessmentData, setupSocketListeners, isInitialized]);

  useEffect(() => {
    initializeChat();
    return () => {
      console.log('Cleaning up chat connection...');
      if (socket) {
        socket.disconnect();
      }
      chatService.disconnect();
      setIsInitialized(false);
    };
  }, [initializeChat, socket]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !roomId) return;

    socket.emit('send_message', {
      roomId,
      message: newMessage.trim()
    });

    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      socket.emit('typing', { roomId, isTyping: false });
      setIsTyping(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socket || !roomId) return;

    // Send typing indicator
    if (!isTyping && value.trim()) {
      socket.emit('typing', { roomId, isTyping: true });
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        socket.emit('typing', { roomId, isTyping: false });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endChat = () => {
    if (socket && roomId) {
      socket.emit('end_chat', { roomId });
    }
    onClose();
  };

  if (isLoading) {
    return (
      <div className="chat-overlay">
        <div className="chat-container">
          <div className="chat-header">
            <h3>🩺 Chat with Doctor</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="chat-loading">
            <div className="loading-spinner"></div>
            <p>Connecting to chat service...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-overlay">
        <div className="chat-container">
          <div className="chat-header">
            <h3>🩺 Chat with Doctor</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="chat-error">
            <p>❌ {error}</p>
            <button onClick={() => {
              setIsInitialized(false);
              initializeChat();
            }} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>🩺 Chat with Doctor</h3>
            <div className="chat-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢' : '🔴'}
              </span>
              <span className="status-text">
                {chatRoom?.status === 'waiting' && 'Waiting for doctor...'}
                {chatRoom?.status === 'active' && `Connected with ${chatRoom.doctorName || 'Doctor'}`}
                {chatRoom?.status === 'completed' && 'Chat ended'}
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {chatRoom?.status === 'waiting' && (
            <div className="waiting-message">
              <div className="waiting-animation">⏳</div>
              <p>Please wait while we connect you with an available doctor...</p>
              <small>Your position in queue will be prioritized based on your assessment results.</small>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.senderType === 'patient' ? 'message-sent' : 'message-received'} ${message.senderId === 'system' ? 'message-system' : ''}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {message.senderType === 'patient' ? '👤 You' : 
                   message.senderId === 'system' ? '🤖 System' : `👨‍⚕️ ${message.senderName}`}
                </span>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">
                {message.message}
              </div>
            </div>
          ))}

          {otherUserTyping && (
            <div className="typing-indicator">
              <span>{otherUserTyping}</span>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {chatRoom?.status !== 'completed' && (
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatRoom?.status === 'waiting' ? 'Waiting for doctor to join...' : 'Type your message...'}
                className="chat-input"
                disabled={chatRoom?.status === 'waiting'}
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || chatRoom?.status === 'waiting'}
                className="send-button"
              >
                📤
              </button>
            </div>
            <div className="chat-actions">
              <button onClick={endChat} className="end-chat-button">
                End Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithDoctor;
