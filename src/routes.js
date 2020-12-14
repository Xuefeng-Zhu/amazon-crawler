const Apify = require('apify');
const { DETAIL_LABEL, SELLER_LABEL } = require('./constant');

const { utils: { log } } = Apify;

exports.handleSearch = async ({ request, page }, requestQueue) => {
    const { userData } = request;
    const result = await page.evaluate(() => {
        const $items = $('.s-result-list [data-asin]');
        const items = [];
        $items.each(function () {
            const { asin } = $(this).data();
            if (asin) {
                items.push(asin);
            }
        });

        return { items };
    });

    for (const asin of result.items) {
        log.info(`Add item ${asin} into request queue`);
        const sellerUrl = `https://www.amazon.com/gp/offer-listing/${asin}`;
        const itemUrl = `https://www.amazon.com/dp/${asin}`;

        await requestQueue.addRequest({
            url: itemUrl,
            userData: {
                asin,
                itemUrl,
                sellerUrl,
                label: DETAIL_LABEL,
                keyword: userData.keyword,
            },
        });
    }
};

exports.handleDetail = async ({ request, page }, requestQueue) => {
    const { userData, url } = request;
    const result = await page.evaluate(() => {
        const $title = $('#productTitle');
        const $description = $('#featurebullets_feature_div');

        return {
            title: $title.text().trim(),
            description: $description.text().trim(),
        };
    });

    const { sellerUrl, asin, keyword } = userData;
    log.info(`Add sellerUrl ${sellerUrl} into request queue`);
    await requestQueue.addRequest({
        url: sellerUrl,
        userData: {
            ...result,
            asin,
            itemUrl: url,
            label: SELLER_LABEL,
            keyword,
        },
    });
};

exports.handleSeller = async ({ request, page }, requestQueue) => {
    const { userData } = request;
    const result = await page.evaluate(() => {
        const offers = [];
        $('.olpOffer').each(function () {
            const $price = $(this).find('.olpOfferPrice');
            const $sellerNameImg = $(this).find('.olpSellerName img');
            const $sellerName = $(this).find('.olpSellerName');
            const $shipping = $(this).find('.olpShippingInfo');

            offers.push({
                price: $price.text().trim(),
                sellerName: $sellerNameImg.attr('alt') || $sellerName.text().trim(),
                shipping: $shipping.find('b').text().trim() || $shipping.find('.olpShippingPrice').text().trim(),
            });
        });

        const $pagination = $(this).find('.a-pagination li.a-last a');
        return {
            offers,
            nextUrl: $pagination.attr('href'),
        };
    });

    const { asin, keyword, title, description, itemUrl } = userData;
    if (result.nextUrl) {
        log.info(`Add sellerUrl ${result.nextUrl} into request queue`);
        await requestQueue.addRequest({
            url: `https://www.amazon.com${result.nextUrl}`,
            userData: {
                asin,
                title,
                description,
                itemUrl,
                label: SELLER_LABEL,
                keyword,
            },
        });
    }

    for (const offer of result.offers) {
        log.info(`Add offer of ${title}`, offer);
        await Apify.pushData({
            ...offer,
            title,
            description,
            keyword,
            url: itemUrl,
        });
    }
};
