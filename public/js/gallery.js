const fs = require('fs'),
  path = require('path'),
  sharp = require('sharp'),
  ejs = require('ejs'),
  { exec } = require('child_process');

function checkGalleryPictures(jsonPath, dimensions) {
  // get config file;
  var galleryConf = fs.readFileSync(jsonPath);

  // parse JSON text into JSON Object;
  var JSONGallery = JSON.parse(galleryConf);

  // gallery path;
  var galleryPath = JSONGallery.gallery_path;

  // processed pictures;
  let pictures = [];

  // iterate over all pictures into JSON Object;
  for (let picture of JSONGallery.pictures) {
    // full path of current picture;
    let normalPicture = path.join(galleryPath, picture.path);

    // file extension;
    let extension = path.extname(picture.path);

    // file basename;
    let basename = path.basename(picture.path, extension);

    // new picture with new dimension (for small & medium screen);
    let smallPicture = path.join(galleryPath + "/small/", basename + "-small" + ".webp");
    let mediumPicture = path.join(galleryPath + "/medium/", basename + "-medium" + ".webp");

    // push paths into pictures array;
    pictures.push({
      normal: normalPicture,
      medium: mediumPicture,
      small: smallPicture,
      description: picture.description,
      category: picture.category
    });

    [
      {
        path: smallPicture,
        dimension: dimensions.small
      },
      {
        path: mediumPicture,
        dimension: dimensions.medium
      }
    ].forEach(objective => {
      // if small/medium picture does not exist
      if (!fs.existsSync(`.${objective.path}`))

        // create new one, with new dimensions;
        sharp(`.${normalPicture}`).resize(objective.dimension).toFile(`.${objective.path}`, err => {
          if (err) // print error;
            console.log("conversion error", `.${normalPicture}`, "->", `.${objective.path}`, err);
        });
    });
  }

  // return pictures array;
  return pictures;
}

function filterGalleryPictures(pictures, category, maxCount) {
  let required_pictures = [];
  let count = 0;

  for (let i = 0; i < pictures.length; i++) {
    if (pictures[i].category === category) {
      required_pictures.push(pictures[i]);
      count++;
    }

    if (count == maxCount) {
      break;
    }
  }

  return required_pictures;
}

function getGallery(jsonPath, categories, maxCount, dimensions) {
  let dateOb = new Date();
  let category = categories[dateOb.getHours() % categories.length];

  return filterGalleryPictures(
    checkGalleryPictures(
      jsonPath,
      dimensions
    ), category, maxCount);
}

function recompileGalleryCSS(gallerySCSS, tempDir, sass, css) {
  let SCSS = fs.readFileSync(gallerySCSS).toString('utf-8');

  let picturesCount = 6 + (Math.floor(Math.random() * 4) * 2);
  let newSCSS = ejs.render(SCSS, { count: picturesCount });

  let renderedSCSSPath = `${tempDir}/${path.basename(gallerySCSS)}`;

  fs.writeFileSync(renderedSCSSPath, newSCSS);

  exec(`${sass} ${renderedSCSSPath} ${css}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return false;
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return false;
    }
  });

  return true;
}

module.exports = {
  checkGalleryPictures,
  filterGalleryPictures,
  getGallery,
  recompileGalleryCSS
};
