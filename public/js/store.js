// filter switch functionality;
document.getElementById('filter-switch-button').addEventListener('click', ev => {
  var filtersSection = document.getElementById('filters-section');
  var searchBar = document.getElementById('search-bar');

  if (!filtersSection.style.height || ['0px', '0'].includes(filtersSection.style.height)) {
    filtersSection.style.height = 'auto';
  } else {
    filtersSection.style.height = '0px';
  }

  if (searchBar.style.display === 'none') {
    searchBar.style.display = 'flex';
  } else {
    searchBar.style.display = 'none';
  }

});

// return checkable filters by class
function getCheckFilterByClass(class_name) {
  const inputs = Array.from(document.getElementsByClassName(class_name));
  return inputs.filter(input => input.checked).map(checkedInput => checkedInput.defaultValue);
}

// filter = 'brand' => list of brands;
// filter = 'returnable' => 'all' or 'returnable' or 'non-returnable';
function getCheckFilters(filter) {
  switch (filter) {
    case 'brand':
      return getCheckFilterByClass('brand-filter-input');
    case 'returnable':
      return getCheckFilterByClass('returnable-filter-input');
  }
}

// return required prices;
function getPriceFilter() {
  return Array.from(document.querySelectorAll('#price-filter-selector option:checked')).map(input => 
    input.value.trim().split(' ')
  );
}

// return search keywords from searchbar;
function getSearchKeywords() {
  let searchBar = document.getElementById('search-bar-input');
  return searchBar.value.split(' ').filter(word => word.length).map(word => word.toLowerCase());
}

// check if product has required keywords
function checkKeywords(product, keywords) {
  if (!keywords.length) {
    return true;
  }

  let productName = product.getElementsByClassName('name-value')[0].innerText.trim().toLowerCase();
  let specs = product.getElementsByClassName('chipset-value')[0].innerText.trim().toLowerCase();

  for (let keyword of keywords) {
    let condition = (productName + ', ' + specs).includes(keyword.slice(1));

    if (((keyword[0] === '+') && !condition) || ((keyword[0] === '-') && condition)) {
      return false;
    }
  }

  return true;
}

// check if product is into correct price range;
function checkPriceRange(product, priceRanges) {
  let productPrice = parseInt(product.getElementsByClassName('price-value')[0].innerText.trim());

  for(let priceRange of priceRanges) {
    if(priceRange[0] <= productPrice && productPrice <= priceRange[1]) {
      return true;
    }
  }

  return false;
}

// search button functionality
document.getElementById('search-button').addEventListener('click', ev => {
  let keywords = getSearchKeywords();
  const products = Array.from(document.getElementsByClassName('product'));

  for (let product of products) {
    product.style.display = checkKeywords(product, keywords) ? 'block' : 'none';
  }
});

// apply-filters button;
document.getElementById('apply-filters-button').addEventListener('click', ev => {
  const products = Array.from(document.getElementsByClassName('product'));

  const requiredBrands = getCheckFilters('brand');
  const requiredReturnPolicy = getCheckFilters('returnable');
  const requiredPrices = getPriceFilter();
  const searchKeywords = getSearchKeywords();

  for (product of products) {
    let productBrand = product.getElementsByClassName('brand-value')[0].innerText.trim().toLowerCase();
    let productReturnPolicy = product.getElementsByClassName('returnable-value')[0].innerText.trim().toLowerCase();

    let condition1 = requiredBrands.includes('all') || requiredBrands.includes(productBrand);
    let condition2 = requiredReturnPolicy.includes('all') || requiredReturnPolicy.includes(productReturnPolicy);
    let condition3 = checkPriceRange(product, requiredPrices);
    let condition4 = checkKeywords(product, searchKeywords);

    let result = condition1 && condition2 && condition3 && condition4;

    product.style.display = result ? 'block' : 'none';
  }
});

// reset filters button;
document.getElementById('reset-filters-button').addEventListener('click', ev => {
  // reset brand filter;
  Array.from(document.getElementsByClassName('brand-filter-input')).forEach(input => input.checked = false);
  document.getElementById('default-brand-filter-input').checked = true;

  // reset returnable filter;
  document.getElementById('default-returnable-filter-input').checked = true;

  // reset price filter;
  Array.from(document.getElementsByClassName('price-filter-selector')).forEach(input => input.selected = false);
  document.getElementById('default-price-filter-selector').selected = true;

  //set all products to be visible;
  const products = Array.from(document.getElementsByClassName('product'));
  for (product of products) {
    product.style.display = 'block';
  }
});

// compare products by price and color;
function compare_products(product1, product2) {
  let price1 = parseInt(product1.getElementsByClassName('price-value')[0].innerText.trim());
  let price2 = parseInt(product2.getElementsByClassName('price-value')[0].innerText.trim());

  if (price1 === price2) {
    let color1 = product1.getElementsByClassName('color-value')[0].innerText.trim();
    let color2 = product2.getElementsByClassName('color-value')[0].innerText.trim();

    if (color1 < color2) {
      return -1;
    } else if (color1 === color2) {
      return 0;
    } else {
      return 1
    }
  }

  return price1 - price2;
}

// sort products using 'sort_function' as a sorting method;
function sort_products(sort_function) {
  let products = Array.from(document.getElementsByClassName('product'));
  products.sort(sort_function);

  let productGrid = document.getElementById('products-grid');

  products.forEach(product => productGrid.appendChild(product));
}

document.getElementById('ascending-price-button').addEventListener('click', ev => { sort_products(compare_products) });

document.getElementById('descending-price-button').addEventListener('click', ev => {
  sort_products((p, q) => -1 * compare_products(p, q));
});
