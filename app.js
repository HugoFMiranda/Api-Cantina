var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');


/* Importing the models from the models folder. */
var pratodia = require('./models/pratododia');
var ementasemana = require('./models/ementasemana');
var reserva = require('./models/reserva');

/* Importing the routes from the routes folder. */
var indexRouter = require('./routes/index');
var ementasemanaRouter = require('./routes/ementasemana');
var pratododiaRouter = require('./routes/pratododia');
var reservaRouter = require('./routes/reserva');

var app = express();
console.log("Starting server...");


// MongoDB connection
require('dotenv').config();


/* Connecting to the MongoDB database. */
mongoose.connect(process.env.MONGODB_DATABASE_URL, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to MongoDB");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// cors
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Defining the routes for the different pages. */
app.use('/', indexRouter);
app.use('/api/ementa', ementasemanaRouter);
app.use('/api/prato', pratododiaRouter);
app.use('/api/reserva', reservaRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { title: 'Error' });
});

// disable Node from rejecting self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


module.exports = app;