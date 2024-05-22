require('dotenv').config({ path: './config/.env' })
require('./config/mongodb')
const express = require("express");
const http = require('http');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const Emitter = require('events')
const passport = require('passport')
//importing the routes
const userRouter = require('./app/routes/user.route')
const adminAgencyRouter = require('./app/routes/admin_Agency_router')
const admin_router = require('./app/routes/admin_router')


// dtQcltpZHeYY1pkQCu6XRoqfWsDDu9QbY3NQ1Lb8YMF9xP-FMlI-qBJ7WZxXxlFl0Z4

var mung = require('express-mung');


const { updateMetarate, checkSessionExpiration } = require('./public/partials/utils');

//passport config
app.use(passport.initialize())
require('./config/passport')



app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(express.json());

app.use(cors({ credentials: true, origin: true }));



app.use(cookieParser());


app.use(userRouter);
app.use(adminAgencyRouter)
app.use(admin_router)


app.get('/', (req, res) => {
  res.send(`Server running on port ${PORT}`)
})

//Expire user session 
checkSessionExpiration()

//default route
app.all('*', (req, res) => {
  return res.status(404).send("URL not found server.js")
})

// server port define
const PORT = process.env.PORT || 5100;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});