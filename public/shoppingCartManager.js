
//document.addEventListener("DOMContentLoaded", () => { renderCart('shoppingCartDiv'); });
try {
  document.addEventListener("DOMContentLoaded", function(e) { 
    renderCart('shoppingCartDiv');
    if (document.getElementById('shoppingCartDiv') != null) { 
      document.querySelector("#shoppingCartDiv").onchange=checkB4Update;
    }
  }, false);
} catch (e) { ; }

// Thank you page
const thankYouPage = "/thanks-for-the-order/";

// Shopping Cart page
const shoppingCartPage = "/shopping-cart/";

// Products catalogue - also called items or cart-items
const almondFlakes350g = {id:11001, name:"ajahFlakes350g", price:3.99, quantity:1, ship:0.11, base:2.00, desc:"Almond Flakes 350mg Sachet", relUrl:"/almond-prods"};
const anchoviesMash40ml = {id:11002, name:"anchoviesMash40ml", price:1.99, quantity:1, ship:0.11, base:2.00, desc:"Anchovies Mash 40ml Jar", relUrl:"/anchovy-prods"};
const peanutRoast200g = {id:11003, name:"peanutRoast200g", price:5.99, quantity:1, ship:0.31, base:2.00, desc:"Peanut Roast 190ml Jar", relUrl:"/peanut-prods"};
const chilliOil40ml = {id:11004, name:"chilliOil40ml", price:2.99, quantity:1, ship:0.11, base:2.00, desc:"Chilli Oil 40ml Jar", relUrl:"/chilli-prods"};

// Create a new shopping cart
function ShoppingCart() {
  // Initialize the cart
  this.name = "SessionShoppingCart";
  this.items = {};
  this.subTotalPrice = 0;
  this.totalPrice = 0;
  this.baseShipping = 0;
  this.totalShipping = 0;
  this.addItem = addItemToCart;
  this.removeItem = removeItemFromCart;
  this.removeProduct = removeProductFromCart;
  this.save = saveCart;
  this.load = loadCart;
  this.recalcPrices = recalcCartPrices;
  this.defaultTarget = "shoppingCartDiv";
}

// Add an item to the cart
function addItemToCart(item) {
  // Add the item to the cart
  if (item.name in this.items) {
    this.items[item.name].quantity += 1;
    if (item.base > this.baseShipping) { this.baseShipping = item.base; }
  } else {
    this.items[item.name] = item;
  }
  // Update the total price, shipping and other details
  this.recalcPrices();
  renderCart();
};
// Proxy add item
function addItemToCartProxy(item) { myCart=getCart(); myCart.addItem(item); }

// Remove an item from the cart
function removeItemFromCart(item) {
  // Reduce the quantity of the item in the cart
  // OR remove the item from the cart
  if ((item.name in this.items) && (this.items[item.name].quantity >= 2)) {
    this.items[item.name].quantity -= 1;
  } else {
    delete this.items[item.name];
  }
  // Update the total price, shipping and other details
  this.recalcPrices();
  renderCart();
};
// Proxy remove item
function removeItemFromCartProxy(item) { myCart=getCart(); myCart.removeItem(item); }

// Remove all items of a product from the cart
function removeProductFromCart(item) {
  // Remove the item from the cart
  delete this.items[item];
  // Update the total price, shipping and other details
  this.recalcPrices();
  renderCart();
};
// Proxy remove all items (Product)
function removeProductFromCartProxy(item) { myCart=getCart(); myCart.removeProduct(item); }

// Recalculate Product, Shipping and Total prices in cart
function recalcCartPrices() {
  var tP = 0;
  var tS = 0;
  this.baseShipping = 0;
  this.totalShipping = 0;
  this.totalPrice = 0;

  for (const obj in this.items) {
    const cartItem = this.items[obj]
    tP += (cartItem.price * cartItem.quantity);
    tS += (cartItem.ship * cartItem.quantity);
    this.baseShipping = (cartItem.base > this.baseShipping ? cartItem.base : this.baseShipping);
  }
  // Update the price/shipping
  this.subTotalPrice = tP;
  this.subTotalPrice.toFixed(2);
  this.totalShipping = tS + this.baseShipping;
  this.totalPrice = tP + this.totalShipping;
  this.totalPrice.toFixed(2);
  this.save();
};

// Update quantity of a Product (count of items) in cart
function updateQuantity(item, qty) {
  var myCart = new ShoppingCart();
  myCart.load();
  const cartItem = myCart.items[item];
  cartItem.quantity = qty;
  myCart.recalcPrices();
  renderCart();
};

// Validate the quantity input field and then update the cart
function checkB4Update(event) {
  const elementName = event.target.name;
  const elementValue = event.target.value;
  if(elementValue > 7 || elementValue < 0){
    alert("The number of items must be between 1 - 7");
    event.target.value = 0;
  }
  elementName.replace("_quantity", ""); // remove the '_quantity' appendage in the name
  updateQuantity(elementName, elementValue);
};

// Save the cart to session cookies
function saveCart() {
  // Serialize the cart
  var serializedCart = JSON.stringify(this);
  // Save the cart to session cookies
  localStorage.setItem('shoppingCart', serializedCart);
};

// Load the cart from session cookies
function loadCart() {
  // Load the cart from session cookies
  var serializedCart = localStorage.getItem('shoppingCart');
  // Deserialize the cart
  var deserializedCart = JSON.parse(serializedCart);
  // Update the cart
  this.items = deserializedCart.items;
  this.subTotalPrice = deserializedCart.subTotalPrice;
  this.totalPrice = deserializedCart.totalPrice;
  this.baseShipping = deserializedCart.baseShipping;
  this.totalShipping = deserializedCart.totalShipping;
};

// Check cart and initialise if necessary
function getCart() {
  const myCart = new ShoppingCart();
  try { myCart.load(); } catch(e) { ; }
  myCart.save();
  return myCart;
}

// Empty the shopping cart
function emptyCart() {
  var myCart = new ShoppingCart();
  myCart.save();
  renderCart();
}

// Create summary of Shopping Cart items
function getCartSummary() {
  const myCart = getCart();
  const cartPre = '{ "items": [';
  var cartItems =  cartPre;

  for (const item in myCart.items) {
    const cartItem = myCart.items[item];
    cartItems += cartItems == cartPre ? "" : ",";
    cartItems += ' { "id": ' + cartItem.id + ', "quantity": ' + cartItem.quantity + ' } ';
  }

  cartItems += ' ], ';
  cartItems += ' "shipping": ' + myCart.totalShipping.toFixed(2) + ' }';
  return cartItems;

}

// Redirect to Shopping Cart page, if user asks to
function gotoCartOrStay() {
  if (confirm("Item added to cart, would you like to view the shopping cart now?")) {
    window.location.href = shoppingCartPage;
  }

}

// Redirect to a thank you page
function sayThankYou() {
  window.location.href = thankYouPage;
}

// Render cart item in a row
function renderCartItem(cartItem) {
  const baseUrl = "https://your-website-url/";
  const dustbinImage = "/relative-path-to-public-folder/Shoppingcart_delete.png";
  const cartRowHTML =
  "<tr class='cart_row'>" +
      "<td style='overflow: hidden;'>" +
        "<div><span><a href='" + baseUrl + cartItem.relUrl + "' target='_blank'>'" + cartItem.desc + "'</a></span></div>" +
      "</td>" +
      "<td style='text-align: center'>" +
        "<form method='post' action='' name='paypal_prep_form' style='display: inline'>" +
          "<input type='number' id='" + cartItem.name + "_quantity' name='" + cartItem.name + "' value='" + cartItem.quantity + "' min='0' step='1' size='3'>" +
          "<input type='hidden' id='" + cartItem.name + "_item_id' name='" + cartItem.name + "' value='" + cartItem.id + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_name' name='" + cartItem.name + "' value='" + cartItem.name + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_price' name='" + cartItem.name + "' value='" + cartItem.price + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_ship' name='" + cartItem.name + "' value='" + cartItem.ship + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_base' name='" + cartItem.name + "' value='" + cartItem.base + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_desc' name='" + cartItem.name + "' value='" + cartItem.desc + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_relUrl' name='" + cartItem.name + "' value='" + cartItem.relUrl + "' />" +
          "<input type='hidden' id='" + cartItem.name + "_item_quantity' name='" + cartItem.name + "' value='" + cartItem.quantity + "' />" +
        "</form>" +
      "</td>" +
      "<td style='text-align: center'>" + cartItem.price + "</td>" +
      "<td class='wspsc_remove_item_td'>" +
        "<form method='post' action='' class='wp_cart_remove_item_form'>" +
          "<input type='image' src='" + dustbinImage + "' value='Remove' title='Remove' onClick='removeProductFromCartProxy(&apos;" + cartItem.name + "&apos;)'></form>" +
      "</td>" +
    "</tr>";
  return cartRowHTML;
}

// Render shopping cart
function renderCart(tgt) {
  const myCart = getCart();
  const target = ((tgt == null) || (tgt == "")) ? myCart.defaultTarget : tgt;
  const targetElement = document.getElementById(target);
  var cartItemHTML = "";
  var cartItemsHTML = "";
  myCart.recalcPrices();

  for (const item in myCart.items) {
    const cartItem = myCart.items[item];
    cartItemHTML = renderCartItem(cartItem);
    cartItemsHTML += cartItemHTML;
  }

  const myCartHTML =
    "<table style='width: 100%;'>" +
      "<tbody>" +
        "<tr class='cart_row'><th>Item Name</th><th>Quantity</th><th>Price</th><th></th></tr>" +
        "<div id='cartItemsDiv'>" +
        cartItemsHTML +
        "</div>" +
        "<tr class='cart_row'>" +
          "<td colspan='2' style='font-weight: bold; text-align: right;'>Subtotal: </td>" +
          "<td style='text-align: center'>" + myCart.subTotalPrice.toFixed(2) + "</td>" +
          "<td></td>" +
        "</tr>" +
        "<tr class='cart_row'>" +
          "<td colspan='2' style='font-weight: bold; text-align: right;'>Shipping: </td>" +
          "<td style='text-align: center'>" + myCart.totalShipping.toFixed(2) + "</td>" +
          "<td></td>" +
        "</tr>" +
        "<tr class='cart_row'>" +
          "<td colspan='2' style='font-weight: bold; text-align: right;'>Total: </td>" +
          "<td style='text-align: center' id='shoppingCartTotal'>" + myCart.totalPrice.toFixed(2) + "</td>" +
          "<td></td>" +
        "</tr>" +
        "<tr>" +
          "<td colspan='4'>By paying with your card, you acknowledge that your data will be processed by PayPal subject to the PayPal Privacy Statement available at PayPal.com.</td>" +
        "</tr>" +
      "</tbody>" +
    "</table>";

  if (targetElement != null) { targetElement.innerHTML = myCartHTML; }
}
