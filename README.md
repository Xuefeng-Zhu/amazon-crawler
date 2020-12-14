# Amazon crawler

A simple Amazon crawler based on apify platform


## FAQ
Where and how can you use JQuery with the SDK?
We can use JQuery in Puppeteer Scraper. We can use the Apify.utils.puppeteer.injectJQuery helper function to do just that.

What is the main difference between Cheerio and JQuery?
Cheerio is just jQuery that doesn't need an actual browser to run. Everything else is the same

When would you use CheerioCrawler and what are its limitations?
When you need to do extremely high workloads if the website does not require js to load. However, it is easy to overload the target website with too many requests, and you cannot manipulate the website before scraping

What are the main classes for managing requests and when and why would you use one instead of another?
RequestList is the main classes for managing requests. It is a static list of URLs to crawl. If you need dynamic adding and removing of requests, you can use RequestQueue.

How can you extract data from a page in Puppeteer without using JQuery?
We can use page.$eval function

What is the default concurrency/parallelism the SDK uses?
The default minConcurrency is 1. The default maxConcurrency is 1000.



