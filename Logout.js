// Logout.js
import React from 'react';

const Logout = ({ onLogout }) => {
    const handleLogoutClick = () => {
      // Confirm logout
      const confirmLogout = window.confirm('Are you sure you want to log out?');
  
      if (confirmLogout) {
        // Call the onLogout function
        onLogout();
      }
    };
  
    return (
      <button onClick={handleLogoutClick}>Logout</button>
    );
  };
  

export default Logout;
