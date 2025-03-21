const mongoose = require('mongoose')
const Schema = mongoose.Schema


const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Register",
  }
}, { timestamps: true })

module.exports = mongoose.model("blog", blogSchema)