const express = require('express')
const app = express()

var morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/Person')

morgan.token('body', (req) => JSON.stringify(req.body))


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message})
  }

  next(error)
}
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':body'))
app.use(express.static('build'))

let persons = 
[  
    {   
        id: 1,    
        name: "Barry Whitemore",    
        number: 123  
    },  
    {    
        id: 2,    
        name: "David Lichenstein",    
        number: 333  
    },  
    {   
        id: 3,    
        name: "Shaun O'Hennessey",    
        number: 345  
    },
    {
        id: 4,    
        name: "Mary Maclemore",    
        number: 765 
    }
]



app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
  })

  app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
  })

  app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
      res.send(`
      <div>
      <p>Phonebook has info for ${JSON.stringify(persons.length)} people</p>
      <p>${Date()}</p>
      </div>`)
    });

  })

  app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })  
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
  const body = req.body 

    Person.findOne({ name: body.name }, (err, existingPerson) => {
      if (err) {
        return next(err);
      }
      if (existingPerson) {
        // If a person with the same name already exists, update their number
        existingPerson.number = body.number;
        existingPerson.save().then(savedPerson => {
          res.json(savedPerson);
        }).catch(error => next(error));
      } else {
        // If no person with the same name exists, create a new person
        const person = new Person({
          name: body.name,
          number: body.number,
        })
        person.save().then(savedPerson => {
          res.json(savedPerson);
        }).catch(error => next(error));
      }
    });
  
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.use(errorHandler)

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })