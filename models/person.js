const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

// console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Person name required'],
  },
  // validation: length of 8 or more, 
  // - be formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers
  //  - eg. 09-1234556 and 040-22334455 are valid phone numbers
  //  - eg. 1234556, 1-22334455 and 10-22-334455 are invalid
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(?:\d{2}-\d{6,}|\d{3,}-\d{5,})$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number`
    },
    required: [true, 'Person phone number required']
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
