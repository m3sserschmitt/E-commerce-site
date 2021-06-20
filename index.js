const express = require('express'),
  { Client } = require('pg'),
  { getGallery } = require('./public/js/gallery'),
  { page403, compileAnimatedGallery } = require('./public/js/public');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'techaltar',
  password: 'techaltar',
  database: 'techaltar'
});
client.connect();

const app = express();

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
    )
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
      })
  });
});

// app.get('*/animated_gallery', (req, res) => {
//   res.render('pages')
// });

// app.get('*/animated-gallery.css', (req, res) => {

// });

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
                maxPrice: maxPrice.rows[0].max
              });
            }
          });
        }
      });
    }
  });
});

/*
  app.get('/products', (req, res) => {
  let productCategory = req.query.category;
  let searchQuery = req.query.query;

  const productsDetails = 'product_id, product_name, price, product_image, category, brand, release_date, returnable, chipset';
  const DBQuery = `select ${productsDetails} from product where 1=1`;

  if(productCategory) {
    DBQuery += ` and category = ${productCategory}`;
  }

  if(searchQuery) {
    let searchQueryTokens = searchQuery.split(',')
    .map(token => token.trim().toLowerCase())
    .filter(token => token.length);

    for(let queryToken of searchQuery) {
      DBQuery += ''
    }
  }
    // `select ${productsDetails} from product where category = '${productCategory}';`;

  client.query(DBQuery, (err, products) => {
    if (!err) {
      client.query('SELECT unnest(enum_range(NULL::product_brand));', (err, brands) => {
        if (!err) {
          client.query('select max(price) from product;', (err, maxPrice) => {
            if (!err) {
              res.render('pages/store', {
                products: products.rows,
                brands: brands.rows.map(brand => brand.unnest),
                maxPrice: maxPrice.rows[0].max
              });
            }
          });
        }
      });
    }
  });
});
*/
app.get('/product', (req, res) => {
  let product_id = req.query.id;

  const productDetails = '*';
  const DBQuery = `select ${productDetails} from product where product_id=${product_id};`;

  client.query(DBQuery, (err, result) => {
    if (!err) {
      res.render('pages/product', { product: result.rows[0] });
    }
  });
});

app.get('/*', (req, res) => {
  const requestedPage = 'pages' + req.url;

  res.render(requestedPage, (err, html) => {
    if (err) {
      res.status(404).render('pages/404');
    } else {
      res.send(html);
    }
  });
});

app.listen(8080);
console.log('[+] App started successfully.');
