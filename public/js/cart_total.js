function calculateCartTotal() {
  let cart = { ...JSON.parse(localStorage.getItem('cart')) };
  let total = 0;
  let count = 0;

  for(let item in cart) {
    count ++;
    total += cart[item].price * cart[item].quantity;
  }

  if(total) {
    document.getElementById('cart-menu-subsection')
    .innerHTML = `<li> Total: ${ total } <span style="color: var(--light-blue); font-weight: bold;">USD</span></li>`;
  } else {
    document.getElementById('cart-menu-subsection').innerHTML = `<li>Cart empty</li>`;
  }
  
  document.getElementById('cart-items-count').innerText = `${ count }`;
}

