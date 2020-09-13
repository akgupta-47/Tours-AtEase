const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. Middlewares

app.use(
  cors({
    origin: '127.0.0.1:3000',
    credentials: true,
  })
);
// helmet is a collection of middlewares
//helmet sets secure http headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'http://127.0.0.1:3000/*'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'unsafe-eval'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      upgradeInsecureRequests: [],
    },
  })
);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Whoa!! too many requests, try again in 1 hour',
});
app.use('/api', limiter);

// body parser reading data from  body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// mongo data sanitization to prevent querry injection
app.use(mongoSanitize());

// satitisation against xss (malicious html in querry string)
app.use(xss());

// prevent parameter pollution like from "&sort=duration&sort = price"
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// seving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Json.parse converts json data into javascript object array

// 3. Routes

//now these two are middlewares for routers, Mounting
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

/**for all the unhandeled routes we create a handler middleware for
 * so just bcoz u have reached here passing all the other middleware above so any querry here
 * must be useless one so we need to send a json response
 */

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find the ${req.originalUrl} on the server`,
  // });
  ////////////////////////////////////////////////
  // const err = new Error(`Can't find the ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  ////////////////////////////////////////////
  next(new AppError(`Can't find the ${req.originalUrl} on the server`, 404));
});

// next(err) function only recognizes error as object no matter what the middle ware is
// it will skip all middlewares and send the err to global error handling middleware

app.use(globalErrorHandler);

// 4. Server
module.exports = app;
//rest is reperestational state architecture
