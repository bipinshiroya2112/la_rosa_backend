require('dotenv').config()
const mongoose = require('mongoose');
const MONGODB = process.env.MONGODB;
async function connect() {
    try {
        // console.log("MONGODB================", MONGODB);
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: `, err);
            process.exit(-1);
        });

        mongoose.connection.on('connection', () => {
            console.log(`MongoDB established`);
        });
        mongoose
            .connect(`${MONGODB}/larosaBackend?retryWrites=true&w=majority`, {
                bufferCommands: true
            })
            .then((req, res) => {
                console.log("Database connected successfully!!");
            })
            .catch((error) => {
                console.log(error);
            });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(-1);
    }
}

module.exports = { connect };