const mongoose = require('mongoose');

mongoose.set('strictQuery',false)


const url =process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
.then(result => {    
    console.log('connected to MongoDB')  
})  .catch((error) => 
{    
    console.log('error connecting to MongoDB:', error.message)  
})

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minlength: 3,
      required: [true, 'Users name required']
    },
    number: {
      type: String,
      minlength: 8,
      required: [true, 'User phone number required'],
      validate: {
        validator: function(v) {
          return /^\d{2,3}-\d{1,}?$/.test(v);

        },
        message: props => `${props.value} must have 2 or 3 digits before a hyphen (-) which acts as its 3rd or 4th member!`
      }
    },
  })


  personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Person', personSchema)