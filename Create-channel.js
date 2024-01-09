import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const CreateChannel = ({ onChannelcreation }) => {
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [channels, setChannels] = useState([]); // Add this line

  

  const handleCreateChannel = async () => {
    const token = localStorage.getItem('token');
  
    console.log(token);
  
    if (!token) {
      alert('You need to log in to create a channel.');
      navigate('/login');
      return;
    }
  
    if (!channelName.trim()) {
      alert('Channel name is required.');
      return;
    }
  
    try {
      // Include the channelName, description, and username in the request body
      const response = await axios.post(
        'http://localhost:8080/create-channel',
        {
          channelName: channelName,
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const channelId = response.data.channelId; 
      // Rest of your code...

      

      // Store data in localStorage

      alert('Channel created successfully:', response.data);
      window.location.reload();
      onChannelcreation();
    } catch (error) {
      console.log('Error creating channel:', error);

      if (error.response && error.response.data && error.response.status === 400) {
        alert('Channel name already exists');
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    setChannelName('');
    setDescription('');
  }, [onChannelcreation]);

  // ... rest of your component code


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
      <div className="create-channel">
        <h2>Create Channel</h2>
        <p>
          Pose thoughtful and logical questions to our community and receive
          insightful answers to enhance your problem-solving skills. 'Ask and
          Answer' is your gateway to a collaborative space where programming
          enthusiasts unite to share knowledge and provide solutions.
        </p>

        {/* Create Channel Form */}
        <div>
          <label>
            Channel Name:
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </label>

          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button onClick={handleCreateChannel}>Create Channel</button>
        </div>
        <br></br>
        {/* Success Message and Navigation */}
        {channels.length > 0 && (
          <div>
            <Link to="/view-channel">
              <button>View Channel and Ask Questions</button>
            </Link>
          </div>
        )}

        {/* View Channels */}
      </div>
    </div>
  );
};


export default CreateChannel;