import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User } from 'lucide-react';
import { GroupMessage, MessageType } from '../../../shared/types/groupCollaboration';

interface GroupChatProps {
  groupId?: string;
  sessionId?: string;
  taskType?: string;
  messages?: GroupMessage[];
  onSendMessage?: (message: string) => void;
  currentUserId?: string;
}

const GroupChat: React.FC<GroupChatProps> = ({
  groupId,
  sessionId,
  messages = [],
  onSendMessage,
  currentUserId
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageTypeColor = (messageType: MessageType) => {
    switch (messageType) {
      case 'SYSTEM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DECISION':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-white text-gray-800 border-gray-200';
    }
  };

  const getMessageTypeIcon = (messageType: MessageType) => {
    switch (messageType) {
      case 'SYSTEM':
        return '🔔';
      case 'DECISION':
        return '✅';
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Group Chat</h3>
        <div className="ml-auto text-sm text-gray-500">
          {messages.length} messages
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg border ${
                  message.userId === currentUserId
                    ? 'bg-blue-600 text-white border-blue-600'
                    : getMessageTypeColor(message.messageType)
                }`}
              >
                {message.userId !== 'system' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-3 h-3" />
                    <span className="text-xs font-medium opacity-75">
                      {message.user?.name || 'Unknown User'}
                    </span>
                    {getMessageTypeIcon(message.messageType) && (
                      <span className="text-xs">
                        {getMessageTypeIcon(message.messageType)}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
                <div className="text-xs opacity-75 mt-1">
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!groupId && !sessionId}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || (!groupId && !sessionId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat; 