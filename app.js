require('dotenv').config();
require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/users');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth')

var app = express();
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    next();
  });
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.CONNECTION_STRING
    }),
    cookie: { maxAge: 60000 * 60 * 24,
            secure: false }    
  }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter)

module.exports = app;
