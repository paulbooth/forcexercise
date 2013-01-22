/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , mongo = require('mongodb')
  , Db = mongo.Db
  , path = require('path');

var app = express();

var db; // Database opened later

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('dburl', process.env.MONGOLAB_URI || 'mongodb://localhost:27017/forcexercise');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use('/public', express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
  res.send('hello world');
});

app.get('/:id', function(req, res) {
  getCheckIns(req.params.id, function(checkIns) {
    res.json(checkIns);
  });
});

app.post('/', function(req, res) {
  // Parse content.
  var POST = req.body;
  var jsonstring = POST.value;
  // var readerId = POST.target; // could be used to figure out info about where checked in

  var json = {};
  var id = '';
  try {
    json = JSON.parse(jsonstring);
    id = String(json.id);
    console.log('received json post:');
    console.log(JSON.stringify(json));
  } catch(e) {
    console.log("This is not json:");
    console.log(jsonstring);
    res.end();
    return;
  }
  
  saveCheckIn(id, Date.now(), function() {
    res.send('cool.');
  });
});

// Start database and get things running
console.log("connecting to database at " + app.get('dburl'));
Db.connect(app.get('dburl'), {}, function (err, _db) {
  // Escape our closure.
  db = _db;

  // Define some errors.
  db.on("error", function(error){
    console.log("Error connecting to MongoLab.");
    console.log(error);
  });
  console.log("Connected to mongo.");

  // Start server.
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
});





function saveCheckIn (uid, checkInTime, callback) {
  db.collection('checkins', function(err, collection) {
    collection.insert({
      'id': uid,
      'time': checkInTime
    });
    callback();
  });
}


function getCheckIns (id, callback) {
  db.collection('checkins', function (err, collection) {
    collection.find({
      'id': id,
    }, function (err, cursor) {
      cursor.toArray(function(err, items) {
        callback(items);
      });
    });
  });
}