import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Landing';
import Registration from './Registration';
import Login from './Login';
import CreateChannel from './Create-channel';
import ViewChannel from './View-Channel';
import PostMessage from './postMessage';
import ChatArea from './chatArea';
import Logout from './Logout';
import Search from './Search';
import Admin from './Admin';


const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const [isLoggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    // Your logout logic here
    setLoggedIn(false);
    localStorage.removeItem('token'); // Remove the token from local storage
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onLogout={handleLogout} />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Search/>} />
        <Route path="/admin" element={<Admin/>} />


        <Route path="/create-channel" element={isAuthenticated ? <CreateChannel /> : <CreateChannel />} />
        
        <Route
          path="/view-channels/*"
          element={isAuthenticated ? <ViewChannel /> : <ViewChannel />}
        />
      
          <Route path="/view-channels/:channelID" element={isAuthenticated ? <ChatArea /> : <ChatArea />} />
          <Route path="/view-channels/:channelID/replies/:messageID" element={isAuthenticated ? <ChatArea /> : <ChatArea />} />
          <Route path="/view-channels/:channelID/nested-replies/:messageID" element={isAuthenticated ? <ChatArea /> : <ChatArea />} />
          <Route path="/view-channels/:channelID/replies/:replyId/approve" element={isAuthenticated ? <ChatArea /> : <ChatArea />} />
          <Route path="/view-channels/:channelID/replies/:replyId/disapprove" element={isAuthenticated ? <ChatArea /> : <ChatArea />} />

        <Route path="/Messages" element={isAuthenticated ? <PostMessage /> : <PostMessage />} />
        <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
        {/* ... other routes */}
      </Routes>
    </Router>
  );
};

export default App;
