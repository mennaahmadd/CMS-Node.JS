const mongoose = require('mongoose');
// const URLSlugs = require('mongoose-url-slugs');

const Schema = mongoose.Schema;
const slugify = require('slugify');

//EITHER WE INSERT DOCS INSIDE DOCS OR WE INSERT THE IDS OF OTHER DOCS AND REFERENCE THEM 
const PostSchema = new Schema({
    //CREATE A SIMPLE DATA (TYPE OF DATA)

    //CREATE A USER FOR A SPECIFIC POST
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'

    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories'
    },
    title:{
        type: String,
        required: true
    },
    //WE NEED TO ADD A SLUG WHICH IS A REP OF SOME DATA AND IT IS USED FOR PRETTY URLS
    //WE DONT WANT DUPLICATES
    //IT WILL CARRY THE TITLE FROM DB 
    slug: {
        type: String
    },
    status:{
        type: String,
        default: 'public'
    },
    allowComments:{
        type: Boolean,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    file:{
        type: String,
    }, 
    date: {
        type: Date,
        default: Date.now()
    },
    //THE CONCEPT OF ARRAY TTO KEEP MULTIPLE IDS NOT ONLY ONE
    //WE WILL KEEP THE IDS OF ALL THE COMMENTS
    //A POST CAN HAVE MANY COMMENTS
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]


}, {usePushEach: true});


//FUNCTION THAT USES MONGOOSE TO PLUGIN FUNCTIONALITIES
//FIRST PARAMETER IS WHERE WE WANT TO PULL DATA FROM
//SECOND PARAM IS AN OBJECT SPECIFIYING OTHER FIELDS WE ARE GOING TO 
// PostSchema.plugin(URLSlugs('title', {field: 'slug'}));
PostSchema.pre('save', function (next) {
    // Generate the slug based on the title
    this.slug = slugify(this.title, { lower: true });
    next();
});


//WE HAVE TO DO THIS
//FIRST PARAM IS THE NAME FOR THE MODEL AND THE SEC IS THE SCHEMA
//BEHIND THE SCENES MONGOOSE WILL MAKE Post -> posts
module.exports = mongoose.model('Post', PostSchema);

