const cookieParser = require('cookie-parser');
const
  { Client } = require('pg'),
  { getGallery } = require('./public/js/gallery'),
  { page403, compileAnimatedGallery } = require('./public/js/public'),

  express = require('express'),
  // bodyParser = require('body-parser'),
  formidable = require('formidable'),
  crypto = require('crypto'),
  flash = require('connect-flash'),
  expressSession = require('express-session');


// generate random bytes for session key;
const SESSION_PASSPHRASE = crypto.randomBytes(32).toString();

// listen port;
let LISTEN_PORT = process.env.PORT ? process.env.PORT : 8000;

// database URI;
let DATABASE_URI = process.env.DATABASE_URI ?
  process.env.DATABASE_URI : 'postgres://techaltar:techaltar@localhost:5432/techaltar';

const app = express();

// app setup;
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(expressSession({
  secret: SESSION_PASSPHRASE,
  resave: true,
  saveUninitialized: false
}));
app.use(flash());
app.use((req, res, next) => {

  res.locals.user = req.session.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');

  next()
});
app.set('view engine', 'ejs');

app.use('/public/json', page403);
app.use('/public/stylesheets', compileAnimatedGallery);
app.use('/public', express.static(__dirname + '/public'));

// create database client;
const client = new Client({
  connectionString: DATABASE_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

// connect to database, then get product categories;
client.connect().then(() => {
  client.query('SELECT unnest(enum_range(NULL::product_category));', (err, categories) => {
    if (!err) {
      app.locals.productCategories = categories.rows.map(category => category.unnest);
    } else {
      console.log('[-] Warning: Cannot fetch categories from database.');
      console.log(err);
    }
  });
});


app.get(['/', '/index'], (req, res) => {

  res.render('pages/index', {
    clientIp: req.ip,
    galleryPictures: getGallery(
      'public/json/gallery.json',
      ['apple', 'samsung'],
      13,
      {
        small: 500,
        medium: 550
      }
    ),
    user: req.session.user
  });
});

app.get(['/static_gallery', '/animated_gallery'], (req, res) => {
  res.render(`pages${req.url}`, {
    galleryPictures: getGallery(
      'public/json/gallery.json',
      ['apple', 'samsung'],
      13,
      {
        small: 500,
        medium: 550
      }),
    user: req.session.user
  });
});

app.get('/store', (req, res) => {

  let productCategory = req.query.category;

  const productsDetails = 'product_id, product_name, price, product_image, category, brand, release_date, returnable, chipset';
  const DBQuery = !productCategory ? `select ${productsDetails} from product;` :
    `select ${productsDetails} from product where category = '${productCategory}';`;

  client.query(DBQuery, (err, products) => {
    if (!err) {
      client.query('SELECT unnest(enum_range(NULL::product_brand));', (err, brands) => {
        if (!err) {
          client.query('select max(price) from product;', (err, maxPrice) => {
            if (!err) {
              res.render('pages/store', {
                products: products.rows,
                brands: brands.rows.map(brand => brand.unnest),
                maxPrice: maxPrice.rows[0].max,
                user: req.session.user
              });
            }
          });
        }
      });
    }
  });
});

app.get('/product', (req, res) => {
  let product_id = req.query.id;

  const productDetails = '*';
  const DBQuery = `select ${productDetails} from product where product_id=${product_id};`;

  client.query(DBQuery, (err, result) => {
    if (!err) {
      res.render('pages/product', { product: result.rows[0], user: req.session.user });
    }
  });
});

app.post('/register', (req, res) => {
  let form = formidable.IncomingForm();
  let error = "";

  // parse incoming form;
  form.parse(req, (parseError, textFields, files) => {

    // check data;
    for (let field of ['firstName', 'lastName', 'username', 'password']) {
      if (textFields[field] === "" || !textFields[field].length) {
        error = "Wrong " + field + "\n";
      }
    }

    if (!error) {
      // calculate hash for user password;
      let hashedPassword = crypto.createHash('sha512').update(textFields.password).digest('hex');

      // query to be executed;
      let dbInsertCommand = `INSERT INTO users(username, first_name, last_name, email, passwd)
      values (
        '${textFields.username}', 
        '${textFields.firstName}', 
        '${textFields.lastName}', 
        '${textFields.email}',
        '${hashedPassword}'
      ) returning id, profile_picture;`; // also return client id;

      // try to insert data into database
      client.query(dbInsertCommand, (queryError, queryResult) => {
        if (queryError) { // inform user in case of errors;
          error += queryError.detail;

          req.flash('error', `Some errors occurred during registration process: ${error}.`)
          res.redirect('/register');

        } else {
          // setup user session;
          req.session.user = {
            id: queryResult.rows[0].id,
            username: textFields.username,
            firstName: textFields.firstName,
            lastName: textFields.lastName,
            profilePicture: queryResult.rows[0].profile_picture
          };

          // inform user of successful registration;
          req.flash('success', `Welcome ${textFields.username}! You have been successfully registered on TechAltar!`);

          //redirect;
          res.redirect('/index');
        }
      });
    } else {
      req.flash('error', `Some errors occurred during registration process: ${error}.`)
      res.redirect('/register');
    }
  });
});

app.post('/login', (req, res) => {
  let form = formidable.IncomingForm();

  form.parse(req, (parseError, textFields) => {

    //compute hash for user password;
    let hashedPassword = crypto.createHash('sha512').update(textFields.password).digest('hex');
    let dbQuery = `select id, username, first_name, last_name, profile_picture
    from users 
    where username='${textFields.username}' and passwd='${hashedPassword}'`;

    // try to find user into database;
    client.query(dbQuery, (queryError, queryResult) => {
      if (queryError || queryResult.rows.length != 1) {
        // if user not found or database error, show error message;
        req.flash('error', 'Login failed. Checkout your credentials and try again.');
        res.redirect('/index');
      }
      else {
        // if user found, setup session;
        let userData = queryResult.rows[0];

        req.session.user = {
          id: userData.id,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.lastName,
          profilePicture: userData.profile_picture
        };

        // show success message and redirect;
        req.flash('success', `Welcome back, ${textFields.username}!`);
        res.redirect('/index');
      }
    });
  });
});

app.get('/logout', (req, res) => {
  // destroy user session;
  req.session.destroy();

  res.redirect('/index');
});

app.get('/*', (req, res) => {
  const requestedPage = 'pages' + req.url;

  res.render(requestedPage, { user: req.session.user }, (err, html) => {
    if (err) {
      res.status(404).render('pages/404', { user: req.session.user });
    } else {
      res.send(html);
    }
  });
});

app.listen(LISTEN_PORT);
console.log(`[+] App started on port ${LISTEN_PORT}.`);

// heroku ps:scale web=1 -> turn on
// heroku ps:scale web=0 -> turn off
// https://boiling-headland-87620.herokuapp.com