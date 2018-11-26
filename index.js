const { parallel } = require("async");
const request = require("request")
const cheerio = require('cheerio')

let parsePrice = (price) => 
    parseFloat(price
        .replace(/[^0-9,]/g, '')
        .replace(',', '.'))

let sortProducts = (shops, reverse = false) => {
    let offers = []
    for (const shop in shops) {
        typeof shops[shop] == 'undefined' ||
        shops[shop].map((offer) => 
            offers.push({ "shop": shop, ...offer }))
    }
    
    if(reverse)
        offers.sort((a, b) => b.price - a.price)
    else 
        offers.sort((a, b) => a.price - b.price)

    return offers
}

let getOffer = (shop, query, cb) =>
    request(typeof shop.serpUrl !== 'function' ? shop.serpUrl+encodeURIComponent(query) : shop.serpUrl(query), (e, { statusCode }, d) => {
        if (statusCode !== 200) {
            return cb(new Error(statusCode));
        }

        const $ = cheerio.load(d)

        let result = []
        let productsLoop = ($, cb) =>
            $(shop.item).each(cb)

        if(typeof shop.item === 'function') {
            productsLoop = shop.item
        }
        
        productsLoop($, (i, e) => {
            let elem = $(e)
            result.push({
                name: typeof shop.name !== 'function' ? elem.find(shop.name).text().trim() : shop.name(elem),
                price: typeof shop.price !== 'function' ? parsePrice(elem.find(shop.price).text()) : shop.price(elem),
                url: typeof shop.url !== 'function' ? elem.find(shop.url).attr('href') : shop.url(elem)
            })
        })

        cb(e, result)
    })

let getOffers = (shops, query, cb) =>
    parallel(Array.isArray(shops)
        ? shops.map((shop) => (cb) => getOffer(shop, query, cb))
        : Object.assign(...Object.entries(shops).map(([k, shop]) =>
            ({
                [k]: (cb) => getOffer(shop, query, cb)
            })
        )), cb)

module.exports = { getOffers, getOffer, sortProducts, parsePrice }
