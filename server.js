require('dotenv').config()
const DB = require("./config/mongodb");
DB.connect();
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
const multer = require('multer');
const upload = multer();
const vercel = require('@vercel/blob/client');
const path = require('path');

app.use(cors());
// dtQcltpZHeYY1pkQCu6XRoqfWsDDu9QbY3NQ1Lb8YMF9xP-FMlI-qBJ7WZxXxlFl0Z4

var mung = require('express-mung');


const { updateMetarate, checkSessionExpiration } = require('./public/partials/utils');

//passport config
app.use(passport.initialize())
require('./config/passport')


app.use('/public', express.static(path.join(__dirname, 'public')))
// app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }))
app.use(express.json());




app.use(cookieParser());


app.use(userRouter);
app.use(adminAgencyRouter)
app.use(admin_router)

app.post("/api/image/upload", upload.fields({}), async (req, res) => {
  try {
    const jsonResponse = await vercel.handleUpload({
      body: req.body,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        console.log('Generating upload token for:', pathname);
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed:', blob, tokenPayload);
        try {
          console.log('Blob URL:', blob.url);
        } catch (error) {
          console.error('Error during post-upload processing:', error);
          throw new Error('Could not complete post-upload processing');
        }
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.log("blob error:", error);
  }
});


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