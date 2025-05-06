const express = require("express");
const port=process.env.PORT || 4255;
const app = express()
const userRoutes = require('./routes/userapi')
app.use(express.json())
app.use('/', userRoutes);
const db = require('./db')

app.get('/',(req,res)=>{
   res.send('Hello')
})


app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
