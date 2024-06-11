require('dotenv').config()
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

const MONGODB = process.env.MONGODB;
async function connect() {
    try {
        console.log("MONGODB================", MONGODB);
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: `, err);
            process.exit(-1);
        });

        mongoose.connection.on('connection', () => {
            console.log(`MongoDB established`);
        });
        mongoose
            .connect(`mongodb+srv://testac1313:pradip@cluster0.zqyjlea.mongodb.net/test?retryWrites=true&w=majority`, {
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