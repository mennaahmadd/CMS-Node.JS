const express = require('express');
//use router from express
const router = express.Router();
const Category = require('../../models/Category');
const {userAuthenticated} = require('../../helpers/authentication');


//AFFECT EVERYTHING AFTER ADMIN
router.all('/*', userAuthenticated,  (req, res, next)=>{
    //OVERWRITE BY ADMIN ROUTE
    req.app.locals.layout = 'admin';
    //next routes to be loaded
    next();
})




//YOU DONT HAVE TO DO /ADMIN
router.get('/', (req, res)=>{
    //GET THE CATEGORY 
    Category.find({}).then(categories=>{
        res.render('admin/categories/index', {categories: categories});
    })
    // res.send('IT WORKS');
    //WITH HANDLEBARS AVAILABLE YOU CAN NOW MAKE IT LIKE THIS 
    // res.render('admin/categories/index');
});

//LETS CREATE ANOTHER ONE FOR THE CREATE
router.post('/create', (req, res)=>{
    //WE HAVE TO CREATE AN OBJECT FIRST
    const newCategory = Category({
        name: req.body.name
    });
    newCategory.save().then(savedCategory=>{
        res.redirect('/admin/categories');
    }).catch(err => {
        console.error(err);
        // Handle errors appropriately
        res.render('admin/categories/index', { error: 'Failed to create category.' });
    });

});


router.get('/edit/:id', (req, res)=>{
    //GET THE CATEGORY 
    Category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    });
});


//UPDATE CATEGORY
//THE UPDATE WON'T WORK UNTIL YOU GO TO THE HANDLEBARS AND ADD IN THE URL {{CATEGORY.ID}}?_METHOD='PUT'
router.put('/edit/:id', (req, res)=>{
    Category.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(savedCategory=>{
            res.redirect('/admin/categories');
        })
    });
});



router.delete('/:id', (req,res)=>{
    Category.findOneAndDelete({_id: req.params.id}).then(result=>{
        res.redirect('/admin/categories');
    });

});

module.exports = router;