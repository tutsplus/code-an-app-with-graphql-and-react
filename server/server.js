const express = require('express');
const cors = require('cors');
const expressGraphQL = require('express-graphql');

const app = express();

const schema = require('./server/schema');
// const { schema, root } = require('./server/schema');

app.use(cors());
app.use('/', expressGraphQL({
  schema,
  // rootValue: root,
  graphiql: true
}));

app.listen(3000, () => {
  console.log('Started the server on http://localhost:3000/');
});
