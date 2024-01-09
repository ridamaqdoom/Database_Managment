
import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './index.css'; 



const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // ... (existing code)

    try {
      const response = await axios.post('http://localhost:8080/login', {
        username: username,
        password: password,
      });

      localStorage.setItem('token', response.data.token);
      console.log('Token stored:', response.data.token);

      // Redirect to the appropriate route after successful login
      if (response.data.isAdmin) {
        navigate('/Admin'); // Redirect to admin dashboard
      } else {
        navigate('/create-channel'); // Redirect to regular user dashboard
      }

      // Handle successful login (e.g., update state, execute callback)
      console.log('Logged-in successfully:', response.data);
      onLogin();
    } catch (error) {
        // Check if error is of type AxiosError and if it has a response property
        if (axios.isAxiosError(error) && error.response) {
          // Handle errors and display an alert
          if (error.response.status === 401) {
            alert('Invalid username or password.');
            window.location.reload();

          } else if (error.response.status === 404) {
            alert('Incorrect username or password.');
            window.location.reload();

          } else {
            alert(`An unexpected error occurred: ${error.response.status}`);
          }
        } 
      }
    };

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, [onLogin]);
  return (
    <div className="login">
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
      <div className="form">
      <h2>Login</h2>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button onClick={() => { console.log('Button clicked'); handleLogin(); }}>Login</button>

      <div className="LinkContainer">
       <p>Not registered, Create account!</p>
       <Link to="/register" className="Link">register </Link> </div>
  </div>
    </div>
  );
};

export default Login;