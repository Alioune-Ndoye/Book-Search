import './App.css';
import { Outlet } from 'react-router-dom';
import {ApolloClient,InMemoryCache,ApolloProvider,createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Navbar from './components/Navbar';

// Define the main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql',
});

// Middleware to attach the JWT token to each request's `authorization` header
const authLink = setContext((_, { headers }) => {
  // Retrieve the token from localStorage
  const token = localStorage.getItem('id_token');
  // Attach token to the request headers (if it exists)
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Initialize Apollo Client with the HTTP link and authentication middleware
const client = new ApolloClient({
  // Chain `authLink` to `httpLink` to ensure the token is added before sending the request
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
