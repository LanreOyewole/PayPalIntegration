<?php
require 'vendor/autoload.php'; // Include Composer autoloader

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$environment = strtolower(getenv('NODE_ENV')) === 'production'
    ? new ProductionEnvironment(getenv('PAYPAL_CLIENT_ID'), getenv('PAYPAL_CLIENT_SECRET'))
    : new SandboxEnvironment(getenv('PAYPAL_CLIENT_ID'), getenv('PAYPAL_CLIENT_SECRET'));

$paypalClient = new PayPalHttpClient($environment);

$storeItems = [
    11001 => ['price' => 3.99, 'desc' => 'Almond Flakes 350mg Sachet'],
    11002 => ['price' => 1.99, 'desc' => 'Anchovies Mash 40ml Jar'],
    11003 => ['price' => 5.99, 'desc' => 'Peanut Roast 200g Sachet'],
    11004 => ['price' => 2.99, 'desc' => 'Chilli Oil 40ml Jar'],
    // ... Add other items here ...
];

$data = json_decode(file_get_contents('php://input'), true);

$total = array_reduce($data['items'], function ($carry, $item) use ($storeItems) {
    return $carry + $storeItems[$item['id']]['price'] * $item['quantity'];
}, 0);

$shippingTotal = $data['shipping'];
$grandTotal = $total + $shippingTotal;

$request = new OrdersCreateRequest();
$request->prefer('return=representation');
$request->body = [
    'intent' => 'CAPTURE',
    'purchase_units' => [
        [
            'amount' => [
                'currency_code' => 'GBP',
                'value' => number_format($grandTotal, 2),
                'breakdown' => [
                    'item_total' => [
                        'currency_code' => 'GBP',
                        'value' => number_format($total, 2),
                    ],
                    'shipping' => [
                        'currency_code' => 'GBP',
                        'value' => number_format($shippingTotal, 2),
                    ],
                ],
            ],
            'items' => array_map(function ($item) use ($storeItems) {
                $storeItem = $storeItems[$item['id']];
                return [
                    'name' => $storeItem['desc'], // Changed 'name' to 'desc'
                    'unit_amount' => [
                        'currency_code' => 'GBP',
                        'value' => number_format($storeItem['price'], 2),
                    ],
                    'quantity' => $item['quantity'],
                ];
            }, $data['items']),
        ],
    ],
];

try {
    $order = $paypalClient->execute($request);
    echo json_encode(['id' => $order->result->id]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
