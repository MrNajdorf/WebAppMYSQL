const mysql = require('mysql2')
const express = require('express')
const app = express()
const path = require('path')
const { v4: uuidv4 } = require('uuid')
var methodOverride = require('method-override')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let port = 3000;
let data;
let numOfUsers;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'courseDB',
  password: 'IDONTWANNASHOWMYPASSWORD'
});

try {
  connection.query(
    'SELECT * FROM user;',
    function (err, results) {
      data = results;
      numOfUsers = data.length;
    }
  )
  
} catch (err) {
  console.log("Error while communicating with the database")
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});

app.get('/', (req, res) => {
  res.render('numOfUsers.ejs', { numOfUsers: numOfUsers })
});

app.get('/users', (req, res) => {
  res.render('Users.ejs', { data: data })
});

app.get('/:id/edit', (req, res) => {
  let {id} = req.params;
  let user = data.find(u => u.user_id === id)
  res.render('edit.ejs', { user: user })
});

app.get('/new', (req, res) => {
  res.render('new.ejs')
});

app.patch('/:id', (req, res) => {
  let {id} = req.params
  let user = data.find(u => u.user_id === id)
  user.user_name = req.body.name
  user.user_email = req.body.email
  user.user_password = req.body.password
  res.redirect('/users')
});

app.post('/users', (req, res) => {
  let user = {
    user_name: "",
    user_email: "",
    user_password: ""
  }
  user.user_id = uuidv4();
  user.user_name = req.body.name;
  user.user_email = req.body.email;
  user.user_password = req.body.password;
  data.push(user);
  res.redirect('/users');
});

app.delete('/:id', (req, res) => {
  let {id} = req.params;
  data = data.filter(u => u.user_id !== id);
  res.redirect('/users');
});

connection.end();