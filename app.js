const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/events');
const User = require('./models/users');

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
      type User {
        _id: ID!
        email: String!
        password: String
      }
      input UserInput {
        email: String!
        password: String!
      }
      type RootQuery {
        events: [Event!]!
        user(email: String): User
      }
      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: async () => {
        try {
          const allEvents = await Event.find();
          console.log('allevents', allEvents);
          return allEvents;
        } catch (err) {
          console.log('err fetching all events', err);
          throw err;
        }
      },
      user: async (arg) => {
        const { email } = arg;
        console.log('user arg', arg)
        try {
          const user = await User.find({ email })
          console.log('user: ', user)
          return user[0] ? {...user[0]._doc} : {};
        } catch (err) {
          console.log('error fetching user from DB', err);
          throw err;
        }
      },
      createEvent: async (args) => {
        const { title, description, price } = args.eventInput;
        const event = new Event({
          title,
          description,
          price,
          date: new Date()
        })
        try {
          const newEvent = await event.save();
          return {...newEvent._doc}
        } catch (err) {
          console.log('create event err', err)
          throw err;
        }
      },
      createUser: async (args) => {
        const { email, password } = args.userInput;
        try {
          const exisits = await User.find({ email });
          if (exisits.length > 0) {
            console.log('exisits: ', exisits)
            throw new Error('User with this email already exists.')
          } else {
            const hashedPw = await bcrypt.hash(password, 12);
            const user = new User({
              email,
              password: hashedPw
            })
            const newUser = await user.save();
            return {...newUser._doc}
          }
        } catch (err) {
          console.log('error creating new user', err);
          throw err;
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


