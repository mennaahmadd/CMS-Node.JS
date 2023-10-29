const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//EITHER WE INSERT DOCS INSIDE DOCS OR WE INSERT THE IDS OF OTHER DOCS AND REFERENCE THEM 
const CommentSchema = new Schema({
    //CREATE A SIMPLE DATA (TYPE OF DATA)
    //WE NEED THE ID FOR THE USER
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    body:{
        type: String,
        required: true
    },
    approveComment: {
        type: Boolean,
        default: false

    },
    date:
    {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('comments', CommentSchema );

//WE WANT A ROUTE TO ADD A COMMENT AND A ROUTE TO DISPLAY THE COMMENT (SECTION 20 PART 2)