const express = require('express');

const app = express();

const PORT = 3000;

//Initial configurations
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//First basic route
app.get('/', (req,res) => {
    res.send({msg: 'Server is connected'}).status(200);
});


//Fire server to listen on given port
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});