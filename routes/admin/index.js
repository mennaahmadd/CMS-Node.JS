const express = require('express');
//use router from express
const router = express.Router();
const faker = require('faker');
// const randomBoolean = faker.datatype.boolean();
const Post = require('../../models/Post');
// const {userAuthenticated} = require('../../helpers/authentication');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');


//AFFECT EVERYTHING AFTER ADMIN
router.all('/*', (req, res, next)=>{
    //OVERWRITE BY ADMIN ROUTE
    req.app.locals.layout = 'admin';
    //next routes to be loaded
    next();
})




//YOU DONT HAVE TO DO /ADMIN
router.get('/', (req, res)=>{
    //TAKE ALL THE COUNTS INTO ARRAY AND USE IT AT ONCE
    //USE PROMISE ALL AND RETURN ALL THE METHODS IN IT
    const promises = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()

    ];
    Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{
        res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount})

    });
    //COUNT HOW MANY POSTS WE HAVE AND THEN DISPLAY IT
    //QUERY TO OUR DB 
    // Post.count({}).then(postCount=>{
    //     res.render('admin/index', {postCount: postCount});
    // });
    // res.send('IT WORKS');
    //WITH HANDLEBARS AVAILABLE YOU CAN NOW MAKE IT LIKE THIS 
    // res.render('admin/index');
});

//IF WE HAVE DASHBOARD FOR EXAMPLE 
// router.get('/dashboard', (req, res)=>{
//     // res.send('IT WORKS');
//     //WITH HANDLEBARS AVAILABLE YOU CAN NOW MAKE IT LIKE THIS 
//     res.render('admin/dashboard');
// });

router.post('/generate-fake-posts', (req, res)=>{
    // res.send('IT WORKS')
    for(let i = 0; i < req.body.amount; i++)
    {
        let post = new Post();
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.datatype.boolean();
        post.body = faker.lorem.sentence();
        post.slug = faker.name.title();
        // post.save().then(savedPost=>{});
        //SAVE NO LONGER ACCEPT CALLBACK FUNC
        post.save();
    }
        res.redirect('/admin/posts');

});

module.exports = router;