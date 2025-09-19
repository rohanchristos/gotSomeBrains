import { useState, useEffect } from 'react';
import { chatService, type ChatRoom } from '../../services/chatService';
import ChatWithDoctor from './ChatWithDoctor';

interface DoctorDashboardProps {
  onClose: () => void;
}

const DoctorDashboard = ({ onClose }: DoctorDashboardProps) => {
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [doctorName] = useState('Dr. Smith'); // In a real app, this would come from auth
  const [doctorId] = useState('doctor_001'); // In a real app, this would come from auth
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadWaitingRooms();
    const interval = setInterval(loadWaitingRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadWaitingRooms = async () => {
    try {
      const rooms = await chatService.getWaitingRooms();
      setWaitingRooms(rooms);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading waiting rooms:', err);
      setError('Failed to load waiting rooms');
      setIsLoading(false);
    }
  };

  const acceptRoom = async (room: ChatRoom) => {
    try {
      await chatService.acceptChatRoom(room.roomId, doctorId, doctorName);
      setActiveRoom(room);
      // Remove from waiting list
      setWaitingRooms(prev => prev.filter(r => r.roomId !== room.roomId));
    } catch (err) {
      console.error('Error accepting room:', err);
      setError('Failed to accept chat room');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (activeRoom) {
    return (
      <ChatWithDoctor
        patientName={activeRoom.patientName}
        patientId={activeRoom.patientId}
        assessmentData={activeRoom.assessmentData}
        onClose={() => {
          setActiveRoom(null);
          loadWaitingRooms();
        }}
      />
    );
  }

  return (
    <div className="chat-overlay">
      <div className="chat-container" style={{ maxWidth: '800px' }}>
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>👨‍⚕️ Doctor Dashboard</h3>
            <div className="chat-status">
              <span className="status-text">
                {waitingRooms.length} patient{waitingRooms.length !== 1 ? 's' : ''} waiting
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages" style={{ minHeight: '400px', maxHeight: '500px' }}>
          {isLoading ? (
            <div className="chat-loading">
              <div className="loading-spinner"></div>
              <p>Loading waiting patients...</p>
            </div>
          ) : error ? (
            <div className="chat-error">
              <p>❌ {error}</p>
              <button onClick={loadWaitingRooms} className="retry-button">
                Try Again
              </button>
            </div>
          ) : waitingRooms.length === 0 ? (
            <div className="waiting-message">
              <div className="waiting-animation">😴</div>
              <p>No patients waiting for consultation</p>
              <small>New chat requests will appear here automatically</small>
            </div>
          ) : (
            <div className="waiting-rooms-list">
              {waitingRooms.map((room) => (
                <div key={room.roomId} className="waiting-room-card">
                  <div className="room-header">
                    <div className="patient-info">
                      <h4>👤 {room.patientName}</h4>
                      <span className="wait-time">{formatTimeAgo(room.createdAt)}</span>
                    </div>
                    <div className="priority-badge" style={{ backgroundColor: getPriorityColor(room.priority) }}>
                      {room.priority.toUpperCase()}
                    </div>
                  </div>
                  
                  {room.assessmentData && (
                    <div className="assessment-preview">
                      <p><strong>Assessment:</strong> {room.assessmentData.assessment_type || 'General'}</p>
                      {room.assessmentData.ml_results && (
                        <p><strong>Risk Level:</strong> {room.assessmentData.ml_results.risk_level || 'Unknown'}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="room-actions">
                    <button 
                      onClick={() => acceptRoom(room)}
                      className="accept-button"
                    >
                      Accept Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <div className="doctor-info">
            <p>👨‍⚕️ Logged in as: <strong>{doctorName}</strong></p>
            <button onClick={loadWaitingRooms} className="refresh-button">
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
