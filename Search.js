// SearchComponent.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import './search.css'
import './index.css'
const SearchComponent = () => {
  const [searchContentQuery, setSearchContentQuery] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchUserResults, setSearchUserResults] = useState([]);
  const [mostLeastPostsResults, setMostLeastPostsResults] = useState([]);
  const [highestLowestRankingResults, setHighestLowestRankingResults] = useState([]);

  const handleSearchContent = async () => {
    console.log("content", searchContentQuery)
    try {
      const response = await axios.get(`http://localhost:8080/search/content/${searchContentQuery}`);
      // Assuming the API response is an array of results
      setSearchResults(response.data);
    setSearchContentQuery('');
    } catch (error) {
      console.error('Error searching content:', error);
    }
  };




  const handleSearchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/search/user/${searchUserQuery}`);
      // Assuming the API response is an array of results
      setSearchUserResults(response.data);
      setSearchUserQuery('');
    } catch (error) {
      console.error('Error searching user:', error);
    }
  };

  const handleMostLeastPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/search/most-least-posts');
      // Assuming the API response is an array of results
      setMostLeastPostsResults(response.data);
    } catch (error) {
      console.error('Error fetching most/least posts:', error);
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
        </Link></div>
        <div className='search'>
      <h2>Search Component</h2>

      {/* Search for content containing specific strings */}
      <div >
        <textarea
          value={searchContentQuery}
          onChange={(e) => setSearchContentQuery(e.target.value)}
          placeholder="Search content..."
        />
        <button onClick={handleSearchContent}>Search Content</button>
      </div>

      {/* Display search results for content */}
      <div>
        <h3>Search Results:</h3>
        <ul>
          {searchResults.map((result) => (
            <li key={result.messageID}>
                <p>Username: {result.username}</p>
                <p>ChnnaelID: {result.channelID}</p>
                <p>MessageID: {result.messageID}</p>
              <p>Conetent: {result.content}</p>
              {/* Display other relevant information */}
            </li>
          ))}
        </ul>
      </div>

      {/* Search for content created by a specific user */}
      <div>
        <textarea
          value={searchUserQuery}
          onChange={(e) => setSearchUserQuery(e.target.value)}
          placeholder="Search content by user..."
        />
        <button onClick={handleSearchUser}>Search User</button>
      </div>

      {/* Display search results for content by user */}
      <div>
        <h3>Search Results by User:</h3>
        <ul>
          {searchUserResults.map((result) => (
            <li key={result.messageID}>
                <p>Username: {result.username}</p>
                <p>ChnnaelID: {result.channelID}</p>
                <p>MessageID: {result.messageID}</p>
              <p>Conetent: {result.content}</p>
              {/* Display other relevant information */}
            </li>
          ))}
        </ul>
      </div>

      {/* User with the most/least posts */}
      <div>
  <button onClick={handleMostLeastPosts}>Search Most/Least Posts</button>
  {/* Display most/least posts results */}
  <div>
    <h3>Most Posts:</h3>
    <ul>
      {Array.isArray(mostLeastPostsResults.mostPosts) ? (
        mostLeastPostsResults.mostPosts.map((result) => (
          <li key={result.username}>
            <p>User: {result.username}</p>
            <p>Post Count: {result.postCount}</p>
          </li>
        ))
      ) : (
        <li>No results found</li>
      )}
    </ul>

    <h3>Least Posts:</h3>
    <ul>
      {Array.isArray(mostLeastPostsResults.leastPosts) ? (
        mostLeastPostsResults.leastPosts.map((result) => (
          <li key={result.username}>
            <p>User: {result.username}</p>
            <p>Post Count: {result.postCount}</p>
          </li>
        ))
      ) : (
        <li>No results found</li>
      )}
    </ul>
  </div></div>
</div>


    
    </div>
  );
};

export default SearchComponent;
