const express = require('express');
//use router from express
const router = express.Router();
//WE NEED TO QUERY OUR DB AND PULL OUT ALL OUR POSTS(THIS IS THE FIRST STEP)
const Post = require('../../models/Post');
//INCLUDE THE CATEGORY MODEL
const Category = require('../../models/Category');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
//ALLOW US TO LOGIN WITH OUR OWN CREDIENTIALS
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*', (req, res, next)=>{
    //OVERWRITE BY ADMIN ROUTE
    req.app.locals.layout = 'home';
    //next routes to be loaded
    next();
})




router.get('/', (req, res)=>{
    const perPage = 10 ;
    const page = req.query.page || 1;
    //WE NEED TO QUERY OUR DB AND PULL OUT ALL OUR POSTS
    Post.find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .then(posts=>{
        //GET COUNT OF OUR POSTS
        Post.count().then(postCount=>{
            //BRING ALL CATEGORIES
            Category.find({}).then(categories=>{
            res.render('home/index', {posts: posts, categories:categories, current: parseInt(page), pages: Math.ceil(postCount / perPage)});

        });

        });
        // //BRING ALL CATEGORIES
        // Category.find({}).then(categories=>{
        //     res.render('home/index', {posts: posts, categories:categories});

        // });
        // res.render('home/index', {posts: posts});
    });

    // //TO CREATE A SESSION 
    // req.session.menna = 'Menna Abdelhamid';
    // //TO CHECK SESSION 
    // if(req.session.menna)
    // {
    //     console.log(`WE FOUND ${req.session.menna}`);
    // }
    // res.send('IT WORKS');
    //WITH HANDLEBARS AVAILABLE YOU CAN NOW MAKE IT LIKE THIS 
    // res.render('home/index');
});

router.get('/about', (req, res)=>{
    res.render('home/about');
});

router.get('/login', (req, res)=>{
    res.render('home/login');
});



//APP LOGIN
//AUTHENTICATE THE EMAIL TOO
//IF WE ARE USING USERNAME WE DON'T HAVE TO HAVE usernameField
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
    // console.log(email);
    // console.log(password);
    //SEARCH DATABASE
    User.findOne({email: email}).then(user=>{
        if(!user) return done(null, false, {message: 'NO USER FOUND'});
        // user.testMethod();
        // CREATE SOME TYPE OF COMPARISON
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) return err;
            if(matched)
            {
                return done(null, user);
            }
            else
            {
                return done(null, false, {message: 'INCORRECT PASSWORD'})

            }

        });
    });
}));

passport.serializeUser(function(user, done){
    done(null, user.id);
});
//NOT WORKING THIS WAY NOT ACCEPTING CALLBACK ANYMORE
// passport.deserializeUser(function(id, done){
//     User.findById(id, function(err, user){
//         done(err, user);
//     });
// });
passport.deserializeUser(function(id, done){
    User.findById(id).exec()
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});


router.post('/login', (req, res, next)=>{
    //FIRST PARAMETER IS THE STRATEGY 
    //SECOND PARAMETER IS AN OBJECT WITH SOME PROPS AND VALUES DEPENDING ON WETHER WE AUTHENTICATE OR NOT
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
    
    // res.send('LOGIN POST WORKS');
});

router.get('/logout', (req, res)=>{
    //LOGOUT TAKES A CALLBACK FUNC
    req.logOut(function(err){
        if(err){
            return next(err);
        }
        res.redirect('/login');
    });


});

router.get('/register', (req, res)=>{
    res.render('home/register');
});

router.post('/register', (req, res)=>{
    let errors = [];
    console.log(req.body);
    // console.log(req);
    // const newUser = new User({
    //     firstName: req.body.firstName,
    //     lastName: req.body.lastName,  
    //     email: req.body.email,
    //     password: req.body.password
    //     //WE NEED PASSWORD HASHING FOR VALIDATION
    // });
    if(!req.body.firstName)
    {
        errors.push({message: 'PLEASE ADD THE FIRST NAME'});

    }
    if(!req.body.lastName)
    {
        errors.push({message: 'PLEASE ADD THE LAST NAME'});

    }
    if(!req.body.email)
    {
        errors.push({message: 'PLEASE ADD AN EMAIL'});
    }
    if(!req.body.password)
    {
        errors.push({message: 'PLEASE ADD A PASSWORD'});
    }
    if(!req.body.passwordConfirm)
    {
        errors.push({message: 'PLEASE ADD THE PASSWORD CONFRIMATION'});
    }
    if(req.body.password !== req.body.passwordConfirm)
    {
        errors.push({message: 'PASSWORDS FIELDS DO NOT MATCH'});
    }
    if(errors.length > 0)
    {
        res.render('home/register', {
            errors: errors,
            //DO THIS SO THE DATA IS ALWAYS IN THE FORM AND YOU DON'T HAVE TO TYPE IT AGAIN
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        })
    }
    else
    {
        User.findOne({email: req.body.email}).then(user=>{
            if(!user)
            {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,  
                    email: req.body.email,
                    password: req.body.password
                    //WE NEED PASSWORD HASHING FOR VALIDATION
                    //WE HAVE TO ASSIGN NEW VALUE TO THIS PASSWORD WE CANT KEEP IT LIKE THIS
                    //WE NEED A MODULE TO HASH THE PASSWORD
                });
        
                bcrypt.genSalt(10, (err, salt)=>{
                    //FOR HASHING THE PASSWORD
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        //CONVERT PROPERTY VALUE INTO HASH
                        newUser.password = hash;
                        // console.log(hash);
                        newUser.save().then(savedUser=>
                        {
                            // res.send('USER SAVED');
                            req.flash('SUCCESS_MESSAGE', 'YOU ARE NOW REGISTERED, PLEASE LOGIN');
                            res.redirect('/login');
                        });
        
                    })
        
                });

            }
            else
            {
                req.flash('ERROR_MESSAGE', 'THAT EMAIL EXISTS PLEASE LOGIN');
                res.redirect('/login');

            }
        });
        // const newUser = new User({
        //     firstName: req.body.firstName,
        //     lastName: req.body.lastName,  
        //     email: req.body.email,
        //     password: req.body.password
        //     //WE NEED PASSWORD HASHING FOR VALIDATION
        //     //WE HAVE TO ASSIGN NEW VALUE TO THIS PASSWORD WE CANT KEEP IT LIKE THIS
        //     //WE NEED A MODULE TO HASH THE PASSWORD
        // });

        // bcrypt.genSalt(10, (err, salt)=>{
        //     //FOR HASHING THE PASSWORD
        //     bcrypt.hash(newUser.password, salt, (err, hash)=>{
        //         //CONVERT PROPERTY VALUE INTO HASH
        //         newUser.password = hash;
        //         // console.log(hash);
        //         newUser.save().then(savedUser=>
        //         {
        //             // res.send('USER SAVED');
        //             req.flash('SUCCESS_MESSAGE', 'YOU ARE NOW REGISTERED, PLEASE LOGIN');
        //             res.redirect('/login');
        //         });

        //     })

        // });
        // newUser.save().then(savedUser=>{
        //     res.send('USER SAVED');
        // })

        // res.send('DATA WAS GOOD');
    }
    // res.send('home/register');
});



//ROUTE FOR THE LINKS ON THE HOMEPAGE FOR EVERY POST
router.get('/post/:slug', (req, res)=>{

    Post.findOne({slug: req.params.slug})
        .populate({path: 'comments' , match:{approveComment: true}, populate: {path: 'user' , model: 'users'}}).populate('user')
        .then(post=>{
            Category.find({}).then(categories=>{
                res.render('home/post', {post: post, categories: categories});
            })
            // res.render('home/post', {post: post});

        });
});



module.exports = router;