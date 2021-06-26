const { recompileGalleryCSS } = require('./gallery'),
  path = require('path');

function page403(req, res, next) {
  return res.status(403).render('pages/403')
}

function compileAnimatedGallery(req, res, next) {
  if (req.url === '/animated-gallery.css') {
    if (!recompileGalleryCSS(
      'public/scss/animated-gallery.scss',
      'temp',
      'temp/sass',
      'temp/animated-gallery.css'
    )) {
      return res.status(500).end();
    }

    res.setHeader('Content-Type', 'text/css');

    return res.sendFile(path.join(__dirname, '../../temp/animated-gallery.css'));
  }

  next();
}

module.exports = {
  page403,
  compileAnimatedGallery
};
