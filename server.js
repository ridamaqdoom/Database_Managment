'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { authenticateToken} = require('./src/authenticateToken');
const cookieParser = require('cookie-parser');
const session = require('express-session')


const { Await } = require('react-router-dom');


const PORT = 8080;
const HOST = 'localhost';

const app = express();
app.use(bodyParser.json());

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const jwtSecretKey = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Define jwtSecretKey

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'project', // Database name
  port: 3306
});
exports.connection = connection;


connection.connect();
function initializeDatabase() {
  connection.query('CREATE DATABASE IF NOT EXISTS project', function (error, result) {
    if (error) {
      console.error('Error creating database: ' + error.message);
      return;
    }
    console.log('Database created or already exists.');

    connection.query('USE project', function (error, result) {
      if (error) {
        console.error('Error selecting database: ' + error.message);
        return;
      }
      console.log('Using database project.');

      // Create Users table
      connection.query(`CREATE TABLE IF NOT EXISTS Users (
        userID INT PRIMARY KEY AUTO_INCREMENT,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        emailID VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        INDEX (username)
    )`, function (error, result) {
        if (error) {
            console.error('Error creating Users table: ' + error.message);
            return;
        }
        console.log('Table Users created or already exists.');
    });

      // Create Channels table
      connection.query(`CREATE TABLE IF NOT EXISTS Channels (
        channelID INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255),
        channelName VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        FOREIGN KEY (username) REFERENCES Users(username)
    )`, function (error, result) {
        if (error) {
            console.error('Error creating Channels table: ' + error.message);
            return;
        }
        console.log('Table Channels created or already exists.');
    });

    //create News table 
    connection.query(`CREATE TABLE IF NOT EXISTS News (
      username VARCHAR(255),
      News VARCHAR(255)
  )`, function (error, result) {
      if (error) {
          console.error('Error creating News table: ' + error.message);
          return;
      }
      console.log('Table News created or already exists.');
  });

      // Create Messages table
      connection.query(`CREATE TABLE IF NOT EXISTS Messages (
        messageID INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255),
       channelID INT,
       content TEXT,
        filename VARCHAR(255),
        mimetype VARCHAR(255) ,
       timestamp DATETIME,
       FOREIGN KEY (channelID) REFERENCES Channels(channelID),
       FOREIGN KEY (username) REFERENCES Users(username)
   


      )`, function (error, result) {
        if (error) {
          console.error('Error creating Messages table: ' + error.message);
          return;
        }
        console.log('Table Messages created or already exists.');
      });

      // Create Replies table
      connection.query(`CREATE TABLE IF NOT EXISTS Replies (
        replyID INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255),
        channelID INT,
        messageID INT,
        content TEXT,
        parentReplyID INT, 
        approvalCount INT DEFAULT 0, 
        disapprovalCount INT DEFAULT 0,
        FOREIGN KEY (channelID) REFERENCES Channels(channelID),
        FOREIGN KEY (messageID) REFERENCES Messages(messageID),
        FOREIGN KEY (parentReplyID) REFERENCES Replies(replyID)
      )`, function (error, result) {
        if (error) {
          console.error('Error creating Replies table: ' + error.message);
          return;
        }
        console.log('Table Replies created or already exists.');
      });
    });
  });
}
app.get('/init', (req, res) => {
  initializeDatabase();
  res.send('Database and table initialization started.');
});

let user = {name:'ralph', password:'000'};

app.use(session({
  secret: "my secret",
  resave: false,
saveUninitialized: true,
cookie: { secure: false }
}))
app.use(cookieParser());

let s = 0;
app.get('/getSession',(req,res) => {
  s=req.session;
  if(s.counter != null){
      s.counter = s.counter + 1;
      res.send(s.counter.toString());
      
  }else
  {
      s.counter = 0;
      res.send(s.counter.toString());
  }
  
});


//cookie parser
app.get('/set-cookie', (req, res) => {
  // Set a cookie with the name 'myCookie' and value 'Hello, Cookie!'
  res.cookie('myCookie', 'Hello, Cookie!');

  res.send('Cookie set successfully!');
});

app.get('/read-cookie', (req, res) => {
  // Read the value of the 'myCookie' cookie
  const myCookieValue = req.cookies.myCookie;

  res.send(`Value of myCookie: ${myCookieValue}`);
});




app.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, emailID, username, password } = req.body;

    // Check if the email already exists in the Users table
    connection.query('SELECT * FROM Users WHERE emailID = ?', [emailID], (err, rows) => {
      if (err) {
        console.error('Error checking email existence:', err.message);
        return res.status(500).send('Error checking email existence.');
      }

      if (rows.length > 0) {
        // Email already exists, send a response
        return res.status(400).send('Email already exists. Please login.');
      }

      // Hash the password before storing it
      bcrypt.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
          console.error('Error hashing password:', hashError.message);
          return res.status(500).send('Error hashing password.');
        }

        // Insert the user into the Users table
        connection.query(
          'INSERT INTO Users (firstname, lastname, emailID, username, password) VALUES (?, ?, ?, ?, ?)',
          [firstname, lastname, emailID, username, hashedPassword],
          (insertErr, rows) => {
            if (insertErr) {
              console.error('Error registering user:', insertErr.message);
              return res.status(500).send('Error registering user.');
            }
            console.log('User registered successfully.');
            res.status(200).send('User registered successfully.');
          }
        );
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});

// New endpoint for user login
// ... (your existing code)

// New endpoint for user login


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if the provided credentials match the hardcoded admin credentials
  const isAdmin = checkAdminCredentials(username, password);

  if (isAdmin) {
    // If the credentials match, consider the user as an admin
    // You can add additional logic here, such as setting special privileges
    // or including an "isAdmin" flag in the JWT payload

    // Redirect to the admin dashboard or send a response indicating admin status
    const adminPayload = {
      username: 'admin', // Use the admin username
      isAdmin: true,
    };
    const adminToken = jwt.sign(adminPayload, jwtSecretKey, { expiresIn: '1h' });

    return res.status(200).json({ token: adminToken, isAdmin: true, message: 'Logged in as admin' });
  }

  // If the provided credentials are not admin credentials, continue with checking the database
  connection.query('SELECT * FROM Users WHERE username = ?', [username], async (error, results) => {
    if (error) {
      console.error('Error fetching user: ' + error.message);
      res.status(500).send('Error fetching user.');
      return;
    }

    if (results.length > 0) {
      const user = results[0];

      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Generate a JWT token for the authenticated user
        const payload = {
          userId: user.userID,
          // You can include other user properties here if needed
        };
        const token = jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' });

        // Send the token in the response
        res.status(200).json({ token, isAdmin: false });
      } else {
        res.status(401).send('Invalid password.');
      }
    } else {
      res.status(404).send('User not found.');
    }
  });
});

// Function to check admin credentials
function checkAdminCredentials(username, password) {
  // Hardcoded admin credentials
  const adminUsername = 'admin';
  const adminPassword = 'admin123';

  return username === adminUsername && password === adminPassword;
}


// Server endpoint
app.post('/create-channel', authenticateToken, async (req, res) => {
  const { channelName, description } = req.body;
  const { userId } = req.user;

  if (typeof channelName !== 'string' || channelName.trim() === '') {
    return res.status(400).json({ error: 'Channel name is required.' });
  }

  connection.query('SELECT * FROM Channels WHERE channelName = ?', [channelName], (err, rows) => {
    if (err) {
      console.error('Error checking channelName existence:', err.message);
      return res.status(500).send('Error checking channel existence.');
    }

    if (rows.length > 0) {
      return res.status(400).send('Channel name already exists, please try another.');
    }

    connection.query('SELECT username FROM Users WHERE userID = ?', [userId], (userErr, userRows) => {
      if (userErr) {
        console.error('Error fetching username:', userErr.message);
        return res.status(500).send('Error fetching username.');
      }

      if (userRows.length > 0) {
        const username = userRows[0].username;

        connection.query(
          'INSERT INTO Channels (username, channelName, description) VALUES (?, ?, ?)',
          [username, channelName, description],
          (insertErr, result) => {
            if (insertErr) {
              console.error('Error creating channel: ' + insertErr.message);
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            const channelId = result.insertId; // Move this line here

            res.status(200).json({ message: 'Channel created successfully!', channelId });
          }
        );
      } else {
        res.status(404).send('User not found.');
      }
    });
  });
});


// Add this route to handle GET requests to /create-channel
app.get('/create-channels', async (req, res) => {
  try {
    // Retrieve username, channelName, and description from the Channels table
    connection.query('SELECT channelID, username, channelName, description FROM Channels', (error, results) => {
      if (error) {
        console.error('Error fetching channels:', error);
        return res.status(500).send('Error fetching channels.');
      }

      // Send the retrieved channels as JSON response
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});

// Import necessary modules and setup code...

// Endpoint to handle fetching messages for a specific channel
// Endpoint to handle posting a message to a channel
// Endpoint to handle fetching messages for a specific channel
app.get('/create-channels/:channelID', async (req, res) => {
  try {
    // Retrieve username, channelName, and description from the Channels table
    connection.query('SELECT channelID FROM Channels', (error, results) => {
      if (error) {
        console.error('Error fetching channelid:', error);
        return res.status(500).send('Error fetching channelid.');
      }

      // Send the retrieved channels as JSON response
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});

// Create multer instance with the storage configuration
const upload = multer({ storage: storage });


app.post('/view-channels', authenticateToken, upload.single('image'), async (req, res) => {
  const { content, channelID } = req.body;
  let filename = req.file ? req.file.filename : null;

  const { userId } = req.user;
   const mimetype = req.file ? req.file.mimetype: null;// Initialize mimetype to a default value
  //mimetype = filename.mimetype;
  console.log('Request Headers:', req.headers);
  console.log('Authenticated User:', req.user);
  console.log('Received Channel ID:', channelID);
  console.log("file", filename);
 console.log("mimetype", mimetype);
 


  if (typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Assuming you have a 'filename' column in your Messages table
  // const filename = file ? file.filename : null;
  // console.log("file", file)

  connection.query(
    'SELECT username FROM Users WHERE userID = ?',
    [userId],
    (userErr, userRows) => {
      if (userErr) {
        console.error('Error fetching username:', userErr.message);
        return res.status(500).send('Error fetching username.');
      }

      if (userRows.length > 0) {
        const username = userRows[0].username;

        connection.query(
          'SELECT channelID FROM Channels WHERE channelID = ?',
          [channelID],
          (channelIDErr, channelRows) => {
            if (channelIDErr) {
              console.error('Error fetching channelID:', channelIDErr.message);
              return res.status(500).send('Error fetching channelID.');
            }

            if (channelRows.length > 0) {
              const channelID = channelRows[0].channelID;

              connection.query(
                'INSERT INTO Messages (username, channelID, content, filename, mimetype) VALUES (?, ?, ?, ?, ?);',
                [username, channelID, content, filename, mimetype],
                (insertErr, result) => {
                  if (insertErr) {
                    console.error('Error creating Message: ' + insertErr.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                  }

                  const messageId = result.insertId;
                  res.status(200).json({ message: 'Message created successfully!', messageId });
                }
              );
            } else {
              res.status(404).send('Channel not found.');
            }
          }
        );
      } else {
        res.status(404).send('User not found.');
      }
    }
  );
});

app.get('/view-channels/:channelID', async (req, res) => {
  const { channelID } = req.params;

  try {
    connection.query('SELECT messageID, username, content, filename FROM Messages WHERE channelID = ?', [channelID], (error, results) => {
      if (error) {
        console.error('Error fetching Messages:', error);
        return res.status(500).send('Error fetching messages.');
      }

      // Replace 'filename' with the actual field name that holds the image filename in your database
      const messagesWithImageURLs = results.map(message => ({
        ...message,
        imageURL: `/uploads/${message.filename}`
      }));

      res.status(200).json(messagesWithImageURLs);
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});



  

app.post('/view-channels/:channelID/replies', authenticateToken, async (req, res) => {
  const { content, channelID, messageID, parentReplyID } = req.body;
  const { userId } = req.user;

  // Fetch the username
  connection.query('SELECT username FROM Users WHERE userID = ?', [userId], (userErr, userRows) => {
    if (userErr) {
      console.error('Error fetching username:', userErr.message);
      return res.status(500).send('Error fetching username.');
    }

    if (userRows.length > 0) {
      const username = userRows[0].username;

      // Check if the channel exists
      connection.query('SELECT channelID FROM Channels WHERE channelID = ?', [channelID], (channelIDErr, channelRows) => {
        if (channelIDErr) {
          console.error('Error fetching channelID:', channelIDErr.message);
          return res.status(500).send('Error fetching channelID.');
        }

        if (channelRows.length > 0) {
          const channelID = channelRows[0].channelID;

          // Fetch the message ID
          connection.query('SELECT messageID FROM Messages WHERE messageID = ?', [messageID], (messageIDErr, messageRows) => {
            if (messageIDErr) {
              console.error('Error fetching MessageID:', messageIDErr.message);
              return res.status(500).send('Error fetching MessageID.');
            }

            if (messageRows.length > 0) {
              const messageID = messageRows[0].messageID;

           
              // Insert a new reply with parentReplyID for nested replies
              const query = 'INSERT INTO Replies (username, channelID, messageID, content, parentReplyID) VALUES (?, ?, ?, ?, ?)';
              console.log('Query:', query);
              console.log('Values:', username, channelID, messageID, content, parentReplyID);
              
              connection.query(query, [username, channelID, messageID, content, parentReplyID], (insertErr, result) => {
                if (insertErr) {
                  console.error('Error creating Reply: ' + insertErr.message);
                  return res.status(500).json({ error: 'Internal Server Error' });
                }

                const replyId = result.insertId;
                res.status(200).json({ message: 'Reply created successfully!', replyId });
              });
           
            } else {
              res.status(404).send('Message not found.');
            }
          });
        } else {
          res.status(404).send('Channel not found.');
        }
      });
    } else {
      res.status(404).send('User not found.');
    }
  });
});


  app.get('/view-channels/:channelID/replies/:messageID', async (req, res) => {
    const { channelID, messageID } = req.params;
  
    try {
      console.log('Fetching replies for channelID:', channelID, 'and messageID:', messageID);

      connection.query(
        'SELECT replyID, username, channelID, messageID, content FROM Replies WHERE messageID = ?',
        [messageID],
        (error, results) => {
          if (error) {
            console.error('Error fetching Replies:', error);
            return res.status(500).send('Error fetching replies.');
          }
  
          console.log('Fetched Replies:', results); // Add this line to log the fetched results
          res.status(200).json(results);
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error.message);
      return res.status(500).send('Unexpected error.');
    }
  });
  



app.post('/view-channels/:channelID/nested-replies', authenticateToken, async (req, res) => {
  const { content, channelID, messageID, parentReplyID } = req.body;
  const { userId } = req.user;

  // Fetch the username
  connection.query('SELECT username FROM Users WHERE userID = ?', [userId], (userErr, userRows) => {
    if (userErr) {
      console.error('Error fetching username:', userErr.message);
      return res.status(500).send('Error fetching username.');
    }

    if (userRows.length > 0) {
      const username = userRows[0].username;

      // Check if the channel exists
      connection.query('SELECT channelID FROM Channels WHERE channelID = ?', [channelID], (channelIDErr, channelRows) => {
        if (channelIDErr) {
          console.error('Error fetching channelID:', channelIDErr.message);
          return res.status(500).send('Error fetching channelID.');
        }

        if (channelRows.length > 0) {
          const channelID = channelRows[0].channelID;

          // Fetch the message ID
          connection.query('SELECT messageID FROM Messages WHERE messageID = ?', [messageID], (messageIDErr, messageRows) => {
            if (messageIDErr) {
              console.error('Error fetching MessageID:', messageIDErr.message);
              return res.status(500).send('Error fetching MessageID.');
            }

            if (messageRows.length > 0) {
              const messageID = messageRows[0].messageID;

              // Insert a new nested reply with parentReplyID
              const query = 'INSERT INTO Replies (username, channelID, messageID, content, parentReplyID) VALUES (?, ?, ?, ?, ?)';
              console.log('Query:', query);
              console.log('Values:', username, channelID, messageID, content, parentReplyID);

              connection.query(query, [username, channelID, messageID, content, parentReplyID], (insertErr, result) => {
                if (insertErr) {
                  console.error('Error creating nested Reply: ' + insertErr.message);
                  return res.status(500).json({ error: 'Internal Server Error' });
                }

                const replyId = result.insertId;
                res.status(200).json({ message: 'Nested Reply created successfully!', replyId });
              });
            } else {
              res.status(404).send('Message not found.');
            }
          });
        } else {
          res.status(404).send('Channel not found.');
        }
      });
    } else {
      res.status(404).send('User not found.');
    }
  });
});




app.get('/view-channels/:channelID/nested-replies/:messageID', async (req, res) => {
  const { channelID, messageID } = req.params;

  try {
    console.log('Fetching nested replies for channelID:', channelID, 'and messageID:', messageID);

    connection.query(
      'SELECT replyID, username, channelID, messageID, content FROM Replies WHERE parentReplyID = ?',
      [messageID],
      (error, results) => {
        if (error) {
          console.error('Error fetching Nested Replies:', error);
          return res.status(500).send('Error fetching nested replies.');
        }

        console.log('Fetched Nested Replies:', results);
        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});









app.post('/view-channels/:channelID/replies/:replyId/approve',async (req, res) => {
  const replyId = req.params.replyId;
  console.log('Hello im in');

 // const sql = 'UPDATE replies SET approvalCount = approvalCount + 1 WHERE replyID = ?';

  const s = connection.query('UPDATE replies SET approvalCount = approvalCount + 1 WHERE replyID = ?', [replyId], (err, results) => {
    if (err) {
      console.error('Error approving reply:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
   // console.log(s);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    return res.json({ success: true });
  });
});


// API Endpoint to Disapprove a Reply
app.post('/view-channels/:channelID/replies/:replyId/disapprove', async(req, res) => {
  const replyId = req.params.replyId;
  console.log('Hello im in too');


  const sql = 'UPDATE replies SET disapprovalCount = disapprovalCount + 1 WHERE replyID = ?';

  connection.query(sql, [replyId], (err, results) => {
    if (err) {
      console.error('Error disapproving reply:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    return res.json({ success: true });
  });
});



// Server-side code
app.get('/view-channels/:channelID/initial-approval-counts', async (req, res) => {
  console.log("in")
  const channelID = req.params;

  try {
    const result = await connection.execute(
      'SELECT messageID, replyID, approvalCount, disapprovalCount FROM Replies WHERE channelID = ?',
      [channelID]
    );

    const rows = Array.isArray(result) ? result[0] : result;

    const counts = {};
    if (Array.isArray(rows)) {
      for (const row of rows) {
        const key = `${row.messageID}-${row.replyID}`;
        counts[key] = {
          approvalCount: row.approvalCount,
          disapprovalCount: row.disapprovalCount,
        };
      }
    }

    res.json({ approvalCounts: counts });
  } catch (error) {
    console.error('Error fetching initial approval counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/search/content/:query', async (req, res) => {
  console.log("s1");
  const { query } = req.params;
  console.log(query)
  try {
    console.log('Fetching content for channelID query:', query);

    connection.query(
      'SELECT content, username, channelID, messageID FROM Replies WHERE content LIKE ? UNION SELECT content, username, channelID, messageID FROM Messages WHERE content LIKE ?',
      [`%${query}%`, `%${query}%`],
      (error, results) => {
        if (error) {
          console.error('Error fetching content:', error);
          return res.status(500).send('Error fetching nested replies.');
        }

        console.log('Fetched content Replies:', results);
        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});

app.get('/search/user/:query', async (req, res) => {
  const { query } = req.params;

  try {
    // Assuming you have a Users table in your database
    connection.query(
      'SELECT content, username, channelID, messageID FROM Replies WHERE username LIKE ? UNION SELECT content, username, channelID, messageID FROM Messages WHERE username LIKE ?',
      [`%${query}%`, `%${query}%`],
        (error, results) => {
        if (error) {
          console.error('Error searching user:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Fetched user content:', results);
        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});




app.get('/search/most-least-posts', (req, res) => {
  try {
    // Fetch users with the most/least posts logic here
    connection.query(
      'SELECT username, COUNT(*) AS postCount FROM Messages GROUP BY username ORDER BY postCount DESC LIMIT 1',
      (error, mostPostsResults) => {
        if (error) {
          console.error('Error fetching users with most posts:', error);
          return res.status(500).send('Error fetching most posts.');
        }

        connection.query(
          'SELECT username, COUNT(*) AS postCount FROM Messages GROUP BY username ORDER BY postCount ASC LIMIT 1',
          (error, leastPostsResults) => {
            if (error) {
              console.error('Error fetching users with least posts:', error);
              return res.status(500).send('Error fetching least posts.');
            }

            const results = { mostPosts: mostPostsResults, leastPosts: leastPostsResults };
            console.log('Fetched users with most/least posts:', results);
            res.status(200).json(results);
          }
        );
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});



app.post('/Messages', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const { userId } = req.user;

  console.log("user", userId);
  console.log("news", content);

  connection.query('SELECT username FROM Users WHERE userID = ?', [userId], (userErr, userRows) => {
    if (userErr) {
      console.error('Error fetching username:', userErr.message);
      return res.status(500).send('Error fetching username.');
    }

    if (userRows.length > 0) {
      const username = userRows[0].username;

      connection.query('INSERT INTO News (username, News) VALUES (?, ?)', [username, content], (error, results) => {
        if (error) {
          console.error('Error inserting news:', error);
          res.status(500).send('Error inserting news');
        } else {
          res.status(201).send('News added successfully');
        }
      });
    } else {
      res.status(404).send('User not found');
    }
  });
});



app.get('/Messages', async (req, res) => {
  try {
    // Retrieve username, channelName, and description from the Channels table
    connection.query('SELECT username, News FROM News', (error, results) => {
      if (error) {
        console.error('Error fetching news:', error);
        return res.status(500).send('Error fetching news.');
      }

      // Send the retrieved channels as JSON response
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});


app.get('/view-channels', async (req, res) => {

  try {
    connection.query('SELECT messageID, username, content, channelID, filename FROM Messages',(error, results) => {
      if (error) {
        console.error('Error fetching Messages:', error);
        return res.status(500).send('Error fetching messages.');
      }

      // Replace 'filename' with the actual field name that holds the image filename in your database
      const messagesWithImageURLs = results.map(message => ({
        ...message,
        imageURL: `/uploads/${message.filename}`
      }));

      res.status(200).json(messagesWithImageURLs);
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});


app.get('/replies', async (req, res) => {
  console.log('Received a request to fetch all replies.');

  try {
    connection.query(
      'SELECT replyID, username, channelID, messageID, content FROM Replies',
      (error, results) => {
        if (error) {
          console.error('Error fetching Replies:', error);
          return res.status(500).send('Error fetching replies.');
        }

        console.log('Fetched Replies:', results);
        res.status(200).json(results);
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).send('Unexpected error.');
  }
});


app.delete('/channels/:channelID', (req, res) => {
  const channelId = req.params.channelID;
  console.log("channelid", channelId)

  // Assuming your Channels table has an "id" column
  const deleteChannelQuery = 'DELETE  FROM Channels WHERE channelID = ?';

  // Execute the delete query
  connection.query(deleteChannelQuery, [channelId], (error, results) => {
    if (error) {
      console.error('Error deleting channel:', error);
      res.status(500).json({ error: 'Error deleting channel' });
    } else {
      console.log(`Channel with ID ${channelId} deleted successfully`);
      res.status(200).json({ message: 'Channel deleted successfully' });
    }
  });
});

app.delete('/messages/:messageID', (req, res) => {
  const MessageID = req.params.messageID;
  console.log("messageid", MessageID)

  // Assuming your Channels table has an "id" column
  const deleteChannelQuery = 'DELETE FROM Messages WHERE messageID = ?';

  // Execute the delete query
  connection.query(deleteChannelQuery, [MessageID], (error, results) => {
    if (error) {
      console.error('Error deleting Message:', error);
      res.status(500).json({ error: 'Error deleting Message' });
    } else {
      console.log(`messages with ID ${MessageID} deleted successfully`);
      res.status(200).json({ message: 'Message deleted successfully' });
    }
  });
});


app.delete('/replies/:replyID', (req, res) => {
  const replyID = req.params.replyID;
  console.log("replyid", replyID)

  // Assuming your Channels table has an "id" column
  const deleteChannelQuery = 'DELETE FROM Replies WHERE replyID = ?';

  // Execute the delete query
  connection.query(deleteChannelQuery, [replyID], (error, results) => {
    if (error) {
      console.error('Error deleting reply:', error);
      res.status(500).json({ error: 'Error deleting reply' });
    } else {
      console.log(`reply with ID ${replyID} deleted successfully`);
      res.status(200).json({ message: 'reply deleted successfully' });
    }
  });
});


  app.listen(PORT, HOST, () => {
    console.log('Server is up and running on port', PORT);
  });
  