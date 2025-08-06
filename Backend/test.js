// // 

// import express from 'express';
// import rateLimit from 'express-rate-limit';

// const app = express();

// const limiter = rateLimit({
//      windowMs: 15*60*1000,
//      max: 100,
//      Message: "Tomany requst"
// });

// app.use(limiter);
// app.get('/', (req, res) =>{
//      res.send('Hello World');
// });

// app.listen(3000);
// // --------------

import { error } from "console";
import express from "express";
import rateLimit from "rateLimit";
const app = express();
const limiter = rateLimit({
     windowMs: 10*60*1000,
     max: 50,
     message: { error: 'tomany Request'},
});

app.use('/api/user',limiter);
app.get('/api/user', (req, res) =>{
     res.json([
          {id: 1, name: "Alice"},
          {id: 2, name: 'bob'},
     ]);
});

app.listen(3000, () => console.log('server running'));