var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

// create a pool
var Pool = require('pg').Pool;

//create database configurtaion
var config = {
    user: 'rohitbhargava586',
    database: 'rohitbhargava586',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecret Value',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }
}));

function createTemplate (data) {
    var title = data.title;
    var heading = data.heading;
    var date = data.date;
    var content = data.content;
    
    var htmlTemplate = `
    <html>
        <head>
            <title>
                ${title}
            </title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link href="/ui/style.css" rel="stylesheet" />
        </head>
        <body>
            <div class="container">
                <div>
                    <a href="/">Home</a>
                </div>
                <hr>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date.toDateString()}
                </div>
                <div>
                    ${content}
                </div>
            </div>
        </body>
    </html>
    `;
    
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input, salt) {
    // How to create a hash
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function(req, res) {
   var hashedString = hash(req.params.input, 'this-is-some-random-string');
   res.send(hashedString);
});

app.post('/create-user', function(req, res) {
   // username, password, extract username, password from the request body
   // {"username": "rohit", "password": "password"}
   // JSON
   var username = req.body.username;
   var password = req.body.password;
   //create salt
   var salt = crypto.randomBytes(128).toString('hex');
   //create password
   var dbString = hash(password, salt);
   //Save the password hash string into the database
   pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function(err, result) {
       if(err) {
            res.status(500).send(err.toString());
        }
        else {
           // res.send('Username successfully created: ' + username);
           
           // For Android app MyBlog
           res.setHeader('Content-Type', 'application/json');
           res.send(JSON.parse('{"message": "Username successfully created"}'));
        }
   });
});

app.post('/login', function(req, res) {
   var username = req.body.username;
   var password = req.body.password;
   
   pool.query('SELECT * FROM "user" WHERE username=$1', [username], function(err, result) {
        if(err) {
            res.status(500).send(err.toString());
        }
        else {
            if(result.rows.length === 0) {
                // res.status(403).send('username/password is invalid');
                
                // For Android app MyBlog
                res.setHeader('Content-Type', 'application/json');
                res.status(403).send(JSON.parse('{"messgae": "username/password is invalid"}'));
            }
            else {  // username exists
            // Match the password
            // Extract the password stored in database
            var dbString = result.rows[0].password;
            // Split the password from salt by $ symbol
            var salt = dbString.split('$')[2];  // salt value is 3rd in the hash 
            
            // Create hash using the salt value based on the password submitted and original salt
            var hashedPassword = hash(password, salt);
            // Test if the hashed password is exaclty equal to value stored in database
            if(hashedPassword === dbString) {
                // Set the session
                req.session.auth = {userId: result.rows[0].id};
                // We have set session object on request body
                // i.e., set cookie with a session-id
                // Internally, on the server side, it maps the session-id to an object
                // which contains the value {auth: {userId}}
                
                //res.send('credentials correct.');
                
                // For Android app MyBlog
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.parse('{"message": "credential correct"}'));
            }
            else {
                // res.status(403).send('username/password is invalid');
                
                // For Android app MyBlog
                res.setHeader('Content-Type', 'application/json');
                res.status(403).send(JSON.parse('{"messgae": "username/password is invalid"}'));
            }
        }
    }
   });
});

app.get('/check-login', function (req, res) {
    if(req.session && req.session.auth && req.session.auth.userId) {
        res.send('You are logged in: ' + req.session.auth.userId.toString());
    }
    else {
        res.send('You are not logged in');
    }
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   res.send('Logged out');
});

var pool = new Pool(config);     // Pool ready
app.get('/test-db', function (req, res) {
    // make select a request
    // return the response with the results
    
    pool.query('SELECT * FROM test', function(err, result) {
        if(err){ //if there is an error
            res.status(500).send(err.toString());
        }
        else { // send the result as JSON string
            res.send(JSON.stringify(result.rows));  // result.rows, for array of object.
        }
    });
});

var counter = 0;
app.get('/counter', function (rwq, res) {
    counter = counter + 1;
    res.send(counter.toString());
});

var names = [];
app.get('/submit-name', function (req, res) { // URL:/submit-name?name=xxxx
    // Get the name from the request
    var name = req.query.name;
    names.push(name);
    // JSON = JavaScript Object Notation
    res.send(JSON.stringify(names));
});

app.get('/articles/:articleName', function (req, res) {
    // articleName == article-one
    // articles[articleName] == {} content object for article one
    
    pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName], function (err, result) {
       if(err) {
           res.status(500).send(err.toString());
       } 
       else {
           if(result.rows.length === 0){
               res.status(404).send('Article not found.');
           }
           else {
               var articleData = result.rows[0]; // articleData object to get the values from the database
               res.send(createTemplate(articleData));
           }
       }
    });
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});



// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
