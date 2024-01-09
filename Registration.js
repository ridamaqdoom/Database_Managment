import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate} from 'react-router-dom';
import './index.css'; 

const Registration = ({onRegistration}) => {
  const navigate = useNavigate();

  const [firstname, setfirstname] = useState('');
  const [lastname, setlastname] = useState('');
  const [emailID, setemailID] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
 
  const handlefirstnameChange = (e) => setfirstname(e.target.value);
  const handlelastnameChange = (e) => setlastname(e.target.value);
  const handlemailIDChange = (e) => setemailID(e.target.value);
  const handleusernameChange = (e) => setUsername(e.target.value);
  const handlepasswordChange = (e) => setPassword(e.target.value);


  const handleRegister = async () => {
    if (username.trim() === '' || password.trim() === '') {
      alert('Fields cannot be empty');
      return;
    }
    console.log('registration:', { firstname, lastname, emailID, username, password });
  
    try {
      const response = await axios.post('http://localhost:8080/register', {
        firstname: firstname,
        lastname: lastname,
        emailID: emailID,
        username: username,
        password: password,
      });
  
      navigate('/login');

      console.log('Post added successfully:', response.data);
      onRegistration();
    } catch (error) {
      console.log('Error adding post:', error);
  
      if (error.response && error.response.data && error.response.status === 400) {
        alert('Email already exists. Please login.');
        window.location.reload();

      }
    }
  };
  
  useEffect(() => {
    setfirstname('');
    setlastname('');
    setemailID('');
    setUsername('');
    setPassword('');
  }, [onRegistration]);
  
  
 

  return (
    <div className="registration">
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
          Post programming questions
        </Link>
        <Link to="/register" className="Link">
          Register
        </Link>
        <Link to="/search" className="Link">
          Search
        </Link>
      </div>
    
      
      <div className="form">
      <h2>Register</h2>
      <label>
        Firstname:
        <input type="text" value={firstname} onChange={handlefirstnameChange}  />
      </label>
      <label>
        Lastname:
        <input type="text" value={lastname} onChange={(handlelastnameChange)} />
      </label>
      <label>
        EmailID:
        <input type="text" value={emailID} onChange={(handlemailIDChange)} />
      </label>
      <label>
        Username:
        <input type="text" value={username} onChange={(handleusernameChange) } />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={(handlepasswordChange) } />
      </label>
      
     <br></br>
      <button  onClick={() => { console.log('Button clicked'); handleRegister(); }}>Register</button> 

      <div className="LinkContainer">
  <p>Already have an account</p>
  <Link to="/login" className="Link">
    Login
  </Link>
</div>
        </div>
    </div>
  );
};

export default Registration;