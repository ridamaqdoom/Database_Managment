
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



  const PostMessage = () => {
    const navigate = useNavigate();

  const [newMessage, setNewMessage] = useState('');
   const [results, setResult] = useState([]);

   useEffect(() => {
    fetchnews();
  }, []);
  

   const handlePostMessage = async () => {

      const token = localStorage.getItem('token');

      if (!token) {
        alert('You need to log in to View messages.');
        navigate('/login');
        return;
      }
    
      if (!newMessage.trim()) {
          // If neither message nor image is present, you might want to handle this case
          alert('Please enter a message ');
          return;
        }

        console.log("message", newMessage)

      try {
       const response =  await axios.post('http://localhost:8080/Messages', {
          content: newMessage}, {headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',

          },
        });
       
        setNewMessage('');
        fetchnews();
        } catch (error) {
          console.error('Error searching content:', error);
        }
      };
        // Optionally, you can update the local state or navigate to a different page
     
        const fetchnews = async () => {

          try {
            
            const response = await axios.get(`http://localhost:8080/Messages`,  {
            });
           setResult(response.data);
            
          } catch (error) {
            console.error('Error fetching news:', error);
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
    <div className="post-message">
      <h2>Dive into Programming News Hub</h2>
      <p>
      Get ready to stay informed about the latest in the programming world. Explore insightful news articles, updates, and trends to keep yourself in the loop. Our 'Programming News Hub' is your dedicated space for staying current with programming advancements, industry news, and noteworthy updates. Join us to stay informed and engaged with the dynamic landscape of programming.
      </p>

      <div>
        <label><br></br>
          Your News:
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handlePostMessage}>Post news</button>
      <div>
  <h3>Search Results:</h3>
  <ul>
    {results.map((result) => (
      <li key={result.username}>
        <p>Username: {result.username}</p>
        <p>Content: {result.News}</p>
        {/* Display other relevant information */}
      </li>
    ))}
  </ul>
</div>
    </div>
    </div>
  );
};

export default PostMessage;
