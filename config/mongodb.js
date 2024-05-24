const mongoose = require('mongoose');
mongoose.set('strictQuery', true)
require('dotenv').config()
const MONGODB = process.env.MONGODB
console.log('================================', MONGODB);
mongoose.connect(`${MONGODB}/larosaBackend`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("connection successful");
}).catch((e) => {
    console.log("can not connect to the database");
})