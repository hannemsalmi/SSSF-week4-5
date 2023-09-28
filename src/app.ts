require('dotenv').config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import typeDefs from './api/schemas/index';
import resolvers from './api/resolvers/index';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import {notFound, errorHandler} from './middlewares';
import {MyContext} from './interfaces/MyContext';
import authenticate from './functions/authenticate';

const app = express();

(async () => {
  // TODO Create a rate limit rule instance

    // TODO Create a permissions object

    // TODO Apply the permissions object to the schema
    // remember to change the typeDefs and resolvers to a schema object
  try {
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
      })
    );
    const server = new ApolloServer<MyContext>({
      typeDefs,
      resolvers,
      plugins: [
        process.env.ENVIRONMENT === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              embed: true as false,
            })
          : ApolloServerPluginLandingPageLocalDefault({footer: false}),
      ],
      includeStacktraceInErrorResponses: false,
    });
    await server.start();

    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(server, {
        context: ({req}) => authenticate(req),
      })
    );

    app.use(notFound);
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
})();

export default app;