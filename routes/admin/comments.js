
const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');




// WE NEED TO ALWAYS HAVE THIS ROUTE APPLYING ALL THE ADMIN LAYOUT
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
})

//FOR THE VIEW PURPOSES
router.get('/', (req, res)=>{
    //WE NEED SOME DATA
    Comment.find({user: '652ec976fcd3a390bfcfb43d'})
    //WE HAVE A RELATIONSHIP BETWEEN USER AND COMMENTS
    .populate('user')
    .then(comments=>{
        res.render('admin/comments', {comments: comments});
    })
    // res.render('admin/comments');

});

//A POST ROUTE
router.post('/', (req, res)=>{

    Post.findOne({_id: req.body.id}).then(post=>{
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });
        post.comments.push(newComment);
        post.save().then(savedPost=>{
            newComment.save().then(savedComment=>{
                req.flash('SUCCESS_MESSAGE', 'YOUR COMMENT WILL BE REVIWED IN A MOMENT')
                res.redirect(`/post/${post.id}`);
            })
        });
    });
    // res.send('IT WORKS');
});



// router.delete('/:id', (req, res)=>{
//     Comment.findOneAndDelete({_id: req.params.id}).then(deletedItem=>{
//         Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{
//             if(err) console.log(err);
//             res.redirect('/admin/comments')

//         });
//         // res.redirect('/admin/comments')

//     });
// });

router.delete('/:id', (req, res) => {
    Comment.findOneAndDelete({ _id: req.params.id }).then((deletedItem) => {
        // Use findOneAndUpdate without the callback, it returns a promise
        return Post.findOneAndUpdate(
            { comments: req.params.id },
            { $pull: { comments: req.params.id } }
        );
    }).then((data) => {
        res.redirect('/admin/comments');
    }).catch((err) => {
        console.error(err);
        // Handle error appropriately
        res.redirect('/admin/comments');
    });
});


// router.post('/approve-comment', (req, res)=>{
//     // res.send('IT WORKS')
//     // console.log(req.body.id)
//     // console.log(req.body.approveComment)
//     Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{
//         if(err) return err;
//         res.send(result);
//     });

// });

router.post('/approve-comment', (req, res) => {
    const { id, approveComment } = req.body;

    Comment.findByIdAndUpdate(id, { $set: { approveComment: approveComment } })
        .then(result => {
            res.send(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});





module.exports = router;