const express = require('express');
//use router from express
const router = express.Router();

//BRING THE SCHEMA
const Post = require('../../models/Post');
const { isEmpty, uploadDir } = require('../../helpers/upload-helpers');
//WE NEED THIS TO BE ABLE TO DELETE A FILE WHICH IS THE IMAGE IN THIS CASE
const fs = require('fs');
// const path = require('path');
const Category = require('../../models/Category')
const {userAuthenticated} = require('../../helpers/authentication');
const Comment = require('../../models/Comment');

//AFFECT EVERYTHING AFTER ADMIN
// router.all('/*', (req, res, next)=>{
//     //OVERWRITE BY ADMIN ROUTE
//     req.app.locals.layout = 'admin';
//     //next routes to be loaded
//     next();
// });
router.all('/*',userAuthenticated,  (req, res, next)=>{
    //OVERWRITE BY ADMIN ROUTE
    req.app.locals.layout = 'admin';
    next();
});


router.get('/', (req, res)=>{
    // res.send('IT WORKSS');
    //CALL THE DATA FROM THE DB 
    //lean IS TO SOLVE THE ISSUE OF HANDLEBARS NEW VERSION
    //posts is an array
    Post.find({}).maxTimeMS(20000)
    //POPULATE THE POST WITH THE CATEGORY SO THAT THE CATEGORY NAME CAN APPEAR INSTEAD OF THE ID
    .populate('category')
    .then(posts=>{
        res.render('admin/posts', {posts:posts});
    }).catch(error => {
        console.error(error);
        res.status(500).send('Internal Server Error');
    });
    // res.render('admin/posts');
});

router.get('/my-posts', (req , res)=>{
    Post.find({user: req.user.id})
    .populate('category')
    .then(posts=>{
        res.render('admin/posts/my-posts', {posts:posts});
    });

})


// router.get('/create', (req, res)=>{
//     Category.find({}).then(categories=>{
//         res.render('admin/posts/create', {categories: categories});

//     });
//     // res.render('admin/posts/create');
// });


// router.post('/create', (req, res)=>{

//     let errors = [];

//     if(!req.body.title)
//     {
//         errors.push({message: 'PLEASE ADD A TITLE'});

//     }
//     if(!req.body.body)
//     {
//         errors.push({message: 'PLEASE ADD A BODY'});

//     }
//     if(errors.length > 0)
//     {
//         res.render('admin/posts/create' , {
//             errors: errors
//         })
//     }
//     else
//     {
//         let filename = 'M BARCODE.png';

//         if(!isEmpty(req.files))
//         {
//             //MOVE THE FILE
//             let file = req.files.file;
//             filename = Date.now() + '-' + file.name;
         
//             file.mv('./public/uploads/'+ filename, (err)=>
//             {
//                 if(err) throw err;
//             });
//             // //TEST
//             // console.log('IS NOT EMPTY');
//         }
//         // else{
//         //     console.log('IS EMPTY');
//         // }
    
//         // INIIALIZE TYPE OF VARIABLE HERE FOR THE CHECKBOX TO PREVENT THE ON AND UNDEFINED THING
//         // CONVERTING ON AND OFF THAT WE ARE GETTING FROM CHECKBOX TO BOOLEAN VALUES
        
//         // TESTING IF UPLOADING FILE IS WORKING
//         // console.log(req.files);
    
//         let allowComments = true;
//         if(req.body.allowComments)
//         {
//             allowComments = true;
//         }
//         else
//         {
//             allowComments = false;
//         }
    
//         //WE ARE SUPPOSED TO PARSE THE DATA AFTER RECIEVING IT
//         //POST WILL TAKE AN OBJECT WHICH IS THE SCHEMA WE HAVE
//         const newPost = new Post({
//             user: req.user.id,
//             title: req.body.title,
//             status: req.body.status,
//             allowComments: allowComments,
//             body: req.body.body,
//             category: req.body.category,
//             file: filename
//         });
//         newPost.save().then(savedPost=>{
//             //DO STH AFTER POST SAVED
//             console.log(savedPost);
//             //FLASH MESSAGE SET UP 
//             req.flash('SUCCESS_MESSAGE', `POST ${savedPost.title} WAS CREATED SUCCESSFULLY`);
//             res.redirect('/admin/posts');
    
//         }).catch(error=>{
//             console.log(error, 'COULD NOT SAVE POST');
//         });    

//     }
//     // console.log(req.body);
// });

//------------EVENT DRIVEN VERSION FOR CREATE-------------

// GET route to render the create post form
router.get('/create', async (req, res) => {
    try {
        // Fetch categories asynchronously
        const categories = await Category.find({});
        res.render('admin/posts/create', { categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// POST route to handle form submission and create a new post
router.post('/create', async (req, res) => {
    try {
        let errors = [];

        // Validate form data
        if (!req.body.title) {
            errors.push({ message: 'PLEASE ADD A TITLE' });
        }
        if (!req.body.body) {
            errors.push({ message: 'PLEASE ADD A BODY' });
        }

        if (errors.length > 0) {
            // Render the form with error messages
            res.render('admin/posts/create', { errors });
        } else {
            let filename = 'M BARCODE.png';

            // Check if a file is uploaded
            if (!isEmpty(req.files)) {
                let file = req.files.file;
                filename = Date.now() + '-' + file.name;

                // Move the file asynchronously
                await new Promise((resolve, reject) => {
                    file.mv('./public/uploads/' + filename, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }

            // Determine the value of allowComments
            let allowComments = req.body.allowComments === 'on';

            // Create a new Post object
            const newPost = new Post({
                user: req.user.id,
                title: req.body.title,
                status: req.body.status,
                allowComments,
                body: req.body.body,
                category: req.body.category,
                file: filename
            });

            // Save the post asynchronously
            const savedPost = await newPost.save();

            // Log the saved post
            console.log(savedPost);

            // Flash message setup
            req.flash('SUCCESS_MESSAGE', `POST ${savedPost.title} WAS CREATED SUCCESSFULLY`);
            res.redirect('/admin/posts');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


//ID IS PLACEHOLDER FOR DATA
router.get('/edit/:id', (req, res)=>
{
    // res.send(req.params.id);
    // res.render('admin/posts/edit');
    //PULL SPECIFIC POST OUT TO APPEAR IN THE FORM
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('admin/posts/edit', {post: post, categories: categories});
    
        });
        // res.render('admin/posts/edit', {post:post});
    });
});



router.put('/edit/:id', (req, res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        
        if(req.body.allowComments)
        {
            allowComments = true;
        }
        else
        {
            allowComments = false;
        }
        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;
        if(!isEmpty(req.files))
        {
            //MOVE THE FILE
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            post.file = filename;
            file.mv('./public/uploads/'+ filename, (err)=>
            {
                if(err) throw err;
            });
        }
        //ONCE WE HAVE THAT WE HAVE TO SAVE IT
        post.save().then(updatePost=>{
            req.flash('SUCCESS_MESSAGE' , 'POST WAS SUCCESSFULY UPDATED');
            res.redirect('/admin/posts/my-posts');
        });
        // res.render('admin/posts/edit', {post:post});
    });
    // res.send("IT WORKS");
});


// router.delete('/:id', (req,res)=>{
//     //POST.REMOVE MSH MAWGOODA
//     Post.findOne({_id: req.params.id})
//     //IT WILL BRING ARRAY OF COMMENTS FOR EACH OF MY COMMENTS
//         .populate('comments')
//         .then(post=>{

//             fs.unlink(uploadDir + post.file, (err)=>{
//                 // console.log(post.comments);
//                 if( post.comments.length > 0)
//                 {
//                     post.comments.forEach(comment=> {
//                         console.log(comment._id)
//                         Comment.findOneAndDelete({ _id: comment._id.toString()});

//                         // Comment.deleteOne({ _id: comment._id});
//                     });
//                     // for (const comment of post.comments) {
//                     //     Comment.findOneAndDelete({ _id: comment._id });
//                     // }
//                 }
//                 // TO DELETE THE POST
//                 Post.findOneAndDelete({ _id: req.params.id })
//                 .then(() => {
//                     req.flash('SUCCESS_MESSAGE', 'POST WAS SUCCESSFULLY DELETED');
//                     res.redirect('/admin/posts');
//                 })
//             });
//         });
// });

router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id }).populate('comments');

        if (post) {
            // Delete comments first
            for (const comment of post.comments) {
                await Comment.findOneAndDelete({ _id: comment._id });
            }

            // Delete the post file
            fs.unlink(uploadDir + post.file, (err) => {
                if (err) {
                    console.error('Error deleting post file:', err);
                }
            });

            // Delete the post
            await Post.findOneAndDelete({ _id: req.params.id });

            req.flash('SUCCESS_MESSAGE', 'Post was successfully deleted');
            res.redirect('/admin/posts/my-posts');
        } else {
            req.flash('ERROR_MESSAGE', 'Post not found');
            res.redirect('/admin/posts');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        req.flash('ERROR_MESSAGE', 'An error occurred while deleting the post');
        res.redirect('/admin/posts');
    }
});


module.exports = router;

