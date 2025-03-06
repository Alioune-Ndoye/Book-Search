import express from 'express';
import path from 'node:path';
import type { Request, Response } from 'express';
// Import the ApolloServer class from the Apollo Server package
import {
  ApolloServer,
} from '@apollo/server';
// Import the expressMiddleware from the Apollo Server express4 integration
import {
  expressMiddleware
} from '@apollo/server/express4';
// Import the authentication middleware that validates the JWT token
import { authenticateToken } from './services/auth-service.js';
// Import the GraphQL schema parts (typeDefs and resolvers)
import { typeDefs, resolvers } from './schemas/index.js';
// Import the database connection
import db from './config/connection.js';

const PORT = process.env.PORT || 3001; // Set the port for the server (default to 3001)
const server = new ApolloServer({
  typeDefs,   // GraphQL type definitions (schema)
  resolvers,  // GraphQL resolvers to handle queries and mutations
});

const app = express(); // Initialize the Express application

// Create an asynchronous function to start the Apollo Server
const startApolloServer = async () => {
  // Start the Apollo server by calling its `start` method
  await server.start();

  // Wait for the database connection to be established
  await db;

  // Middleware to parse URL-encoded data (useful for form submissions)
  app.use(express.urlencoded({ extended: false }));
  // Middleware to parse JSON bodies in requests
  app.use(express.json());

  // Set up the `/graphql` endpoint with Apollo Server's express middleware
  // The `authenticateToken` middleware is used to verify JWT tokens for secure access
  app.use('/graphql', expressMiddleware(server as any, {
    context: authenticateToken as any // Use the `authenticateToken` to add user info to the request context
  }));

  // If the application is in production mode
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from the client (front-end build)
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // For any other route (like those for client-side routing), send the index.html from the client build
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Start the Express server on the specified port
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

// Call the asynchronous function to start the Apollo Server and the Express app
startApolloServer();
