require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())

app.use(express.static('dist'))

// create new morgan token of request body
morgan.token('request-body', function (req, res) {
  return JSON.stringify(req.body);
})

const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :request-body')
app.use(morganMiddleware)

app.get('/info', (_request, response, next) => {
  const date = new Date()
  Person.find().then(people => {
    response.send(`<p>Phonebook has info for ${people.length} people</p><p>${date}</p>`)
  }).catch(next)
})

app.get('/api/persons', (_request, response) => {
  Person.find().then(people => {
    response.json(people)
  })
})

app.post('/api/persons', (request, response, next) => {
  const {name, number} = request.body

  const person = new Person({
    name: name,
    number: number
  })

  Person.find({ name: name })
    .then(people => {
      if (people.length > 0) {
        return response.status(422).json({
          error: 'name must be unique'
        })
      } else {
        person.save().then(savedPerson => {
          response.json(savedPerson)
        }).catch(error => {
          next(error)
        })
      }
    }).catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    }).catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body;

  const person = {
    name,
    number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(result => {
      if (result === null) {
        response.status(404).end()
      } else {
        response.json(result)
      }
    }).catch(next)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      if (result === null) {
        response.status(404).end()
      } else {
        response.status(204).end()
      }
    })
    .catch(next)
})

const errorHandler = (error, request, response, next) => {
  console.error('errorhandler', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
