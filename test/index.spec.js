const rewire = require('rewire')
const assert = require("assert")
const fs = require("fs")

const shops = require("./shops.object.js")
const expectedResponse = {
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
        let shopName = Object.keys(expectedResponse)[0]
        shopSearch.getOffer(shops[shopName], 'iphone 7', (e, d) => {
            assert.deepEqual(d, expectedResponse[shopName])
            done(e)
        })
    })
})

describe("shopSearch: getOffers", function() {
    it("getOffers is working as expected with Object", function(done) {
        shopSearch.getOffers(shops, 'iphone 7', (e, d) => {
            assert.deepEqual(d, expectedResponse)
            done(e)
        })
    })
    
    it("getOffers is working as expected with Array too", function(done) {
        const shopsArray = Object.values(shops)
        const expectedResponseArray = Object.values(expectedResponse)

        shopSearch.getOffers(shopsArray, 'iphone 7', (e, d) => {
            // Any order
            for (const i in expectedResponseArray) {
                assert(d.indexOf(expectedResponseArray[i]))
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
        let offers = shopSearch.sortProducts(expectedResponse)
        assert(offers[0].price, 9.8)
    })
  
    it("reversed sortProducts gets most expensive product", function() {
        let offers = shopSearch.sortProducts(expectedResponse, true)
        assert(offers[0].price, 1679)
    })

    it("sortProducts does not fail on junk data", function() {
        let offers = shopSearch.sortProducts(undefined, true)
        assert(Array.isArray(offers))
        assert.equal(offers.length, 0)
    })

    it("sortProducts works with array too", function() {
        const expectedResponseArray = Object.values(expectedResponse)

        let expected = {
            shop: '0',
            name: 'Pouzdro Col Fr iPhone 7/8 red ROZBALENÉ',
            price: 9.8,
            url: 'https://www.okay.sk/pouzdro-col-fr-iphone-7-8-red-rozbalene/'
        }
        
        let offers = shopSearch.sortProducts(expectedResponseArray)
        assert.deepEqual(offers[0], expected)
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
