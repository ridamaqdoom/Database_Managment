import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatArea from './chatArea'; // Import ChatArea component

const ViewChannel = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    // Fetch channels from the server on component mount
    fetchChannels();
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

  const handleSelectChannel = async(channelID) => {
    const token = localStorage.getItem('token');
    console.log('Selected Channel:', channelID);

    if (!token) {
      alert('You need to log in to create a channel.');
      navigate('/login');
      return;
    }

    try {
      // Include the authorization token in the headers
      //const response = await axios.get(`http://localhost:8080/create-channels/${channelID}`);
      setSelectedChannel(channelID);
      console.log('Selected Channel:', channelID);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
   
      
};
    // Navigate to the ChatArea component with the selected channelId in the URL
    
    

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
      <div className='view-channel-container'>
        <div className='view-channel'>
          <h2>Channels</h2>
          <div className='channel-container'>
            {channels.map((channel) => (
              <button key={channel.channelID} onClick={() => handleSelectChannel(channel.channelID)}>
                username: {channel.username}<br />
                {channel.channelName}: {channel.description}
              </button>
            ))}
          </div>
        </div>
        <div className='message-container'>
          {selectedChannel && (
            <ChatArea channelID={selectedChannel} />
          )}
        </div>
      </div>
    </div>
  );
};

export const getMessagesForChannel = async (channelID) => {
  try {
    const response = await fetch(`http://localhost:8080/create-channels/${channelID}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
export default ViewChannel;
