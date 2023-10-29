const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//EITHER WE INSERT DOCS INSIDE DOCS OR WE INSERT THE IDS OF OTHER DOCS AND REFERENCE THEM 
const CategorySchema = new Schema({
    //CREATE A SIMPLE DATA (TYPE OF DATA)
    name:{
        type: String,
        required: true
    }

});

module.exports = mongoose.model('categories', CategorySchema);