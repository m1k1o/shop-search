const rewire = require('rewire')
const assert = require("assert")
const fs = require("fs")

const shops = require("./shops.object.js")
const expected_response = {
    okay: require("./responses/okay.js"),
    alza: require("./responses/alza.js"),
    mall: require("./responses/mall.js")
}


// Emulate HTTP requests
let shopSearch = rewire("../index.js")
let response404 = false
shopSearch.__set__("request", (url, cb) => response404
    ? cb(null, { statusCode: 404 }, null)
    : fs.readdir(`${__dirname}/responses`, (e, files) => {
        let file = files.find((file) => url.includes(
            file.replace(/\..*$/, '')))

        if(e || typeof file === 'undefined') {
            return cb(null, { statusCode: 404 }, null)
        }

        fs.readFile(`${__dirname}/responses/${file}`, (e, d) => 
            cb(null, { statusCode: e ? 404 : 200 }, d))
    })
)

describe("shopSearch: getOffer", function() {
    it("getOffer is working as expected", function(done) {
        let shop_name = Object.keys(expected_response)[0]
        shopSearch.getOffer(shops[shop_name], 'iphone 7', (e, d) => {
            assert.deepEqual(d, expected_response[shop_name])
            done(e)
        })
    })
})

describe("shopSearch: getOffers", function() {
    it("getOffers is working as expected with Object", function(done) {
        shopSearch.getOffers(shops, 'iphone 7', (e, d) => {
            assert.deepEqual(d, expected_response)
            done(e)
        })
    })
    
    it("getOffers is working as expected with Array too", function(done) {
        const shops_Array = Object.values(shops)
        const expected_response_Array = Object.values(expected_response)

        shopSearch.getOffers(shops_Array, 'iphone 7', (e, d) => {
            // Any order
            for (const i in expected_response_Array) {
                assert(d.indexOf(expected_response_Array[i]))
            }

            done(e)
        })
    })

    it("getOffers fails on 404", function(done) {
        response404 = true
        shopSearch.getOffers(shops, 'iphone 7', (e, d) => {
            response404 = false
            assert(e instanceof Error)
            done()
        })
    })
})
  
describe("shopSearch: sortProducts", function() {
    it("sortProducts gets cheapest product", function() {
        let expected = {
            shop: 'okay',
            name: 'Pouzdro Col Fr iPhone 7/8 red ROZBALENÉ',
            price: 9.8,
            url: 'https://www.okay.sk/pouzdro-col-fr-iphone-7-8-red-rozbalene/'
        }
        
        let offers = shopSearch.sortProducts(expected_response)
        assert.deepEqual(offers[0], expected)
    })
  
    it("reversed sortProducts gets most expensive product", function() {
        let expected = {
            "name": "Apple iPhone Xs Max, 512GB, Vesmírne šedý",
            "price": 1679,
            "shop": "mall",
            "url": "https://www.mall.sk/apple-iphone/apple-iphone-xs-max-512gb-vesmirne-sedy"
        }
        
        let offers = shopSearch.sortProducts(expected_response, true)
        assert.deepEqual(offers[0], expected)
    })

    it("sortProducts does not fail on junk data", function() {
        let offers = shopSearch.sortProducts(undefined, true)
        assert(Array.isArray(offers))
        assert.equal(offers.length, 0)
    })
})
  
describe("shopSearch: parsePrice", function() {
    it("parsePrice works correctly with commas", function() {
        assert.equal(shopSearch.parsePrice('Price: 37,52 €'), 37.52)
    })
    it("parsePrice ignored dots", function() {
        assert.equal(shopSearch.parsePrice('Price: 3.537,52 €'), 3537.52)
    })
})
