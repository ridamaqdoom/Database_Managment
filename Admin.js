import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css'; 


const Admin = () => {
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    // Fetch channels, messages, and replies when the component mounts
    fetchChannels();
    fetchMessages();
    fetchReplies();
  }, []);

  const fetchChannels = async () => {
    try {
      // Include the authorization token in the headers
      const response = await axios.get('http://localhost:8080/create-channels');
      setChannels(response.data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchMessages = async () => {
    //console.log(channelID, "hii")
    try {
      // Include the authorization token in the headers
      const response = await axios.get(`http://localhost:8080/view-channels`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching Messages:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/replies`);
      console.log('Fetched replies:', response.data);

      setReplies(response.data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };
  

  const handleDeletechannel = async (type, channelID) => {
    try {
      await axios.delete(`http://localhost:8080/channels/${channelID}`);
      // Refresh the data after deletion
      if (type === 'channels') {
        fetchChannels();
      } 
    } catch (error) {
      console.error(`Error deleting ${type} with id ${channelID}:`, error);
    }
  };
  const handleDeleteMessage = async (type,messageID) => {
    try {
      await axios.delete(`http://localhost:8080/messages/${messageID}`);
      // Refresh the data after deletion
      if (type === 'messages') {
        fetchMessages();
      } 
    } catch (error) {
      console.error(`Error deleting ${type} with id ${messageID}:`, error);
    }
  };
  
  const handleDeleteReplies = async (type,replyID) => {
    try {
      await axios.delete(`http://localhost:8080/replies/${replyID}`);
      // Refresh the data after deletion
      if (type === 'replies') {
        fetchReplies();
      } 
    } catch (error) {
      console.error(`Error deleting ${type} with id ${replyID}:`, error);
    }
  };

  

  return (
    <div>
         <div className="ribbon">
        <Link to="/" className="Link">
          Home
        </Link>
        <Link to="/create-channel" className="Link">
          Create Channel
        </Link>
        <Link to="/view-channels" className="Link">
          View All Channels
        </Link>
        <Link to="/Messages" className="Link">
          Post programming News
        </Link>
        <Link to="/register" className="Link">
          Register
        </Link>
        <Link to="/search" className="Link">
          Search
        </Link>
      </div>

      <h2>Admin Dashboard</h2>
      <div className='buttonss'>
      <button onClick={() => fetchChannels()}>Show All Channels</button>
      <button onClick={() => fetchMessages()}>Show All Messages</button>
      <button onClick={() => fetchReplies()}>Show All Replies</button>
      </div>
      <div className='channelT'>
        <div className='c1'>
        <h3>All Channels</h3>
        <ul>
          {channels.map((channel) => (
            <li key={channel.channelID}>
             <p>username:{channel.username}  </p>
             <p>ChannelName: {channel.channelName}</p>
             <p>{channel.description}</p>
              <button onClick={() => handleDeletechannel('channels', channel.channelID)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className='c2'>
        <h3>All Messages</h3>
        <ul>
          {messages.map((message) => (
            <li key={message.messageID}>
             <p>username: {message.username}{' '}</p> 
             <p>channeID: {message.channelID}</p>
             <p> {message.content}{' '}</p>
              <button onClick={() => handleDeleteMessage('messages', message.messageID)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className='c3'>
        <h3>All Replies</h3>
        <ul>
          {replies.map((reply) => (
            <li key={reply.replyID}>
                 <p>username: {reply.username}{' '}</p> 
             <p>channeID: {reply.channelID}</p>
             <p>MessageID: {reply.messageID}</p>
             <p>{reply.content}{' '}</p> 
              <button onClick={() => handleDeleteReplies('replies', reply.replyID)}>Delete</button>
            </li>
          ))}
        </ul>
      </div></div>
    </div>
  );
};

export default Admin;
