// Route handler for forum web app
module.exports = function (app, forumData) {

  // to store the username for the login session
  let userLogin = [];

  // Home page
  app.get('/', function (req, res) {
    if (userLogin.length != 0) {
      forumData.user = userLogin[0];
    } else {
      forumData.user = ' ';
    }
    
    res.render('index.ejs', forumData);
  });


  // About page
  app.get('/about', function (req, res) {
    res.render('about.ejs', forumData);
  });

  // List all users (temporary route)
  app.get('/list', function (req, res) {
    let sqlquery = "SELECT * FROM users"; // query database to get all the
    // execute sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect('./');
      }
      res.send(result)
    });
  });

  // Login page
  app.get('/login', function (req, res) {
    res.render('login.ejs', forumData);
  });

  // Handle login form submission
  app.post('/welcome', function (req, res) {
    var user = req.body.username;
    var password = req.body.password;

    // Select the hashed password for the user from the database
    let sqlquery = `SELECT * FROM users WHERE username = ?`;

    db.query(sqlquery, [user], (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        res.redirect('/login');
        return;
      }

      // Compare the password supplied with the hashed password from the database
      if (result.length === 1) {
        const hashedPassword = result[0].password;
        bcrypt.compare(password, hashedPassword, function (err, passwordMatch) {
          if (err) {
            console.error('Error comparing passwords:', err);
            res.redirect('/login');
            return;
          }

          // Handle the comparison result
          if (passwordMatch) {
            // Passwords match, log in the user
            res.cookie("user", user, {
              path: '/'
            }); // Save the username as a cookie
            userLogin[0] = result[0].username; // the save the username as in the global array so it is accessible from outside of this function


            let data = Object.assign({}, forumData, {
              user: result
            });
            res.render('welcome.ejs', data);
          } else {
            // Passwords do not match, send a response
            let resultMsg = 'Login unsuccessful. Password does not match.';
            res.send(resultMsg);
          }
        });
      } else {
        // No user found with the given username, send a response
        let resultMsg = 'Login unsuccessful. User not found.';
        res.send(resultMsg);
      }
    });
  });

  // Log Activity page
  app.get('/log_activity', function (req, res) {
    if (userLogin.length != 0) {
      forumData.user = userLogin[0];
    } else {
      forumData.user = ' ';
    }

    res.render('log_activity.ejs', forumData);
  });

  // Handle activity log form submission
  app.post('/activity_logged', function (req, res) {
    let checkUsernameQuery = 'SELECT * FROM users WHERE username = ?';

    db.query(checkUsernameQuery, [req.body.username], (checkErr, checkResult) => {
        if (checkErr) {
            // Handle the error appropriately, e.g., render an error page
            res.redirect('/log_activity');
            return;
        }

        // Insert the data into the database with the correct user_id
        let sqlquery = `INSERT INTO exercise_log (username, exercise_name, log_date, duration) VALUES (?, ?, ?, ?)`;
        let newrecord = [req.body.username, req.body.exercise_name, req.body.log_date, req.body.duration];

        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                // Handle the error appropriately, e.g., render an error page
                res.send('User does not exist.');
                // res.redirect('/log_activity');
                return;
            }

            // Redirect to a GET route after successful POST to prevent duplicate submissions
            res.redirect('/activity_saved');
        });
    });
  });

  // Display saved activities
  app.get('/activity_saved', function (req, res) {
    // Fetch the updated list of exercise logs
    let query = 'SELECT * FROM exercise_log';
    db.query(query, [forumData.user], (err, logs) => {
      if (err) {
        // Handle the error appropriately, e.g., render an error page
        res.redirect('/log_activity'); // Redirect to the form page or handle the error appropriately
        return;
      }

      // Render the page with the exercise logs
      let data = Object.assign({}, forumData, {
        ex_log: logs
      });
      res.render('activity_saved.ejs', data);
    });
  });

  // Edit activity page
  app.get('/edit_activity/:logId', function (req, res) {
    // Fetch log details based on logId from the database
    let logId = req.params.logId;
    let sqlFetchQuery = `SELECT * FROM exercise_log WHERE log_id = ?`;

    db.query(sqlFetchQuery, [logId], (fetchErr, fetchResult) => {
      if (fetchErr || fetchResult.length === 0) {
        console.error('Log not found or database fetch error:', fetchErr);
        res.redirect('/activity_saved'); // Redirect or handle the error appropriately
        return;
      }

      let data = Object.assign({}, forumData, {
        logToEdit: fetchResult[0]
      });
      res.render('edit_activity.ejs', data); // Render the edit form with data
    });
  });

  // Save edited activity
  app.post('/save_edit_activity', function (req, res) {
    let logId = req.body.log_id;
    let updatedExerciseName = req.body.exercise_name;
    let updatedLogDate = req.body.log_date;
    let updatedDuration = req.body.duration;

    // Update the log entry in the database
    let sqlUpdateQuery = `
      UPDATE exercise_log
      SET exercise_name = ?, log_date = ?, duration = ?
      WHERE log_id = ?`;

    let updateParams = [updatedExerciseName, updatedLogDate, updatedDuration, logId];

    db.query(sqlUpdateQuery, updateParams, (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Database update error:', updateErr);
        res.redirect('/activity_saved'); // Redirect or handle the error appropriately
        return;
      }

      res.redirect('/activity_saved'); // Redirect to the log list after successful update
    });
  });

  // Logout page
  app.get('/logout', function (req, res) {
    res.clearCookie("user", {
      path: '/'
    }); // the store cookie is cleared
    res.render('logout.ejs', forumData); // the logout webpage is rendered 
    userLogin = []; // the global array is cleared
    res.end();
  });

  // Register page
  app.get('/register', function (req, res) {
    res.render('register.ejs', forumData);
  });

  const bcrypt = require('bcrypt');
  const saltRounds = 10;

  const {
    check,
    sanitize
  } = require('express-validator');

  // Handle user registration form submission
  app.post('/registered', [
    check('username').isLength({
      min: 4
    }).withMessage('Username must be at least 4 characters long'),
    check('firstname').notEmpty().withMessage('First name is required').bail().trim().escape(),
    check('lastname').notEmpty().withMessage('Last name is required').bail().trim().escape(),
    check('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  ], function (req, res) {
    const plainPassword = req.body.password;

    // Hash the password before storing it in the database
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      if (err) {
        res.redirect('/register');
        return;
      }

      // Sanitize the fields
      req.sanitize(req.body.firstname);
      req.sanitize(req.body.lastname);

      let sqlquery = `INSERT INTO users (firstname, lastname, username, email, gender, age, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      let newrecord = [
        req.body.firstname,
        req.body.lastname,
        req.body.username,
        req.body.email,
        req.body.gender,
        req.body.age,
        hashedPassword
      ];

      db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
          res.redirect('/register');
          return;
        }

        let data = Object.assign({}, forumData, {
          userRegister: result
        });
        res.render('registered.ejs', data);
      });
    });
  });

  // Search for Posts page
  app.get('/search', function (req, res) {

    // to render the login username on the search page
    if (userLogin.length != 0) {
      forumData.user = userLogin[0];
    } else {
      forumData.user = ' ';
    }
    res.render("search.ejs", forumData);
  });

  // Search for Exercises result page
  app.get('/search-result', function (req, res) {

    // To render the login username on the search-result page
    if (userLogin.length !== 0) {
      forumData.user = userLogin[0];
    } else {
      forumData.user = ' ';
    }

    // Query to select exercises from the 'search_exercise' table
    let term = '%' + req.query.keyword + '%';
    let sqlQuery = `SELECT * FROM search_exercise WHERE ex_name LIKE ?;`;

    if (req.query.keyword === "") {
      res.send("Search field empty.");
    } else {
      db.query(sqlQuery, [term], (err, result) => {
        if (err) {
          console.error(err);
          res.redirect('/search');
        }

        let data = Object.assign({}, forumData, {
          exercises: result
        });

        res.render('search-result.ejs', data);
      });
    }
  });

  // Display all exercises page
  app.get('/exercises', function (req, res) {
    // Query to select all exercises from the 'search_exercise' table
    let sqlQuery = `SELECT * FROM search_exercise;`;

    db.query(sqlQuery, (err, result) => {
      if (err) {
        console.error(err);
        // Handle the error as needed
        res.status(500).send('Internal Server Error');
        return;
      }

      let data = Object.assign({}, forumData, {
        exercises: result
      });

      // Render the 'all-exercises.ejs' template with the entire dataset
      res.render('exercises.ejs', data);
    });
  });

  // Weather API page
  app.get('/weather', function (req, res) {
    const request = require('request');

    let apiKey = 'f8096cd172fb5481b030695298469da5';
    let city = 'london';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

    request(url, function (err, response, body) {
      if (err) {
        console.log('error:', error);
      } else {
        var weather = JSON.parse(body);
        var temperature = weather.main.temp;
        var conditions = weather.weather[0].description;
        var windSpeed = weather.wind.speed;
        var precipitation = weather.rain ? 'Rain' : (weather.snow ? 'Snow' : 'None');

        // Get the current time
        var currentTime = new Date();
        var currentHour = currentTime.getHours();
        var currentMinutes = currentTime.getMinutes();
        var currentSeconds = currentTime.getSeconds();

        // Check if the weather is suitable for outdoor activities
        var isGoodForOutdoorActivities = (
          temperature > 10 && // Example: Temperature above 10 degrees Celsius
          conditions.includes('clear') && // Example: Clear skies
          windSpeed < 10 && // Example: Moderate wind speed
          precipitation === 'None' && // Example: No rain or snow
          (currentHour >= 8 && currentHour <= 18) // Example: Check if it's between 8 AM and 6 PM
        );

        // Construct a message
        let weatherInfo = {
          temperature: temperature,
          conditions: conditions,
          windSpeed: windSpeed,
          precipitation: precipitation,
          time: `${currentHour}:${currentMinutes}:${currentSeconds}`
        };

        // Provide a recommendation based on weather conditions
        var recommendation = isGoodForOutdoorActivities ? 'Weather is good for OUTDOOR activities!' : 'Consider INDOOR activities due to weather conditions or time of day.';

        let data = Object.assign({}, forumData, {
          weatherInfo: weatherInfo,
          recommendation: recommendation
        });

        // Render the 'all-exercises.ejs' template with the entire dataset
        res.render('weather.ejs', data);
      }
    });
  });
}