var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET /todos?completed=false&q=work

app.get('/todos', function (req, res) {
  var queryParams = req.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filteredTodos = _.where (filteredTodos, {completed: true});
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where (filteredTodos, {completed: false});
  }

  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
    filteredTodos = _.filter(filteredTodos, function (todo) {
      return todo.description.indexOf(queryParams.q) > -1;
    });
  }
  //q exists and is greater than 0
  //filer method on underscore, use index of to search string for queryParams

  res.json(filteredTodos);
});
// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    res.json(matchedTodo);
  } else {
    res.status(404).send();
  }
});

//POST /todos
app.post('/todos', function (req, res) {
  var body = _.pick(req.body, 'description', 'completed'); //use pick to only get description and completed
//call create on db.todo, first callback if successful, respond to API wiht 200 & value.toJSON, if fails return res.status(400).json(e)
  db.todo.create(body).then(function (todo) {
    res.json(todo);
  }).catch(function (e) {
    res.send(400).json(e);
  });
  // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
  //   return res.status(400).send();
  // }
  //
  // // set body.description use trim to remove spaces at begin or end
  // body.description = body.description.trim();
  // body.id = todoNextId;
  // todos.push(body);
  // todoNextId++;
  // res.json(body);
});

// Delete todos/:id

app.delete('/todos/:id', function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});

  if (matchedTodo) {
    todos = _.without(todos, matchedTodo);
    res.json(matchedTodo);
  } else {
    res.status(404).json({"error": "no todo with that id"});
  }
});

//Put /todos/:id
app.put('/todos/:id', function (req, res) {
  //validate, find by id
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description.trim();
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});

db.sequelize.sync().then(function () {
  app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
  });
});
