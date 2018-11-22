const { parsePrice } = require("../index.js")

module.exports = {
	// Mixed
	alza: {
		serp_url: 'https://www.alza.sk/search.htm?exps=',
		item: '.browsingitem',
		name: '.name',
		price: '.priceInner .c2',
		url: (elem) => 'https://www.alza.sk'+elem.find('.browsinglink').attr('href')
	},
	// Only functions
	mall: {
		serp_url: (query) => 'https://www.mall.sk/hladaj?s='+query,
		item: ($, cb) => $('.lst-item').each(cb),
		name: (elem) => elem.find('.lst-product-item-title a').text().trim(),
		price: (elem) => parsePrice(elem.find('.lst-product-item-price-value').text()),
		url: (elem) => 'https://www.mall.sk'+elem.find('.lst-product-item-title a').attr('href')
	},
	// Only text
	okay: {
		serp_url: 'https://www.okay.sk/hladanie/?query=',
		item: '.crossroad-products-big li .inner',
		name: '.title a',
		price:  '.price .highlight span',
		url: '.title a'
	}
}
