import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';
const LandingPage = ({ onLogout }) => {

  const handleLogout = () => {
    // Ask the user if they really want to log out
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    // If the user confirms, perform the logout action
    if (confirmLogout) {
      // Perform logout actions (e.g., clear token, redirect to login page)
      localStorage.removeItem('token');
      onLogout(); // This can be a function passed down from a parent component to update the authentication status
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
        <span className="Link" onClick={handleLogout}>
        Logout
      </span>
      </div>
      <div className="container">
        <h1>Welcome to Programming Tool</h1>
        <p>
          A platform to post programming questions, provide answers, and collaborate with the community.
        </p>
       
      </div>
      <div className="box-container">
      <Link to="/create-channel" className="box">
          <h2>Forge Channels: Empowering Through Knowledge Exchange.</h2>
          <p>Embark on a collaborative journey by creating a channel on our platform – a space where you can contribute your knowledge and seek assistance from a vibrant community. Elevate your programming experience by establishing a channel, fostering a network of shared expertise, and engaging in a reciprocal exchange of help and support.</p>
        </Link>
        <Link to="/view-channels" className="box">
          <h2>Discover the Spectrum: Navigate and Learn with View Channels </h2>
          <p>Unlock a world of diverse programming expertise with our 'View Channels' feature. Explore an array of channels curated by the community, each offering unique insights, discussions, and problem-solving approaches.</p>
        </Link>
        <Link to="/Messages" className="box">
          <h2>Engage in Knowledge Exchange with Ask and Answer</h2>
          <p>Pose thoughtful and logical questions to our community and receive insightful answers to enhance your problem-solving skills. 'Ask and Answer' is your gateway to a collaborative space where programming enthusiasts unite to share knowledge and provide solutions. </p>
        </Link>
        </div>
        <div className="button-container">
        <Link to="/register" className="button">
          Start Now
        </Link>
        <Link to="/watch-demo" className="button">
          Watch Demo
        </Link>
      </div>
      <div class="foot">
      <footer className='footer'> Amama Rida Maqdoom- CMPT353</footer>
     </div>
    </div>

  );
};

export default LandingPage;
