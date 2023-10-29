// module.exports = {
//     //BUILD A FUNCTION TO THE VALIDATION OF THE FILE IF IT IS EMPTY OR NOT 
//    isEmpty: function(obj){
//     for(let key in obj)
//     {
//         if(obj.hasOwnProperty(key))
//         {
//             return false;
//         }
//     }
//     return true;

//    }

// };
const path = require('path');

module.exports = {
    uploadDir: path.join(__dirname, '../public/uploads/'),
    // BUILD A FUNCTION TO THE VALIDATION OF THE FILE IF IT IS EMPTY OR NOT
    isEmpty: function(obj) {
        if (obj === null || obj === undefined) {
            return true; // obj is null or undefined, consider it empty
        }

        if (typeof obj !== 'object') {
            return true; // obj is not an object, consider it empty
        }

        return Object.keys(obj).length === 0;
    }
};
