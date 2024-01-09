import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatComponent = ({ channelId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();

    // Connect to WebSocket for real-time updates
    connectWebSocket();

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [channelId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/messages/${channelId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket(`ws://localhost:8080/channel/${channelId}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleSendMessage = async () => {
    try {
      // Send the new message to the server
      await axios.post('http://localhost:8080/messages', {
        channelId,
        userId,
        content: newMessage,
      });

      // Clear the input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      {/* Display messages and replies */}
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.username}</strong>: {message.content}
          </div>
        ))}
      </div>

      {/* Input field for new message */}
      <div>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send Message</button>
      </div>
    </div>
  );
};

export default ChatComponent;
