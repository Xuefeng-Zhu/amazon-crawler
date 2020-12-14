/**
 * This template is a production ready boilerplate for developing with `PuppeteerCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

const Apify = require('apify');
const { handleSeller, handleSearch, handleDetail } = require('./routes');
const { SEARCH_LABEL, DETAIL_LABEL, SELLER_LABEL } = require('./constant');

const {
    utils: { log },
} = Apify;

Apify.main(async () => {
    const { keyword } = await Apify.getInput();
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration();

    await requestQueue.addRequest({
        url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
        userData: {
            label: SEARCH_LABEL,
            keyword,
        },
    });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        useSessionPool: true,
        persistCookiesPerSession: true,
        launchPuppeteerOptions: {
            headless: true,
        },
        handlePageFunction: async (context) => {
            const { request, page } = context;
            const {
                url,
                userData: { label },
            } = request;
            log.info('Page opened.', { label, url });

            await Apify.utils.puppeteer.injectJQuery(page);

            switch (label) {
                case SEARCH_LABEL:
                    return handleSearch(context, requestQueue);
                case DETAIL_LABEL:
                    return handleDetail(context, requestQueue);
                case SELLER_LABEL:
                    return handleSeller(context, requestQueue);
                default:
                    log.error('Invalid label', label);
            }
        },
        handleFailedRequestFunction: async ({ request, error }) => {
            log.error(`[failed] ${request.url} with error: ${error}`);
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
