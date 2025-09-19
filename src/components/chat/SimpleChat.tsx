import { useState, useEffect, useRef } from 'react';

interface SimpleChatProps {
  onClose: () => void;
}

interface ChatMessage {
  id?: number;
  type: 'chat' | 'system';
  sender?: string;
  senderType?: 'patient' | 'doctor';
  message: string;
  timestamp: string;
}

const SimpleChat = ({ onClose }: SimpleChatProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to WebSocket server
    const websocket = new WebSocket('ws://localhost:3002');
    
    websocket.onopen = () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const joinChat = () => {
    if (ws && userName.trim()) {
      ws.send(JSON.stringify({
        type: 'join',
        name: userName.trim(),
        userType: userType
      }));
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (ws && newMessage.trim()) {
      ws.send(JSON.stringify({
        type: 'chat',
        message: newMessage.trim()
      }));
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isJoined) {
        sendMessage();
      } else {
        joinChat();
      }
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>💬 Simple Chat Demo</h3>
            <div className="chat-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '🟢' : '🔴'}
              </span>
              <span className="status-text">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {!isJoined ? (
          <div className="chat-join">
            <h4>Join Chat</h4>
            <div className="join-form">
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="name-input"
              />
              <div className="user-type-selector">
                <label>
                  <input
                    type="radio"
                    value="patient"
                    checked={userType === 'patient'}
                    onChange={(e) => setUserType(e.target.value as 'patient' | 'doctor')}
                  />
                  Patient
                </label>
                <label>
                  <input
                    type="radio"
                    value="doctor"
                    checked={userType === 'doctor'}
                    onChange={(e) => setUserType(e.target.value as 'patient' | 'doctor')}
                  />
                  Doctor
                </label>
              </div>
              <button 
                onClick={joinChat} 
                disabled={!userName.trim() || !isConnected}
                className="join-button"
              >
                Join Chat
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`message ${
                    message.type === 'system' 
                      ? 'message-system' 
                      : message.sender === userName 
                        ? 'message-sent' 
                        : 'message-received'
                  }`}
                >
                  {message.type === 'chat' && (
                    <div className="message-header">
                      <span className="sender-name">
                        {message.sender === userName ? 'You' : message.sender}
                        {message.senderType === 'doctor' && ' 👨‍⚕️'}
                        {message.senderType === 'patient' && ' 👤'}
                      </span>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <div className="message-content">
                    {message.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="chat-input"
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="send-button"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimpleChat;
