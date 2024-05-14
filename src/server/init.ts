import bodyParser from 'body-parser';
import cors from 'cors';
import colors from 'colors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import EnvWrap from './utils/envWrapper';
import githubAuthConfig from './auth/githubAuthConfig';
import authController from './controllers/authController';
import MongoDB from './mongo/mongo';
import MongoStore from 'connect-mongo';
import bookController from './controllers/bookController';

const init = async (): Promise<void> => {
  const serv = express();
  const PORT = 3005;
  console.log(`📗 Einbinden launching on port ${colors.bold.blue(PORT.toString())}`);
  const mongoStart = new MongoDB();
  await mongoStart.start();

  // Passport config
  serv.use(session({
    secret: <string>EnvWrap.get().value('SESSION_SECRET'),
    resave: true,
    rolling: true,
    saveUninitialized: false,
    unset: 'destroy',
    cookie: {
      secure: false, // <string>EnvWrap.get().value('RUN_ENV') === 'prod',
      maxAge: 1000 * 60 * 60 * 24 * 30, // ms * s * m * h * d
    },
    store: MongoStore.create({
      clientPromise: mongoStart.exposeClient().connect(),
      dbName: MongoDB.dbName,
      collectionName: 'Sessions',
    }),
  }));

  serv.use(passport.initialize());
  serv.use(cors({
    origin: <string>EnvWrap.get().value('AUTH_APP_URL'), // allow server to accept request from different origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // allow session cookie from browser to pass through
  }));
  serv.use(passport.session());
  githubAuthConfig(passport);

  console.log(`Auth ${colors.bold.blue('OK')}`);

  // Express config
  serv.use(bodyParser.json());
  serv.use(bodyParser.urlencoded({ extended: true }));

  console.log(`Server ${colors.bold.blue('OK')}`);

  // Set routes
  authController(serv, passport);
  bookController(serv);

  // Set Einbinden online
  serv.listen(PORT);
  console.log(`📗 Einbinden ${colors.green('successfully launched')}`);
};

export default init;
