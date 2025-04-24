const express = require("express");
const port=process.env.PORT || 4255;
const app = express()
app.use(express.json())

const db = require('./db')

app.get('/',(req,res)=>{
   res.send('Hello')
})


app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
