const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');

const PORT = 6767;

const app = express();

const events = [];

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
      createEvent: (args) => {
        console.log('createEvent args', args);
        const { title, description, price } = args.eventInput;
        const newId = events.length === 0 ? 1 : parseInt(events[events.length - 1]._id) + 1;
        const event = {
          _id: newId.toString(),
          title,
          description,
          price,
          date: new Date().getTime()
        }

        events.push(event);
        return event;
      }
    },
    graphiql: true
  })
)

app.listen(PORT, () => console.log(`nodemon listening on http://localhost:${PORT}/graphql`))

