const express = require('express'),
  { Client, Pool } = require('pg'),
  // { Pool } = require('pg'),
  { getGallery } = require('./public/js/gallery'),
  { page403, compileAnimatedGallery } = require('./public/js/public'),
  formidable = require('formidable'),
  crypto = require('crypto'),
  flash = require('connect-flash'),
  expressSession = require('express-session');

const SESSION_PASSPHRASE = 'dkjasghfiujcxkahfuvhjfvsd';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// const client = new Client({
//   host: 'localhost',
//   port: 5432,
//   user: 'techaltar',
//   password: 'techaltar',
//   database: 'techaltar'
// });
// client.connect();

const client = await pool.connect();

const app = express();
app.use(expressSession({
  secret: SESSION_PASSPHRASE,
  resave: true,
  saveUninitialized: false
}));

// app.use(flash());

client.query('SELECT unnest(enum_range(NULL::product_category));', (err, categories) => {
  if (!err) {
    app.locals.productCategories = categories.rows.map(category => category.unnest);
  } else {
    console.log('[-] Warning: Cannot fetch categories from database.');
    console.log(err);
  }
});

app.set('view engine', 'ejs');

app.use('/public/json', page403);
app.use('/public/stylesheets', compileAnimatedGallery);
app.use('/public', express.static(__dirname + '/public'));

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
      // let encryptedPassword = crypto.scryptSync(textFields.password, SERVER_PASSWORD, 32).toString('ascii');

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
      );`;

      client.query(dbInsertCommand, (queryError, queryResult) => {
        if (queryError) {
          error += queryError.detail;

          // req.flash('notify', 'This is a test notification.');
          res.render('pages/register');
        } else {
          res.redirect('/index');
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  let form = formidable.IncomingForm();

  form.parse(req, (parseError, textFields) => {

    let hashedPassword = crypto.createHash('sha512').update(textFields.password).digest('hex');
    let dbQuery = `select id, username, first_name, last_name, profile_picture
    from users 
    where username='${textFields.username}' and passwd='${hashedPassword}'`;

    client.query(dbQuery, (queryError, queryResult) => {
      if (queryError || queryResult.rows.length != 1) {
        // error
      }
      else {
        let userData = queryResult.rows[0];

        req.session.user = {
          id: userData.id,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.lastName,
          profilePicture: userData.profile_picture
        };

        console.log(userData.profilePicture);

        res.redirect('/index');
      }
    });
  });
});

app.get('/logout', (req, res) => {
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

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);


// app.listen(8080);
console.log('[+] App started successfully.');
