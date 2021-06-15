function getCheckFilterByClass(class_name) {
  const inputs = Array.from(document.getElementsByClassName(class_name));
  return inputs.filter(input => input.checked).map(checkedInput => checkedInput.defaultValue);
}

function getCheckFilters(filter) {
  switch (filter) {
    case 'brand':
      return getCheckFilterByClass('brand-filter-input');
    case 'returnable':
      return getCheckFilterByClass('returnable-filter-input');
  }
}

function getPriceFilter() {
  const priceRange = document.getElementById('price-filter-selector').value;
  return priceRange.trim().split(' ');
}

document.getElementById('apply-filters-button').addEventListener('click', ev => {
  const products = Array.from(document.getElementsByClassName('product'));

  const requiredBrands = getCheckFilters('brand');
  const requiredReturnPolicy = getCheckFilters('returnable');
  const requiredPrices = getPriceFilter();

  for (product of products) {
    let productBrand = product.getElementsByClassName('brand-value')[0].innerText.trim().toLowerCase();
    let productReturnPolicy = product.getElementsByClassName('returnable-value')[0].innerText.trim().toLowerCase();
    let productPrice = parseInt(product.getElementsByClassName('price-value')[0].innerText.trim());

    let condition1 = requiredBrands.includes('all') || requiredBrands.includes(productBrand);
    let condition2 = requiredReturnPolicy.includes('all') || requiredReturnPolicy.includes(productReturnPolicy);
    let condition3 = requiredPrices[0] < productPrice && productPrice < requiredPrices[1];

    let result = condition1 && condition2 && condition3;

    product.style.display = result ? 'block' : 'none';
  }
});

document.getElementById('reset-filters-button').addEventListener('click', ev => {
  // reset brand filter;
  Array.from(document.getElementsByClassName('brand-filter-input')).forEach(input => input.checked = false);
  document.getElementById('default-brand-filter-input').checked = true;

  // reset returnable filter;
  document.getElementById('default-returnable-filter-input').checked = true;

  // reset price filter;
  Array.from(document.getElementsByClassName('price-filter-selector')).forEach(input => input.selected = false);
  document.getElementById('default-price-filter-selector').selected = true;
});

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
