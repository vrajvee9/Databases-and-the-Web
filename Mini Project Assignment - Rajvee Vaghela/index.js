// My Forum
// A web application to provide discussion forums

// Import the modules we need
var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
const mysql = require('mysql');
var cookieParser = require('cookie-parser'); // to provide user login sessions
const expressSanitizer = require('express-sanitizer');
const session = require('express-session');


// Create the express application object
const app = express()
const port = 8000
app.use(bodyParser.urlencoded({
  extended: true
}))


// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Set up body parser middleware
app.use(express.urlencoded({ extended: true }));


// Define the database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'webuser',
  password: 'qwerty',
  database: 'healthdata'
});
// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database');
});
global.db = db;

// Set the directory where static files (css, js, etc) will be
app.use(express.static(__dirname + "/public"));

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine('html', ejs.renderFile);

// cookie-parser middleware function
app.use(cookieParser());

// Create an input sanitizer
app.use(expressSanitizer());

// Define our data
var forumData = {
  forumName: "Worth The Weight"
}

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, forumData);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
