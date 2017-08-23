var express = require('express');
var morgan = require('morgan');
var path = require('path');

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

var articles = {
    'article-one': {
        title: 'Article One | Rohit Bhargava',
        heading: 'Article One',
        date: 'Aug 11, 2017',
        content: `
                <p>
                    This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article.This is the content for my first article.
                </p>
                <p>
                    This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article.This is the content for my first article.
                </p>
                <p>
                    This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article.This is the content for my first article.'
                </p>`    
    },
    'article-two': {
        title: 'Article Two | Rohit Bhargava',
        heading: 'Article Two',
        date: 'Aug 13, 2017',
        content: `
                <p>
                    This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article.This is the content for my first article.
                </p>
                <p>
                    This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article.This is the content for my first article.
                </p>
                <p>
                    This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article. This is the content for my first article.This is the content for my first article.'
                </p>`  
    },
    'article-three': {
        title: 'Article Three | Rohit Bhargava',
        heading: 'Article Three',
        date: 'Aug 15, 2017',
        content: `
                <p>
                    This is the content for my third article. This is the content for my third article. This is the content for my third article. This is the content for my third article. This is the content for my third article.This is the content for my third article.
                </p>
                <p>
                    This is the content for my third article. This is the content for my third article. This is the content for my third article. This is the content for my third article. This is the content for my third article.This is the content for my third article.
                </p>
                <p>
                    This is the content for my third article. This is the content for my third article. This is the content for my third article. This is the content for my third article. This is the content for my third article.This is the content for my third article.
                </p>`  
    }
};

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
                    ${date}
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

var pool = new Pool (config);     // Pool ready
app.get('/test-db', function (req, res) {
    // make select a request
    // reurn the response with the results
    
    pool.query('SELECT * FROM test', function(err,result) {
        if(err) {
            res.status(500),send(err.toString());
        }
        else {
            res.send(JSON.stringify(result.rows));
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

app.get('/articles/:articleName', function (req, res){
    // articleName == article-one
    // articles[articleName] == {} content object for article one
    
    pool.query("SELECT * FROM article WHERE title = '"+ req.params.articleName + "'", function (err, result) {
       if(err) {
           res.status(500).send(err.toString());
       } 
       else {
           if(result.row.length === 0){
               res.status(404).send('Article not found.');
           }
           else {
               var articleData = result.rows(0); // article data object to get the values from the database
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
