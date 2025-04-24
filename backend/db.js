require('dotenv').config()
const mongoose = require("mongoose")

const dburi = process.env.DB_URI;
mongoose.connect(dburi)

mongoose.connection.on('connected',()=>{
    console.log('mongo db connected');
    
})

mongoose.connection.on('error',(error)=>{
    console.log(`error : ${error}`);
    
})

module.exports = mongoose