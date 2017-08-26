var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');

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
    return hashed.toString('hex');
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
   pool.query('INSERT INTO "user" (username, password) VALUES ($1,  $2)', [username, dbString], function(err, result) {
       if(err) {
            res.status(500),send(err.toString());
        }
        else {
            res.send('Username successfully created: ' + username);
        }
   });
});

app.post('/login', function(req, res) {
   var username = req.body.username;
   var password = req.body.password;
   //create salt
   var salt = crypto.randomBytes(128).toString('hex');
   //create password
   var dbString = hash(password, salt);
   //Save the password hash string into the database
   pool.query('SELECT * FROM "user" WHERE username=$1', [username], function(err, result) {
       if(err) {
            res.status(500),send(err.toString());
        }
        else {
            res.send('Username successfully created: ' + username);
        }
});

var pool = new Pool(config);     // Pool ready
app.get('/test-db', function (req, res) {
    // make select a request
    // reurn the response with the results
    
    pool.query('SELECT * FROM test', function(err, result) {
        if(err) {
            res.status(500),send(err.toString());
        }
        else {
            if(result.rows.length === 0) {
                res.status(403).send('username/password is invalid');
            }
            else { // username exists
                // Match the password
                
                // Extract the passowrd stroed in the database
                var dbString = result.rows[0].password;
                
                // Split the passowrd from saltby a $ symbol
                dbString.split('$')[2]; // salt value is at third position in the hash value
                
                // Create the hash using salt based on the password submitted  and the original salt
                var hashedPassword = hash(password, salt);
                
                // Test if the hashedPassword is exactly as stored in database
                if(hashedPassword = db.String) {
                    res.send('Credentials Correct')
                }
                else {
                    res.send(403).send('username/password is invalid');
                }
            }
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
               var articleData = result.rows[0]; // article data object to get the values from the database
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
