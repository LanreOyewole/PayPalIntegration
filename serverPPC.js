require("dotenv").config()

const express = require("express")
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())

const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)

const storeItems = new Map([
  [11001, { desc:"Almond Flakes 350g Sachet", price:3.99 }],
  [11002, { desc:"Anchovies Mash 40ml Jar", price:1.99 }],
  [11003, { desc:"Peanut Roast 200g Sachet", price:5.99 }],
  [11004, { desc:"Chilli Oil 40ml Jar", price:2.99 }],
])

app.get("/", (req, res) => {
  res.render("checkoutPage", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  })
})

app.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest()
  var total = req.body.items.reduce((sum, item) => {
    return sum + storeItems.get(item.id).price * item.quantity
  }, 0)
  const shipping_total = req.body.shipping;
  grand_total = total + shipping_total;
  request.prefer("return=representation")
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "GBP",
          value: grand_total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "GBP",
              value: total.toFixed(2),
            },
            shipping: {
              currency_code: "GBP",
              value: shipping_total.toFixed(2),
            },
          },
        },
        items: req.body.items.map(item => {
          const storeItem = storeItems.get(item.id)
          return {
            name: storeItem.desc,
            unit_amount: {
              currency_code: "GBP",
              value: storeItem.price.toFixed(2),
            },
	      quantity: item.quantity,
          }
        }),
      },
    ],
  })

  try {
    const order = await paypalClient.execute(request)
    res.json({ id: order.result.id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(8890)
