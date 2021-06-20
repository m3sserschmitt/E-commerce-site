let cart = { ...JSON.parse(localStorage.getItem('cart')) };

for (let item in cart) {
  let product = document.getElementById(`article_${ item }`);

  if (!product) {
    continue;
  }

  let addButton = product.getElementsByClassName('add-cart-button')[0];
  let addFlag = product.getElementsByClassName('added-to-cart-flag')[0];

  addButton.classList.add('added-to-cart-button');
  addButton.textContent = 'Remove item';
  addFlag.style.display = 'block';
}

// 'add to cart' functionality;
Array.from(document.getElementsByClassName('add-cart-button')).forEach(button => {
  button.addEventListener('click', ev => {
    let button = ev.target;
    let buttonContainer = ev.target.parentElement;
    let addedFlag = buttonContainer.getElementsByClassName('added-to-cart-flag')[0];
    let product = buttonContainer.parentElement;

    let product_id = button.value;
    let product_price = parseInt(product.getElementsByClassName('price-value')[0].innerText);

    let cart = { ...JSON.parse(localStorage.getItem('cart')) };

    if (!cart[product_id]) {
      cart[product_id] = { 
        price: product_price, 
        quantity: 1
      };

      button.classList.add('added-to-cart-button');
      button.textContent = 'Remove item';
      addedFlag.style.display = 'block';
    } else {
      delete cart[product_id];

      button.classList.remove('added-to-cart-button');
      button.textContent = 'Add to cart';
      addedFlag.style.display = 'none';
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    calculateCartTotal();
  });
});