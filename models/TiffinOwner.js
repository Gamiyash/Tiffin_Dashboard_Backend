const mongoose = require('mongoose');
const kitchenOwnerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    kitchen: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Kitchen'
        }
    ]
})
const kitchenOwner = mongoose.model('kitchenOwner',kitchenOwnerSchema);
module.exports = kitchenOwner;



