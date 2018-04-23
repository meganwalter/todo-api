Test app for learning node

#### Instructions to run locally
```
> git clone
> npm install
> node server.js
> open localhost:3000
```
## Using postman (localhost:3000)
Create account (POST)
```
{
	"email": "myemail@test.com",
    "password": "test11111"
}
```
Login to /users/login (POST)
```
{
	"email": "myemail@test.com",
    "password": "test11111"
}
```
Grab the Auth token from the response header and put in your request header as Auth

Post a todo at /todos
```
{
	"description": "learn node.js",
    "completed": false
}
```
Get all todos at /todos

Get your todo by id at /todos/id

Complete your todos with a PUT to todos/id
```
{
    "completed": true
}
```
