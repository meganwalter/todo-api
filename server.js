var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var bcrypt = require('bcrypt');


app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

// GET /todos?completed=false&q=work

app.get('/todos', middleware.requireAuthentication, function (req, res) {
  var query = req.query;
  var where = {
    userId: req.user.get('id')
  };
//where user id = person's id, req.user. get id property
  if(query.hasOwnProperty('completed')) {
    if (query.hasOwnProperty('completed') && query.completed === 'true') {
      where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
      where.completed = false;
    }
  }
  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function (todos) {
    if(todos.length > 0) {
      res.json(todos);
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).send();
  });

});
// GET /todos/:id
app.get('/todos/:id',middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);
  //switch to find one where the id is the id and the userId matches userId on req.user
  db.todo.findOne({
    where: {
      userId: req.user.get('id'),
      id: todoId
    }
  }).then(function (todo) {
    if(!!todo){
      res.json(todo);
    } else {
      res.status(404).send();
    }
  }, function (e) {
    res.status(500).send();
  });
});
//POST /todos
app.post('/todos', middleware.requireAuthentication, function (req, res) {
  var body = _.pick(req.body, 'description', 'completed'); //use pick to only get description and completed
//call create on db.todo, first callback if successful, respond to API wiht 200 & value.toJSON, if fails return res.status(400).json(e)
  db.todo.create(body).then(function (todo) {
    // res.json(todo);
    req.user.addTodo(todo).then(function () {
      return todo.reload();
    }).then(function (todo) {
      res.json(todo);
    })
  }).catch(function (e) {
    res.send(400).json(e);
  });
});

// Delete todos/:id

app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
  var todoId = parseInt(req.params.id, 10);
//check if the userId = req.user.id
  db.todo.destroy({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then(function (rowsDeleted) {
    if (rowsDeleted === 0) {
      res.status(404).json({"error": "no todo with that id"});
    } else {
      res.send(204).send();
    }
  }, function () {
    res.status(500).send();
  });

  // var matchedTodo = _.findWhere(todos, {id: todoId});
  //
  // if (matchedTodo) {
  //   todos = _.without(todos, matchedTodo);
  //   res.json(matchedTodo);
  // } else {
  //   res.status(404).json({"error": "no todo with that id"});
  // }
});

//Put /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
  //validate, find by id
  //exact same for getting individual todos, fine one with where clause, only where id=id and userId = req.userId
  var todoId = parseInt(req.params.id, 10);
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed') ) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description') ) {
    attributes.description = body.description;
  }
  db.todo.findOne({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then(function (todo) {
    if(todo){
      todo.update(attributes).then(function (todo) {
        res.json(todo.toJSON());
      }, function (e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function () {
    res.status(500).send();
  });
});

app.post('/users', function (req, res) {
  var body = _.pick(req.body, 'email', 'password'); //use pick to only get description and completed
//call create on db.todo, first callback if successful, respond to API wiht 200 & value.toJSON, if fails return res.status(400).json(e)
  db.user.create(body).then(function (user) {
    res.json(user.toPublicJSON());
  },function (e) {
    res.status(400).json(e);
  });
});

// POST /users/login
app.post('/users/login', function (req, res) {
  var body = _.pick(req.body, 'email', 'password');
  var userInstance;

  db.user.authenticate(body).then(function (user) {
    var token = user.generateToken('authentication');
    userInstance = user;

    return db.token.create({
      token: token
    });

  }).then(function (tokenInstance) {
    res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
  }).catch(function () {
    res.status(401).send();
  }); // we are writing this
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
  req.token.destroy().then(function () {
    res.status(204).send();
  }).catch(function () {
    res.status(500).send();
  });
});

db.sequelize.sync({force: true}).then(function () {
  app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!');
  });
});
