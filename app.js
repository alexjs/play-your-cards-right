
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , csv = require('ya-csv');

require('./lib/extras');

var app = module.exports = express.createServer();

app.use(express.cookieParser());
app.use(express.session({ secret: "not nyan not nyan" }));

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Load sites

positions = [];
cardsPlayed = [];
score = 0;

var reader = csv.createCsvFileReader('data/civil-servant-salaries.csv', { columnsFromHeader: true });
reader.addListener('data', function(data) {

    positions.push( {
      'title': data['Job Title'],
      'organisation': data['Organisation'],
      'notes': data['Notes'],
      'maxSalary': data['maxSalary'],
      'formattedMaxSalary': format_number(data['maxSalary'])

    });
});

// Routes

app.get('/', routes.index);

app.post('/higher', function(req, res){
  if (req.session.cardsPlayed) {
    baseCard = req.session.cardsPlayed[req.session.cardsPlayed.length-2];
    lastCard = req.session.cardsPlayed[req.session.cardsPlayed.length-1];

    if (baseCard.maxSalary < lastCard.maxSalary) {
      showCorrectAnswer(req);
    } else if (baseCard.maxSalary == lastCard.maxSalary) {
      showIncorrectAnswerSame(req);
    } else {
      showIncorrectAnswer(req);
    }

    newCard(req);
  }
  res.redirect('/');
});

app.post('/lower', function(req, res){

  baseCard = req.session.cardsPlayed[req.session.cardsPlayed.length-2];
  lastCard = req.session.cardsPlayed[req.session.cardsPlayed.length-1];

  if (baseCard.maxSalary > lastCard.maxSalary) {
    showCorrectAnswer(req);
  } else if (baseCard.maxSalary == lastCard.maxSalary) {
    showIncorrectAnswerSame(req);
  } else {
    showIncorrectAnswer(req);
  }

  newCard(req);
  res.redirect('/');
});

app.post('/restart', function(req, res) {
  req.session.cardsPlayed = [];
  req.session.score = 0;
  res.redirect('/');
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
