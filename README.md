# PayPal Checkout - Advanced Integration
This repo demonstrates the advanced PayPal checkout using very simple HTML, JavaScript and NodeJS (or PHP instead of NodeJS).  You can start using this solution immediately, all you need is to replace the PayPal credentials and update the relative URLs.

There are four (4) parts to this implementation:
- An HTML frontend web page
- A NodeJS backend server and a PHP equivalent
- Backend JavaScript for the Shopping Cart and Paypal buttons
- A CSS Stylesheet for customising the display

In addition there are two images relating to Product/Item display
- one to represent/indicate 'delete a Product' from the shopping cart ![DeleteProduct](/public/Shoppingcart_delete.png)
- one to represent/indicate 'add a Product' to the shopping cart ![AddProduct](/public/payPalAddToCartButton.gif)

Kudos to Kyle kyle@webdevsimplified.com. His [video](https://www.youtube.com/watch?v=DNM9FdFrI1k) was priceless in making sense of the PayPal integration.  The official docs leave a lot to desire.
What I have done is simplify the implementation he gave and added a generic shopping cart manager.

# Question: why bother with your own PayPal integration?
The simple answer is: money, but one could also add freedom of design/expression. If you use a free service, chances are the author/provider gets a commission on each transaction, therefore the price that you pay is higher than if you went direct to PayPal. Alternatively, you could buy a 'pro' solution, but, not only are they pricey and subscription based, you sometimes have to live with constraints on how you can render products and the cart.  Well with trivial effort, you can have your own custom shopping cart as well as direct integration with the PayPal API.  The immediate benefit is that your commission is reduced to about 1.5% rather than 4%, and you have unlimited freedom on customisations of your pages.

# How it works
When you click the "Add to Cart" button or image, the shoppingCartManager.js script is invoked. That script checks to see if the shopping cart exists or not.  If it does not exist, it creates a new shopping cart, and the product is added as an object with the following attributes/details: name, price, quantity, description, relative url, base shipping, shipping. The script saves the shopping cart, ensuring that you can still see it across logouts/logins. The user is asked if they wish to view the cart, and if so, they are redirected to the shopping cart page. The shopping cart page is rendered using the contents of the checkoutPage.ejs file, which references the payPalButtons.js and shoppingCartManager.js scripts.  When the user clicks the PayPal payment button, the logic in payPalButtons.js is used to get a summary of the shopping cart and send it to the backend (NodeJS or PHP).  The backend reformats the details, sends it to PayPal and returns the response to the frontend/checkout-page and resets to shopping cart.

# The Components
## Frontend
### JavaScript and CSS Stylesheets
These are found in the /public folder, a README.md file provides descriptions.
### Shopping Cart Page
These are found in the /views folder, a README.md file provides descriptions.
## Backend
### System Configuration
The .env file contains environment variables; the contents are self explanatory. Replace the Client Id and Client Secret as appropriate and specify the right environment - production or sandbox.  Please ensure to also include the .gitIgnore file, to ensure that your credentials are not exported.  The PayPal server proxy scripts (Node or PHP) depend on this .env file for the correct credentials to connect to PayPal.
### NodeJS server
The serverPPC.js file is a NodeJS script.  You will need to install NodeJS to use it, or you can use the PHP alternative, which is mentioned next. Refer to Kyle's video or the PayPal docs for instructions for installing NodeJS. The serverPPC.js is a proxy; it takes the data sent from the frontend (checkout page), reformats it, calls the PayPal APIs to effect payment, and returns the response to the frontend. You will notice that a subset of the product catalogue is also defined in this file.  You will need to keep this in sync with the shopping cart manager in the /public folder.  More advanced JavaScript users can eliminate this redundancy by using exports. Lines 39, 40 and 54-57 capture shipping details, feel free to remove them if not needed or replace them with tax details.  If you change shipping details here, remember to sync this with lines 179-180 in shoppingCartManager.js in the /public folder. 
### PHP server
The create_order.php file is a PHP equivalent of serverPPC.js, for those using WordPress on a public hosted environment. CREDITS: I used some input from ChatGPT for the first attempt at conversion from NodeJS to PHP. Please check properly to ensure this works well for your PHP environment.

# What's Next?
I am thinking of creating a plugin that can be used on websites, to further save folks time and money.  This thing has taken me a few days (cumulative) to implement and document. Now that I understand what needs to be done, it should have taken less than an hour to get it working. This repo is a template that should cut that time even further.  However, for those who find even this a hassle, the plugin might be expedient, hopefully simplifying this to a 5-minute point-and-click setup.  Watch this space.
