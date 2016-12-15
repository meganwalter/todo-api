var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
  id: 1,
  description: 'Meet mom for lunch',
  completed: false
}, {
  id: 2,
  description: 'Go to the store',
  completed: false
}, {
  id: 3,
  description: 'Go to the gym',
  completed: true
}];

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
  res.json(todos);
});
// GET /todos/:id
app.get('/todos/:id', function (req, res) {
  var todoId = req.params.id;
  var paramExists = false;
  //iterate over todos array to find the match
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === todoId) {
      res.json(todos[i]);
      return;
    }
  }
});

app.listen(PORT, function () {
  console.log('Express listening on port ' + PORT + '!');
});