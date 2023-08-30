paypal
  .Buttons({
    createOrder: function () {
      var cartSummary = getCartSummary();
      cartSummary = JSON.stringify(JSON.parse(cartSummary));
      return fetch("/relative-path-to-nodejs-or-php-script/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
	      body: `${cartSummary}`, })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ id }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
    onApprove: function (data, actions) {
      emptyCart()
      sayThankYou();;
      return actions.order.capture()
    },
  })
  .render("#paypal-buttons")
