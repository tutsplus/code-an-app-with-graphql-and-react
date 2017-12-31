import './style/style.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';

import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

// Result of
// {
//   __schema {
//     types {
//       kind
//       name
//       possibleTypes {
//         name
//       }
//     }
//   }
// }
// without the data parameter.
import introspectionQueryResultData from './fragment-data.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData });

import App from './components/app';

const link = new HttpLink({ uri: 'http://localhost:3000/graphql' });
// const link = new HttpLink({ uri: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql' });

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: errorLink.concat(link),
  cache: new InMemoryCache({ fragmentMatcher })
});

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <HashRouter>
        <Route path="/" component={App} />
      </HashRouter>
    </ApolloProvider>
  );
};

ReactDOM.render(
  <Root />,
  document.querySelector("#react-app")
);
