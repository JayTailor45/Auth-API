const express = require('express');
const Sequelize = require('sequelize');
const app = express();

const PORT          = 3000;
const DATABASE_NAME = 'user_db';
const HOSTNAME      = 'localhost';
const USERNAME      = 'root';
const PASSWORD      = '';
const DB_PORT       = 3333;


//Initial configurations
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Initilize instance of Sequelize
const sequelize = new Sequelize(DATABASE_NAME,USERNAME,PASSWORD,{
    host    : HOSTNAME, 
    dialect : 'mysql',
    port    : DB_PORT
});

//First basic route
app.get('/', (req,res) => {
    res.send({msg: 'Server is connected'}).status(200);
});

//Check database connection
sequelize
    .authenticate()
    .then(()=> {
        console.log('Database connection success')
    })
    .catch((err) => {
        console.log('Database connection fail.' + err)
    });

//Fire server to listen on given port
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});