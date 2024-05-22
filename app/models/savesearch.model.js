const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
    data: {
        type: Array
    },
    name: {
        type: String
    },
    user_id :{
        type: String
    }
})

const saveSearch = mongoose.model('saveSearch', adminSchema)
module.exports = saveSearch
