// require('dotenv').config()
const mongoose = require('mongoose');
// mongoose.set('strictQuery', true)
// const MONGODB = process.env.MONGODB
// console.log('================================', MONGODB);
// mongoose.connect(`${MONGODB}/larosaBackend`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverSelectionTimeoutMS: 30000,
//     socketTimeoutMS: 45000,
// }).then(() => {
//     console.log("connection successful");
// }).catch((e) => {
//     console.log("can not connect to the database");
// })

// mongoose.connection.on('error', (err) => {
//     console.error("Mongoose connection error:", err);
// });

// mongoose.connection.on('disconnected', () => {
//     console.error("Mongoose connection disconnected");
// });

// mongoose.set('debug', true);

require("dotenv").config();
const MONGODB = process.env.MONGODB;

async function connect() {
    try {
        mongoose
            .connect(`${MONGODB}/larosaBackend`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000,
                bufferCommands: false
            })
            .then((req, res) => {
                console.log("Database connected successfully!!");
            })
            .catch((error) => {
                console.log(error);
            });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

module.exports = { connect };