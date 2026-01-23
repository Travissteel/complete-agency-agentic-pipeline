/**
 * Google Maps Business Scraper - Apify Actor
 *
 * Scrapes Google Maps business listings for B2B lead generation.
 * Extracts contact information, reviews, and business details for targeted verticals.
 *
 * @version 1.0.0
 * @requires apify
 * @requires dotenv
 */

const Apify = require('apify');
require('dotenv').config();

/**
 * Main scraper function
 * Extracts business data from Google Maps search results
 */
Apify.main(async () => {
    // Get input configuration
    const input = await Apify.getInput();

    // Destructure input parameters with defaults
    const {
        vertical = 'insurance', // 'insurance', 'real_estate', 'recruitment'
        location = 'Austin, TX',
        radius = 50, // miles
        maxBusinesses = 200,
        minRating = 3.5,
        minReviews = 5,
        useProxy = true,
        proxyGroup = process.env.APIFY_DEFAULT_PROXY_GROUP || 'RESIDENTIAL',
        exportFormat = 'JSON' // 'JSON' or 'CSV'
    } = input;

    console.log('Starting Google Maps Business Scraper...');
    console.log(`Vertical: ${vertical}`);
    console.log(`Location: ${location}`);
    console.log(`Radius: ${radius} miles`);
    console.log(`Max businesses: ${maxBusinesses}`);

    // Define search categories based on vertical
    const verticalCategories = {
        insurance: [
            'insurance agency',
            'insurance broker',
            'commercial insurance',
            'business insurance agency'
        ],
        real_estate: [
            'commercial real estate agency',
            'commercial real estate broker',
            'commercial property management',
            'real estate investment company'
        ],
        recruitment: [
            'recruiter',
            'employment agency',
            'staffing service',
            'executive search firm',
            'talent acquisition agency'
        ]
    };

    const categories = verticalCategories[vertical] || [];
    console.log(`Searching categories: ${categories.join(', ')}`);

    // Initialize request queue
    const requestQueue = await Apify.openRequestQueue();

    // Add search URLs to queue for each category
    for (const category of categories) {
        const searchUrl = buildGoogleMapsSearchUrl(category, location);
        await requestQueue.addRequest({
            url: searchUrl,
            userData: {
                label: 'SEARCH',
                category,
                vertical,
                location
            }
        });
    }

    // Configure proxy settings
    const proxyConfiguration = useProxy
        ? await Apify.createProxyConfiguration({
            groups: [proxyGroup],
            countryCode: 'US'
        })
        : undefined;

    // Track scraped businesses to avoid duplicates
    const scrapedBusinessIds = new Set();
    let totalScraped = 0;

    // Initialize Puppeteer crawler for Google Maps
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        maxRequestRetries: 3,
        maxRequestsPerCrawl: maxBusinesses * 2, // Account for detail pages
        requestHandlerTimeoutSecs: 120,
        maxConcurrency: 3,
        launchContext: {
            launchOptions: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        },

        handlePageFunction: async ({ request, page }) => {
            const { label } = request.userData;

            console.log(`Processing: ${label} - ${request.url}`);

            switch (label) {
                case 'SEARCH':
                    await handleSearchPage(page, request, requestQueue, maxBusinesses, totalScraped);
                    break;

                case 'BUSINESS_DETAIL':
                    const businessData = await handleBusinessDetail(page, request, minRating, minReviews);
                    if (businessData) {
                        const businessId = businessData.placeId || businessData.name;
                        if (!scrapedBusinessIds.has(businessId)) {
                            await Apify.pushData(businessData);
                            scrapedBusinessIds.add(businessId);
                            totalScraped++;
                            console.log(`Scraped business ${totalScraped}/${maxBusinesses}: ${businessData.name}`);
                        }
                    }
                    break;

                default:
                    console.log(`Unknown label: ${label}`);
            }

            // Add random delay to avoid rate limiting
            await page.waitForTimeout(getRandomDelay(2000, 5000));
        },

        handleFailedRequestFunction: async ({ request, error }) => {
            console.error(`Request failed: ${request.url}`);
            console.error(`Error: ${error.message}`);

            // Log failed requests
            await Apify.pushData({
                type: 'FAILED_REQUEST',
                url: request.url,
                error: error.message,
                userData: request.userData,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Run the crawler
    await crawler.run();

    console.log('Google Maps scraping completed!');
    console.log(`Total businesses scraped: ${totalScraped}`);

    // Generate summary statistics
    const dataset = await Apify.openDataset();
    const info = await dataset.getInfo();
    console.log(`Total records in dataset: ${info.itemCount}`);
});

/**
 * Build Google Maps search URL
 */
function buildGoogleMapsSearchUrl(category, location) {
    const query = `${category} in ${location}`;
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.com/maps/search/${encodedQuery}`;
}

/**
 * Handle Google Maps search results page
 * Extract business listing URLs
 */
async function handleSearchPage(page, request, requestQueue, maxBusinesses, currentCount) {
    try {
        // Wait for results to load
        await page.waitForSelector('[role="feed"]', { timeout: 30000 });

        // Scroll to load more results
        const scrollAttempts = Math.ceil(maxBusinesses / 20); // Google Maps loads ~20 at a time
        for (let i = 0; i < scrollAttempts && currentCount < maxBusinesses; i++) {
            await autoScroll(page);
            await page.waitForTimeout(2000);
        }

        // Extract business links
        const businessLinks = await page.evaluate(() => {
            const links = [];
            const elements = document.querySelectorAll('[role="feed"] a[href*="/maps/place/"]');

            elements.forEach(element => {
                const href = element.getAttribute('href');
                if (href && !links.includes(href)) {
                    links.push(href);
                }
            });

            return links;
        });

        console.log(`Found ${businessLinks.length} business links on search page`);

        // Add business detail pages to queue
        for (const link of businessLinks.slice(0, maxBusinesses - currentCount)) {
            await requestQueue.addRequest({
                url: `https://www.google.com${link}`,
                userData: {
                    label: 'BUSINESS_DETAIL',
                    category: request.userData.category,
                    vertical: request.userData.vertical,
                    location: request.userData.location
                }
            });
        }

    } catch (error) {
        console.error(`Error handling search page: ${error.message}`);
    }
}

/**
 * Handle business detail page
 * Extract comprehensive business information
 */
async function handleBusinessDetail(page, request, minRating, minReviews) {
    try {
        // Wait for business details to load
        await page.waitForSelector('h1', { timeout: 15000 });

        // Extract business information
        const businessData = await page.evaluate(() => {
            // Helper function to safely get text content
            const getText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.trim() : null;
            };

            // Helper function to get attribute value
            const getAttr = (selector, attr) => {
                const element = document.querySelector(selector);
                return element ? element.getAttribute(attr) : null;
            };

            return {
                name: getText('h1.DUwDvf'),
                category: getText('button[jsaction*="category"]'),
                rating: getText('div.F7nice span[aria-hidden="true"]'),
                reviewCount: getText('div.F7nice span[aria-label*="reviews"]'),
                address: getText('button[data-item-id*="address"]'),
                phone: getText('button[data-item-id*="phone"]'),
                website: getAttr('a[data-item-id*="authority"]', 'href'),
                hours: getText('button[data-item-id*="oh"]'),
                priceLevel: getText('span[aria-label*="Price"]'),
                placeId: getAttr('button[data-item-id]', 'data-item-id'),
                plusCode: getText('button[data-item-id*="oloc"]'),
                coordinates: window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/),
                images: Array.from(document.querySelectorAll('img[src*="googleusercontent"]'))
                    .slice(0, 5)
                    .map(img => img.src),
                attributes: Array.from(document.querySelectorAll('div[class*="accessibility"] span'))
                    .map(span => span.textContent.trim())
                    .filter(text => text.length > 0)
            };
        });

        // Parse rating and review count
        const rating = parseFloat(businessData.rating) || 0;
        const reviewCount = parseInt(businessData.reviewCount?.match(/\d+/)?.[0]) || 0;

        // Filter by minimum rating and reviews
        if (rating < minRating || reviewCount < minReviews) {
            console.log(`Skipping ${businessData.name} - Rating: ${rating}, Reviews: ${reviewCount}`);
            return null;
        }

        // Extract coordinates from URL
        let latitude = null;
        let longitude = null;
        if (businessData.coordinates && businessData.coordinates.length > 2) {
            latitude = parseFloat(businessData.coordinates[1]);
            longitude = parseFloat(businessData.coordinates[2]);
        }

        // Extract email from website if available
        let email = null;
        if (businessData.website) {
            email = await extractEmailFromWebsite(page, businessData.website);
        }

        // Calculate engagement score
        const engagementScore = calculateEngagementScore(rating, reviewCount, businessData.images.length);

        // Construct final business object
        return {
            type: 'BUSINESS',
            name: businessData.name,
            category: businessData.category,
            rating: rating,
            reviewCount: reviewCount,
            address: businessData.address,
            phone: cleanPhoneNumber(businessData.phone),
            email: email,
            website: businessData.website,
            hours: businessData.hours,
            priceLevel: businessData.priceLevel,
            placeId: businessData.placeId,
            plusCode: businessData.plusCode,
            latitude: latitude,
            longitude: longitude,
            images: businessData.images,
            attributes: businessData.attributes,
            engagementScore: engagementScore,
            vertical: request.userData.vertical,
            searchCategory: request.userData.category,
            searchLocation: request.userData.location,
            scrapeDate: new Date().toISOString(),
            googleMapsUrl: page.url()
        };

    } catch (error) {
        console.error(`Error extracting business details: ${error.message}`);
        return null;
    }
}

/**
 * Auto-scroll to load more results
 */
async function autoScroll(page) {
    await page.evaluate(async () => {
        const feed = document.querySelector('[role="feed"]');
        if (feed) {
            feed.scrollTop = feed.scrollHeight;
        }
    });
}

/**
 * Extract email from business website (basic scraping)
 */
async function extractEmailFromWebsite(page, websiteUrl) {
    try {
        // Create new page for website scraping
        const context = page.browser();
        const websitePage = await context.newPage();

        await websitePage.goto(websiteUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        // Look for email in page content
        const email = await websitePage.evaluate(() => {
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
            const bodyText = document.body.innerText;
            const matches = bodyText.match(emailRegex);

            // Filter out common generic emails
            const genericEmails = ['example@', 'test@', 'sample@', 'noreply@'];
            if (matches) {
                for (const match of matches) {
                    const isGeneric = genericEmails.some(generic => match.toLowerCase().includes(generic));
                    if (!isGeneric) {
                        return match;
                    }
                }
            }
            return null;
        });

        await websitePage.close();
        return email;

    } catch (error) {
        console.log(`Could not extract email from website: ${error.message}`);
        return null;
    }
}

/**
 * Clean and format phone number
 */
function cleanPhoneNumber(phoneStr) {
    if (!phoneStr) return null;

    // Remove all non-digit characters
    const digits = phoneStr.replace(/\D/g, '');

    // Format as +1-XXX-XXX-XXXX for US numbers
    if (digits.length === 10) {
        return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
        return `+${digits[0]}-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    return phoneStr; // Return original if format doesn't match
}

/**
 * Calculate engagement score based on rating, reviews, and photos
 */
function calculateEngagementScore(rating, reviewCount, photoCount) {
    let score = 0;

    // Rating contribution (0-40 points)
    score += (rating / 5) * 40;

    // Review count contribution (0-40 points)
    const reviewScore = Math.min(reviewCount / 100, 1) * 40;
    score += reviewScore;

    // Photo count contribution (0-20 points)
    const photoScore = Math.min(photoCount / 10, 1) * 20;
    score += photoScore;

    return Math.round(score);
}

/**
 * Generate random delay between min and max milliseconds
 */
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Export configuration for testing
 */
module.exports = {
    buildGoogleMapsSearchUrl,
    cleanPhoneNumber,
    calculateEngagementScore,
    getRandomDelay
};
