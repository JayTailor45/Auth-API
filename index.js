const express = require('express');
const Sequelize = require('sequelize');
const app = express();

// Import Passport and Passport-JWT modules
const passport    = require('passport');
const passportJWT = require('passport-jwt');

const jwt         = require('jsonwebtoken');

let ExtractJwt    = passportJWT.ExtractJwt;
let JwtStrategy   = passportJWT.Strategy;
let JwtOptions    = {}

JwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
JwtOptions.secretOrKey    = 'awesome'

// Create strategy
let strategy = new JwtStrategy(JwtOptions,(jwt_payload, next) => {
    console.log('payload recived', jwt_payload);
    let user = getUser({ id: jwt_payload.id });
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);

const PORT          = 3000;
const DATABASE_NAME = 'user_db';
const HOSTNAME      = 'localhost';
const USERNAME      = 'root';
const PASSWORD      = '';
const DB_PORT       = 3333;


// Initial configurations
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
// Initilize instance of Sequelize
const sequelize = new Sequelize(DATABASE_NAME,USERNAME,PASSWORD,{
    host    : HOSTNAME, 
    dialect : 'mysql',
    port    : DB_PORT
});

//Define User Model
const User = sequelize.define('user',{
    name: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
})

app.post('/login',async (req,res,next) => {
    const {name, password} = req.body;
    if(name && password){
        let user = await getUser({name});
        if(!user) {
            res.status(401).json({msg: 'no such user found', user})
        }
        if(user.password === password){
            let payload = {id: user.id};
            let token = jwt.sign(payload, JwtOptions.secretOrKey);
            res.json({msg: 'ok',token})
        } else {
            res.status(401).json({msg: 'password is not correct'})
        }
    }
});

// Protected routes
app.get('/protected', passport.authenticate('jwt',{session: false}),(req,res) => {
    res.json({msg: 'Authenticated access. :)'})
});

User.sync()
    .then(() => {
        console.log(`Table created`)
    })
    .catch((err) => {
        console.log(`Error creating table : ${err}`)
    });

const createUser = async ({ name, password }) => {
    return await User.create({ name, password });
};
const getAllUsers = async () => {
    return await User.findAll();
};
const getUser = async obj => {
    return await User.findOne({
        where: obj
    })
};

// First basic route
app.get('/', (req,res) => {
    res.send({msg: 'Server is connected'}).status(200);
});

app.get('/users',(req,res) => {
    getAllUsers().then(user => res.json(user));
});

app.post('/createUser',(req,res,next) => {
    const { name, password} = req.body;
    createUser({ name, password}).then(user => {
        res.json({user,msg: 'account created'})
    });
});

// Check database connection
sequelize
    .authenticate()
    .then(()=> {
        console.log('Database connection success')
    })
    .catch((err) => {
        console.log('Database connection fail.' + err)
    });

// Fire server to listen on given port
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});