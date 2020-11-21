const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");
 
const typeDefs = require('./graphql/typeDefs');
const { MONGODB } = require("./config");
const resolvers = require('./graphql/resolvers');

const pubsub = new PubSub();

const PORT = process.env.port || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to DB");
    return server.listen({ port: PORT });
  })
  .then((res) => console.log(`Server running on ${res.url}`))
  .catch((e) => console.log(`Server failed ${e}!`));
