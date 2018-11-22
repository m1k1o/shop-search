const async = require("async");
const request = require("request")
const cheerio = require('cheerio')

let parsePrice = (price) => {
	price = price.replace(/[^0-9,]/, '')
	price = price.replace(',', '.')
	return parseFloat(price)
}

let sortProducts = (shops, reverse = false) => {
    let offers = []
    for (const shop in shops) {
        typeof shops[shop] == 'undefined' ||
        shops[shop].map((offer) => 
            offers.push({ "shop": shop, ...offer }))
    }
    
    let i = reverse ? -1 : 1;
    offers.sort((a, b) => i * a.price - i * b.price)
    return offers
}

let getOffers = (query, cb) => {
	let tasks = {
		alza: (cb) => {
			const URL = 'https://www.alza.sk/search.htm?exps='
			request(URL+query, (e, { statusCode }, d) => {
				if (statusCode !== 200)
					return cb(new Error(statusCode));

				const $ = cheerio.load(d)

				let result = []
				$('.browsingitem').each((i, e) => {
					let elem = $(e)
					result.push({
						name: elem.find('.name').text().trim(),
						price: parsePrice(elem.find('.priceInner .c2').text()),
						url: 'https://www.alza.sk'+elem.find('.browsinglink').attr('href')
					})
				})

				cb(e, result)
			})
		},
		mall: (cb) => {
			const URL = 'https://www.mall.sk/hladaj?s='
			request(URL+query, (e, { statusCode }, d) => {
				if (statusCode !== 200)
					return cb(new Error(statusCode));
				
				const $ = cheerio.load(d)

				let result = []
				$('.lst-item').each((i, e) => {
					let elem = $(e)
					result.push({
						name: elem.find('.lst-product-item-title a').text().trim(),
						price: parsePrice(elem.find('.lst-product-item-price-value').text()),
						url: 'https://www.mall.sk'+elem.find('.lst-product-item-title a').attr('href')
					})
				})

				cb(e, result)
			})
		},
		okay: (cb) => {
			const URL = 'https://www.okay.sk/hladanie/?query='
			request(URL+query, (e, { statusCode }, d) => {
				if (statusCode !== 200)
					return cb(new Error(statusCode));
				
				const $ = cheerio.load(d)

				let result = []
				$('.crossroad-products-big li .inner').each((i, e) => {
					let elem = $(e)
					result.push({
						name: elem.find('.title a').text().trim(),
						price: parsePrice(elem.find('.price .highlight span').text()),
						url: elem.find('.title a').attr('href')
					})
				})

				cb(e, result)
			})
		}
	}

	async.parallel(tasks, cb)
}

module.exports = { getOffers, bestOffers }
