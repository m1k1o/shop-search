const rewire = require('rewire')
const assert = require("assert")
const fs = require("fs")

const alza = require("./responses/alza.js")
const mall = require("./responses/mall.js")
const okay = require("./responses/okay.js")
const expected_response = { okay, alza, mall }

let shopSearch = rewire("./index.js")
let response404 = false
shopSearch.__set__("request", (url, cb) => response404
    ? cb(null, { statusCode: 404 }, null)
    : fs.readdir('responses/', (e, files) => {
        let file = files.find((file) => url.includes(
            file.replace(/\..*$/, '')))

        if(e || typeof file === 'undefined') {
            return cb(null, { statusCode: 404 }, null)
        }

        fs.readFile('responses/'+file, (e, d) => 
            cb(null, { statusCode: e ? 404 : 200 }, d))
    })
)

describe("shopSearch: getOffers", function() {
    it("shopSearch is working as expected", function(done) {
      shopSearch.getOffers('iphone 7', (e, d) => {
          assert.deepEqual(d, expected_response)
          done(e)
      })
    })

    it("shopSearch fails on 404", function(done) {
        response404 = true
        shopSearch.getOffers('iphone 7', (e, d) => {
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
