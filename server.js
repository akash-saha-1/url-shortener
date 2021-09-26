const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ShortUrl = require('./models/shortUrl');
require('dotenv').config();
const app = express();

//logging each request in server
app.use(morgan('tiny'));

// view engine setup
app.set('view engine', 'ejs');

// getting response body
app.use(express.urlencoded({ extended: false }));

//home page route configuration
app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render('index', { shortUrls: shortUrls });
});

// request to save short url
app.post('/shortUrls', async (req, res) => {
  let url = await ShortUrl.findOne({ fullUrl: req.body.fullUrl });
  if (url) {
    try {
      url.shortened++;
      await url.save();
    } catch (err) {
      console.error(err);
    }
  } else {
    await ShortUrl.create({ fullUrl: req.body.fullUrl });
  }
  res.redirect('/');
});

// request of getting short url and redirecting it to full url
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ shortUrl: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  await shortUrl.save();

  res.redirect(shortUrl.fullUrl);
});

//database connection intialization
mongoose.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.j04jo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error('Error occured while db connection due to ' + err);
      return false;
    }
    console.log(`server started at port ${process.env.PORT}`);
  }
);

app.listen(process.env.PORT);
