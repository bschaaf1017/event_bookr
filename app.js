const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/events');

const PORT = 6767;

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String
        description: String!
        price: Float!
        date: String!
      }
      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }
      type RootQuery {
        events: [Event!]!
      }
      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => events,
      createEvent: async (args) => {
        console.log('createEvent args', args);
        const { title, description, price } = args.eventInput;
        const event = {
          title,
          description,
          price,
          date: new Date()
        }
        try {
          const newEvent = await Event.create(event)
          console.log('newEvent: ', newEvent)
          newEvent.date = new Date(newEvent.date).toISOString();
          return newEvent
        } catch (err) {
          console.log('create event err', err)
        }
      }
    },
    graphiql: true
  })
)

mongoose.connect(`mongodb+srv://${process.env.MONGO_UN}:${process.env.MONGO_PW}@cluster0.dgdnm.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DB connected and nodemon listening on http://localhost:${PORT}/graphql`)
    })
  })
  .catch((err) => console.log('error connecting to mongo cluster', err))


