# shop-search
WAW JS 2018 - Search in E-shops (bonus)

## Install
```bash
npm install
```

# Function: getOffers
Fetch products from eshops.
 - https://okay.sk
 - https://alza.sk
 - https://mall.sk

## Example
```js
const shopSearch = require("./index.js")

shopSearch.getOffers('iphone 7', (error, data) => {
    console.log(data)
})
```

## Syntax:
```js
shopSearch.getOffers(query, callback)
```

### Parameters
*query* - Product name.
*callback* - Function that returns products.

## Return value
A new array with each shop with products being the result of the callback function.
```js
[
    okay: [
        {
            name: 'Apple iPhone 7 32GB, rose gold',
            price: 539,
            url: 'https://www.okay.sk/apple-iphone-7-23-gb-mn912cn-a-ruzova-zlata/'
        },
        // ...
    ]
    alza: [ /* ... products ... */ ],
    mall: [ /* ... products ... */ ]
]
```

# Function: sortProducts
Examine returned data and sort product from cheapest or most expensive.

## Example
```js
const shopSearch = require("./index.js")

shopSearch.getOffers('iphone 7', (error, data) => {
    let products = shopSearch.sortProducts(data)
    console.log(products)
})
```

## Syntax:
```js
shopSearch.sortProducts(offers, reverse)
```

### Parameters
 - *offers* - Offers returned from `getOffers` function.
 - *reverse* - Sort order.
   - **false** - get cheaapest products. (*default*)
   - **true** - get most expensive

## Return value
A new array with sorted products being the result of the callback function.
```js
[
    {
        shop: 'okay',
        name: 'Pouzdro Col Fr iPhone 7/8 red ROZBALENÉ',
        price: 9.8,
        url: 'https://www.okay.sk/pouzdro-col-fr-iphone-7-8-red-rozbalene/'
    },
    // ...
]
```
