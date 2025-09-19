// @ts-ignore - Socket.IO client types
import { io } from 'socket.io-client';

export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderType: 'patient' | 'doctor';
  message: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface ChatRoom {
  roomId: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
  lastActivity: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assessmentData?: any;
}

class ChatService {
  private socket: any = null;
  private readonly serverUrl = 'http://localhost:3001';

  connect(): any {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling']
      });
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): any {
    return this.socket;
  }

  // API calls for chat functionality
  async createChatRoom(patientId: string, patientName: string, assessmentData?: any, priority: string = 'medium'): Promise<any> {
    const response = await fetch(`${this.serverUrl}/chat/room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId,
        patientName,
        assessmentData,
        priority
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat room');
    }

    return response.json();
  }

  async getChatRoom(roomId: string): Promise<ChatRoom> {
    const response = await fetch(`${this.serverUrl}/chat/room/${roomId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat room');
    }

    return response.json();
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.serverUrl}/chat/messages/${roomId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  }

  async getWaitingRooms(): Promise<ChatRoom[]> {
    const response = await fetch(`${this.serverUrl}/chat/waiting-rooms`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch waiting rooms');
    }

    return response.json();
  }

  async acceptChatRoom(roomId: string, doctorId: string, doctorName: string): Promise<any> {
    const response = await fetch(`${this.serverUrl}/chat/accept/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId,
        doctorName
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to accept chat room');
    }

    return response.json();
  }
}

export const chatService = new ChatService();
