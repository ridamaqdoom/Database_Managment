


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatArea = ({ channelID }) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyContents, setReplyContents] = useState([]);
  const [newReply, setNewReply] = useState({});
  const [newNestedReply, setNewNestedReply] = useState({});
  const [isNestedReplyVisible, setIsNestedReplyVisible] = useState({});
  const [approvalCounts, setApprovalCounts] = useState({});
  const [disapprovalCounts, setDisapprovalCounts] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);


  useEffect(() => {
    // Fetch messages and replies when the component mounts
    const fetchData = async (messageID) => {
      try {
        const messagesResponse = await axios.get(`http://localhost:8080/view-channels/${channelID}`);
        const repliesResponse = await axios.get(`http://localhost:8080/view-channels/${channelID}/replies/${messageID}`);
  
        setMessages(messagesResponse.data);
        setReplyContents(repliesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [channelID])


  const handleImageChange = (e) => {
    // Handle image selection
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  
  const handleSendMessage = async () => {

    const token = localStorage.getItem('token');
    if (selectedImage) {
        // Handle sending image
        console.log('Sending image:', selectedImage);
      }
  
    const formData = new FormData();
    formData.append('content', newMessage);
    formData.append('channelID', channelID);
    formData.append('image', selectedImage); // Assuming you only want to send the first file if multiple files are selected
  
    console.log('Selected Channel:', channelID);
    console.log('image', selectedImage);
  
    if (!token) {
      alert('You need to log in to View messages.');
      navigate('/login');
      return;
    }
  
    if (newMessage.trim() === '' && !selectedImage) {
        // If neither message nor image is present, you might want to handle this case
        alert('Please enter a message or select an image.');
        return;
      }
    try {
      const response = await fetch('/view-channels', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log(responseData);
  
      setNewMessage('');
      setSelectedImage(null);
      
      fetchMessages();
    } catch (error) {
      console.error('Error uploading message:', error);
    }
  };
  

  useEffect(() => {
    fetchMessages();
  }, [channelID]);
  
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/view-channels/${channelID}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  

  const fetchReplies = async (messageID, replyID) => {

    try {
      
      const response = await axios.get(`http://localhost:8080/view-channels/${channelID}/replies/${messageID}`,  {
        params: { replyID: replyID }  // Pass the replyID as a parameter
      });
     setReplyContents(response.data);
      
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  
  const handleReply = async (messageID, parentReplyID) => {
    const token = localStorage.getItem('token');
    console.log('Clicked Reply button for messageID:', messageID);
    console.log('Clicked Reply button for messageID:', parentReplyID);



    if (!token) {
      alert('You need to log in to reply to messages.');
      navigate('/login');
      return;
    }
    // if (!newReply[messageID] || !newReply[messageID].trim()) {
    //     alert('Reply content is required.');
    //     return;
    //   }
      

    try {
      await axios.post(
        `http://localhost:8080/view-channels/${channelID}/replies`,
        {
            content:   newReply[messageID] , // Wrap in an object
            channelID: channelID,
            messageID: messageID,
            parentReplyID:parentReplyID
          
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
           // 'Content-Type': 'application/json',
          },
        }
      );
  
      setNewReply({
        ...newReply,
        [messageID]: '', // Clear the reply content after sending
      });
  
      fetchReplies(messageID, parentReplyID); // Refresh the replies after sending a new reply
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  


  const showNestedReplyTextArea = (messageID, replyID) => {
    setIsNestedReplyVisible((prevState) => ({
      ...prevState,
      [`${messageID}-${replyID}`]: !prevState[`${messageID}-${replyID}`],
    }));
 };
 const handleChange = (messageID, replyID, value) => {
    setNewNestedReply((prevNewNestedReply) => ({
      ...prevNewNestedReply,
      [`${messageID}-${replyID}`]: value,
    }));
  };
  
 

 const NestedReplyTextArea = ({ messageID, replyID, e}) => {
    return (
      isNestedReplyVisible[`${messageID}-${replyID}`] && (
        <div className="replies2">
          <textarea
            className="nested-reply-container"
            placeholder="Reply to this nested reply..."
            value={newNestedReply[`${messageID}-${replyID}`] || ''}
            onChange={(e) => handleChange(messageID, replyID, e.target.value)}

          ></textarea>
          <button
            className="nested-reply-button"
            onClick={() => handleNestedReply(messageID, replyID)}
          >
            Post Reply
          </button>
        </div>
      )
    );
 };
const handleNestedReply = async (messageID, replyID) => {
    const token = localStorage.getItem('token');
    console.log('Clicked Reply button for messageID:', messageID);
    console.log('Clicked Reply button for messageID:', replyID);

    if (!token) {
      alert('You need to log in to reply to messages.');
      navigate('/login');
      return;
    }
    //showNestedReplyTextArea(messageID, replyID)

    console.log(newNestedReply[`${messageID}-${replyID}`]);
    showNestedReplyTextArea(messageID, replyID);

    try {
      // Assuming you have a state variable to store newNestedReply
      await axios.post(
        `http://localhost:8080/view-channels/${channelID}/nested-replies`,
        {
          content: newNestedReply[`${messageID}-${replyID}`],
          channelID,
          messageID,
          parentReplyID: replyID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
     
      // Assuming you have a state variable to store newNestedReply
      setNewNestedReply({
        ...newNestedReply,
        [`${messageID}-${replyID}`]: '', // Clear the nested reply content after sending
      });
     
    fetchReplies(messageID, replyID); 
      // Fetch the nested replies after sending a new nested reply
    
    } catch (error) {
      console.error('Error sending nested reply:', error);
    }
  };
 
  const fetchInitialApprovalCounts = async () => {
    console.log("err")
    try {
      const response = await axios.get(`http://localhost:8080/view-channels/${channelID}/initial-approval-counts`);
      setApprovalCounts(response.data);
    } catch (error) {
      console.error('Error fetching initial approval counts:', error);
    }
  };
  
  useEffect(() => {
    fetchInitialApprovalCounts();
  }, [channelID]);
  
  const handleApproval = async (messageID, replyId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in to reply to messages.');
      navigate('/login');
      return;
    }
  
    console.log('Yolo');
  
    try {
      await axios.post(
        `http://localhost:8080/view-channels/${channelID}/replies/${replyId}/approve`,{replyId,
        channelID},
      );
  
      // Update approval counts in the state
      setApprovalCounts((prevCounts) => ({
        ...prevCounts,
        [`${messageID}-${replyId}`]: (prevCounts[`${messageID}-${replyId}`] || 0) + 1,
      }));
    } catch (error) {
      console.error('Error handling approval:', error);
    }
  };
  
  
  // Function to handle disapproval
  const handleDisapproval = async (messageID, replyID) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('You need to log in to reply to messages.');
      navigate('/login');
      return;
    }
  
    try {
      await axios.post(
        `http://localhost:8080/view-channels/${channelID}/replies/${replyID}/disapprove`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Update disapproval counts in the state
      setDisapprovalCounts((prevCounts) => ({
        ...prevCounts,
        [`${messageID}-${replyID}`]:(prevCounts[`${messageID}-${replyID}`] || 0) + 1,
     
      }));
    } catch (error) {
      console.error('Error handling disapproval:', error);
    }
  };
 

  return (
    <div className="chat-area">
    <h2>Chat for Channel {channelID}</h2>
    <h3>Post Message</h3>
    <div className="message-input-container">
      <input type="file" name="image" accept="image/*" multiple={false} onChange={handleImageChange} />
      <textarea
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      ></textarea>
      <button className='button1' onClick={handleSendMessage}>Send</button>
    </div>
    <div className="remove">
        <h2>All Existing Messages:</h2>
        <div className="colour">
          <ul>
            {messages.map((message) => (
              <li key={message.messageID} className="message-containers">
                <p className="username">Username: {message.username}</p>
                <p className="message-content">{message.content}</p>
                {message.imageURL && <img src={message.imageURL} alt="Message Image" className='uploaded-image' />}

                <textarea
                  placeholder="Reply to this message..."
                  value={newReply[message.messageID] || ''}
                  onChange={(e) =>
                    setNewReply({
                      ...newReply,
                      [message.messageID]: e.target.value,
                    })
                  }
                ></textarea>
                <button className='button1' onClick={() => handleReply(message.messageID)}>Reply</button>
                <h2>Replies</h2>
                <div className='replies1'><ul>
                  {Array.isArray(replyContents) && replyContents
                    .filter((reply) => reply.messageID === message.messageID)
                    .map((filteredReply) => (
                      <li key={filteredReply.replyID} className="reply-containers">
                        <p className="username">Username: {filteredReply.username}</p>
                        <p className="reply-content">{filteredReply.content}</p>
                        {/* Add button to show nested reply textarea */}
                        <button
                          className="nested-reply-button"
                          onClick={() => showNestedReplyTextArea(message.messageID, filteredReply.replyID)}>

                          Reply
                        </button>
                        {/* Nested reply textarea component */}
                        <NestedReplyTextArea
                          messageID={message.messageID}
                          replyID={filteredReply.replyID}
                        />
                        <div className="approval-buttons">
                          <button className="ab" onClick={() => handleApproval(message.messageID, filteredReply.replyID)}>
                            👍
                          </button>
                          <span>{approvalCounts[`${message.messageID}-${filteredReply.replyID}`]|| 0}</span>
  
                          <button className="ab" onClick={() => handleDisapproval(message.messageID, filteredReply.replyID)}>
                            👎
                          </button>
                          <span>{disapprovalCounts[`${message.messageID}-${filteredReply.replyID}`]|| 0}</span>
                        </div>
                      </li>
                    ))}</ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
  
  
                      }  

  export default ChatArea;
  