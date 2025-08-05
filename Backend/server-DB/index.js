const express = require('express');
const connectDB = require('./db');

const app = express();
const port = 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, MERN Stack Server!');
});

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

/** 
 Explanation:
 * mongoose.connect() establishes a connection to the MongoDB database (replace the connection string with your MongoDB Atlas string if using the cloud).
* useNewUrlParser and useUnifiedTopology ensure compatibility with newer MongoDB drivers.
* The try-catch block handles connection errors gracefully.
* For a local MongoDB, use mongodb://localhost:27017/mernDB (where mernDB is the database name).
* For MongoDB Atlas, use the connection string provided by Atlas.


*/