# shop-search
WAW JS 2018 - Search in E-shops (bonus)

## Install
```bash
npm install
```

# Function: getOffer
Fetch products from selected eshop.

## Example
```js
const shopSearch = require("./index.js")

shopSearch.getOffer({
    serp_url: 'https://www.okay.sk/hladanie/?query=',
    item: '.crossroad-products-big li .inner',
    name: '.title a',
    price: '.price .highlight span',
    url: '.title a'
}, 'iphone 7', (error, data) => {
    console.log(data)
})
```

## Syntax:
Simple usage:
```js
shopSearch.getOffers({
    // serp_url + query
    serp_url: 'http://example.com?query=',
    // Find all relevant elements on page
    item: '.crossroad-products-big li .inner',
    // Get text from element
    name: '.title a',
    // Get text from element, format using shopSearch.parsePrice
    price: '.price .highlight span',
    // Get href="#" attribute from element
    url: '.title a'
}, query, callback)
```

Advanced usage:
```js
shopSearch.getOffers({
    // Search engine result page URL
    serp_url: (query) => {
        return 'http://example.com?query='+query
    },
    // Call processItem for each product,
    // $ -> cheerio, contains whole page
    item: ($, processItem) => {
        $('.lst-item').each((i, elem) => {
            return processItem(i, elem)
        })
    },
    // Get name, elem is that one from processItem
    name: (elem) => {
        return elem.find('.product-name').text().trim()
    },
    // Get price, elem is that one from processItem
    price: (elem) => {
        let price_text = elem.find('.product-price').text().trim()
        return parseInt(price_text)
    },
    // Get url, elem is that one from processItem
    url: (elem) => {
        let rel_url = elem.find('.product-url').attr('href')
        return 'http://example.com'+rel_url
    }
}, query, callback)
```

### Parameters
*eshop_rules* - Defined eshop rules.
*query* - Product name.
*callback* - Function that returns products.

## Return value
A new array with product being the result of the callback function.
```js
{
    {
        name: 'Apple iPhone 7 32GB, rose gold',
        price: 539,
        url: 'https://www.okay.sk/apple-iphone-7-23-gb-mn912cn-a-ruzova-zlata/'
    },
    // ...
}
```

# Function: getOffers
Fetch products from selected eshops.

## Example
```js
const shopSearch = require("./index.js")

shopSearch.getOffers({
    mall: {
        serp_url: (query) => 'https://www.mall.sk/hladaj?s='+query,
        item: ($, cb) => $('.lst-item').each(cb),
        name: (elem) => elem.find('.lst-product-item-title a').text().trim(),
        price: (elem) => parsePrice(elem.find('.lst-product-item-price-value').text()),
        url: (elem) => 'https://www.mall.sk'+elem.find('.lst-product-item-title a').attr('href')
    },
    okay: {
        serp_url: 'https://www.okay.sk/hladanie/?query=',
        item: '.crossroad-products-big li .inner',
        name: '.title a',
        price: '.price .highlight span',
        url: '.title a'
    }
}, 'iphone 7', (error, data) => {
    console.log(data)
})
```

## Syntax:
```js
shopSearch.getOffers({
    shop1: /*eshop_rules*/,
    shop2: /*eshop_rules*/,
    // ...
}, query, callback)
```

### Parameters
*eshop_rules* - Defined object / array of eshop_rules.
*query* - Product name.
*callback* - Function that returns products.

## Return value
A new array with each shop with products being the result of the callback function.
```js
{
    shop1: [
        {
            name: 'Apple iPhone 7 32GB, rose gold',
            price: 539,
            url: 'https://www.okay.sk/apple-iphone-7-23-gb-mn912cn-a-ruzova-zlata/'
        },
        // ...
    ]
    shop2: [ /* ... products ... */ ],
    // ...
}
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
   - **false** - get cheapest products. (*default*)
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

# Function: parsePrice
Parse only price as number from text, where `,` is decimal comma.

```js
const shopSearch = require("./index.js")

console.log(shopSearch.parsePrice('Price: 37,52 €'))
// (float) 37.52
```
