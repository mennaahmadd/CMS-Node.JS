//IT IS OUR SERVER
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
//BRING THE HANDLEBARS HELPER FUNCTION LIKE THIS(HAVE IT OUT) THEN REGISTER IN THE ENGINE DOWN
const{select, generateTime, paginate} = require('./helpers/handlebars-helpers');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');

//BODY PARSER
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//use express session middleware
app.use(session({
    secret: 'your-secret-key',
    reverse: true,
    saveUninitialized: true
}));

//FLASH MIDDLEWARE
app.use(flash());

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//LOCAL VARIABLES USING MIDDLEWARE
//ALL OF THIS RELATED TO FORM-MSGS.HANDLEBARS
app.use((req, res , next)=>{
    //SHOW THE USER'S NAME AFTER LOGGING IN 
    res.locals.user = req.user || null;
    res.locals.SUCCESS_MESSAGE = req.flash('SUCCESS_MESSAGE');
    res.locals.ERROR_MESSAGE = req.flash('ERROR_MESSAGE');
    res.locals.form_erros = req.flash('form_errors');
    res.locals.error = req.flash('error');

    next();
})


//LOAD ALL ROUTES
//if it is in the same level put single . 
//if in different level put 2 dots
//RESPONSIBLE FOR EVERYTHING IN THE FRONTEND
//LOAD ROUTE
const home = require('./routes/home/index')
//USE ROUTE
app.use('/', home);

//THIS INDEX WILL HAVE ALL ROUTES FOR ADMIN
//LOAD ROUTE
const admin = require('./routes/admin/index')
//USE ROUTE 
app.use('/admin', admin);

//METHOD OVERRIDE
app.use(methodOverride('_method'));


const {engine} = require('express-handlebars');

//STATIC BECAUSE WE WILL USE CSS WHICH WE NEED STATIC
//THIS HOW WE USE THE MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));
//SET VIEW ENGINE
app.engine('handlebars', engine({extname: '.handlebars', handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: "home", helpers: {select: select , generateTime: generateTime,  paginate:  paginate}}));
app.set('view engine', 'handlebars');
app.set("views", path.join(__dirname, 'views'));

//UPLOAD MIDDLEWARE
//ADDS FILE PROPERTY IN TO THE REQUEST
app.use(upload());


const posts = require('./routes/admin/posts');
app.use('/admin/posts', posts);

const categories = require('./routes/admin/categories');
app.use('/admin/categories', categories);

const comments = require('./routes/admin/comments');
app.use('/admin/comments', comments);

//HANDELBARS IS AN ENGINE WE WILL BE USING TO PLAY AROUND WITH VARIABLES INSIDE HTML AND IT IS TEMPLATE ENGINFE
//WE HAVE TO SET IT UP
//WILL ALWAYS LOOK IN VIEWS DIREC
// app.engine('handlebars', exphbs({defaultLayout:'home'}));
//WE HAVE TO TELL THE APP RECOGNIZES THIS AS VIEW ENGINE
// app.set('view engine', 'handlebars');


// //WE NEED TO HAVE SOME TYPE OF ROUTE
// //IT WORKS WILL APPEAR IN THE BROWSER
// app.get('/', (req, res)=>{
//     // res.send('IT WORKS');
//     //WITH HANDLEBARS AVAILABLE YOU CAN NOW MAKE IT LIKE THIS 
//     res.render('home/index');
// });

// app.get('/about', (req, res)=>{
//     res.send('home/about');
// });

// app.get('/login', (req, res)=>{
//     res.send('home/login');
// });

// app.get('/register', (req, res)=>{
//     res.send('home/register');
// });




//--------CREATE DB FOR THE PROJECT-------------
//include mongoose
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//CONNECT
// mongoose.connect('mongodb://localhost:27017/cms').then((db)=>{
//     console.log('MONGO CONNECTED');
// }).catch(error=> console.log("COULD NOT CONNECT" + error));
mongoose.connect(mongoDbUrl).then((db)=>{
    console.log('MONGO CONNECTED');
}).catch(error=> console.log("COULD NOT CONNECT" + error));

app.listen(4500, ()=>{
    console.log('LISTENING TO PORT 4500');
})
