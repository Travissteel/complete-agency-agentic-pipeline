/**
 * LinkedIn Company Scraper - Apify Actor
 *
 * Scrapes LinkedIn company pages and decision maker profiles for B2B lead generation.
 * Targets commercial insurance, commercial real estate, and recruitment verticals.
 *
 * @version 1.0.0
 * @requires apify
 * @requires dotenv
 */

const Apify = require('apify');
require('dotenv').config();

/**
 * Main scraper function
 * Extracts company data and decision maker information from LinkedIn
 */
Apify.main(async () => {
    // Get input configuration
    const input = await Apify.getInput();

    // Destructure input parameters with defaults
    const {
        vertical = 'insurance', // 'insurance', 'real_estate', 'recruitment'
        location = 'United States',
        companySize = '10-200',
        maxCompanies = 100,
        maxProfilesPerCompany = 5,
        searchQuery = '',
        useProxy = true,
        proxyGroup = process.env.APIFY_DEFAULT_PROXY_GROUP || 'RESIDENTIAL'
    } = input;

    console.log('Starting LinkedIn Company Scraper...');
    console.log(`Vertical: ${vertical}`);
    console.log(`Location: ${location}`);
    console.log(`Max companies: ${maxCompanies}`);

    // Configure search queries based on vertical
    const verticalQueries = {
        insurance: [
            'insurance agency owner',
            'insurance broker',
            'commercial insurance agent',
            'property casualty insurance'
        ],
        real_estate: [
            'commercial real estate broker',
            'CRE investment',
            'commercial property management',
            'commercial real estate firm'
        ],
        recruitment: [
            'staffing agency owner',
            'recruitment firm',
            'executive search firm',
            'talent acquisition agency'
        ]
    };

    // Decision maker titles to target
    const decisionMakerTitles = {
        insurance: ['CEO', 'President', 'Agency Owner', 'Managing Partner', 'Principal Agent'],
        real_estate: ['Principal', 'Managing Broker', 'Investment Director', 'CEO', 'Founder'],
        recruitment: ['CEO', 'Founder', 'Director of Recruiting', 'Managing Director', 'President']
    };

    // Build search URL based on vertical and location
    const queries = searchQuery ? [searchQuery] : verticalQueries[vertical] || [];
    const targetTitles = decisionMakerTitles[vertical] || [];

    // Initialize request queue
    const requestQueue = await Apify.openRequestQueue();

    // Add company search URLs to queue
    for (const query of queries) {
        const searchUrl = buildLinkedInSearchUrl(query, location, companySize);
        await requestQueue.addRequest({
            url: searchUrl,
            userData: {
                label: 'COMPANY_SEARCH',
                query,
                vertical
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

    // Initialize crawler
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        proxyConfiguration,
        maxRequestRetries: 3,
        maxRequestsPerCrawl: maxCompanies + (maxCompanies * maxProfilesPerCompany),
        requestHandlerTimeoutSecs: 60,
        maxConcurrency: 5,

        handlePageFunction: async ({ request, $, body }) => {
            const { label } = request.userData;

            console.log(`Processing: ${label} - ${request.url}`);

            // Handle different page types
            switch (label) {
                case 'COMPANY_SEARCH':
                    await handleCompanySearchPage($, request, requestQueue, maxCompanies);
                    break;

                case 'COMPANY_PAGE':
                    await handleCompanyPage($, request, requestQueue, targetTitles, maxProfilesPerCompany);
                    break;

                case 'PROFILE_PAGE':
                    await handleProfilePage($, request);
                    break;

                default:
                    console.log(`Unknown label: ${label}`);
            }

            // Add random delay to avoid rate limiting
            await Apify.utils.sleep(getRandomDelay(3000, 10000));
        },

        handleFailedRequestFunction: async ({ request, error }) => {
            console.error(`Request failed: ${request.url}`);
            console.error(`Error: ${error.message}`);

            // Log failed requests to dataset for manual review
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

    console.log('LinkedIn scraping completed!');

    // Generate summary statistics
    const dataset = await Apify.openDataset();
    const info = await dataset.getInfo();
    console.log(`Total records saved: ${info.itemCount}`);
});

/**
 * Build LinkedIn search URL with filters
 */
function buildLinkedInSearchUrl(query, location, companySize) {
    const encodedQuery = encodeURIComponent(query);
    const encodedLocation = encodeURIComponent(location);

    // LinkedIn company search URL structure
    return `https://www.linkedin.com/search/results/companies/?keywords=${encodedQuery}&location=${encodedLocation}&companySize=${companySize}`;
}

/**
 * Handle company search results page
 * Extract company URLs and add to queue
 */
async function handleCompanySearchPage($, request, requestQueue, maxCompanies) {
    const companyLinks = [];

    // Extract company links from search results
    $('.entity-result__title-text a.app-aware-link').each((index, element) => {
        if (companyLinks.length >= maxCompanies) return false;

        const companyUrl = $(element).attr('href');
        if (companyUrl && companyUrl.includes('/company/')) {
            companyLinks.push(companyUrl.split('?')[0]); // Remove query params
        }
    });

    console.log(`Found ${companyLinks.length} companies on search page`);

    // Add company pages to queue
    for (const companyUrl of companyLinks) {
        await requestQueue.addRequest({
            url: companyUrl,
            userData: {
                label: 'COMPANY_PAGE',
                vertical: request.userData.vertical,
                searchQuery: request.userData.query
            }
        });
    }

    // Check for pagination
    const nextButton = $('button.artdeco-pagination__button--next');
    if (nextButton.length && !nextButton.hasClass('artdeco-button--disabled')) {
        const nextPageUrl = request.url; // Would need to construct proper pagination URL
        // Note: LinkedIn pagination requires authenticated session, might need Puppeteer
    }
}

/**
 * Handle company profile page
 * Extract company data and find decision maker profiles
 */
async function handleCompanyPage($, request, requestQueue, targetTitles, maxProfiles) {
    const companyUrl = request.url;

    // Extract company information
    const companyData = {
        type: 'COMPANY',
        companyName: $('h1.org-top-card-summary__title').text().trim(),
        industry: $('.org-top-card-summary__industry').text().trim(),
        companySize: $('.org-about-company-module__company-size-definition-text').text().trim(),
        location: $('.org-top-card-summary__headquarter').text().trim(),
        website: $('a.org-about-us-company-module__website').attr('href'),
        linkedinUrl: companyUrl,
        description: $('.org-about-us-organization-description__text').text().trim(),
        followers: $('.org-top-card-summary-info-list__info-item').first().text().trim(),
        employeeCount: extractEmployeeCount($),
        recentActivity: extractRecentActivity($),
        scrapeDate: new Date().toISOString(),
        vertical: request.userData.vertical,
        sourceQuery: request.userData.searchQuery,
        decisionMakers: []
    };

    console.log(`Scraped company: ${companyData.companyName}`);

    // Navigate to People tab to find decision makers
    const peopleTabUrl = `${companyUrl}/people/`;

    // In production, would need to:
    // 1. Navigate to people tab
    // 2. Search for target titles
    // 3. Extract decision maker profiles
    // This requires authenticated Puppeteer session with LinkedIn cookies

    // For now, extract publicly visible people links if any
    const peopleLinks = [];
    $('a[href*="/in/"]').each((index, element) => {
        if (peopleLinks.length >= maxProfiles) return false;

        const profileUrl = $(element).attr('href');
        if (profileUrl && profileUrl.includes('/in/')) {
            peopleLinks.push(profileUrl.split('?')[0]);
        }
    });

    // Add profile pages to queue
    for (const profileUrl of peopleLinks) {
        await requestQueue.addRequest({
            url: profileUrl,
            userData: {
                label: 'PROFILE_PAGE',
                companyName: companyData.companyName,
                companyUrl: companyUrl,
                vertical: request.userData.vertical
            }
        });
    }

    // Save company data
    await Apify.pushData(companyData);
}

/**
 * Handle individual profile page
 * Extract decision maker information
 */
async function handleProfilePage($, request) {
    const profileUrl = request.url;

    // Extract profile information
    const profileData = {
        type: 'PROFILE',
        fullName: $('h1.text-heading-xlarge').text().trim(),
        jobTitle: $('.text-body-medium.break-words').first().text().trim(),
        location: $('.text-body-small.inline').text().trim(),
        linkedinProfile: profileUrl,
        companyName: request.userData.companyName,
        companyUrl: request.userData.companyUrl,
        about: $('.display-flex.ph5.pv3').text().trim(),
        experience: extractExperience($),
        email: extractEmailFromProfile($),
        scrapeDate: new Date().toISOString(),
        vertical: request.userData.vertical
    };

    console.log(`Scraped profile: ${profileData.fullName} - ${profileData.jobTitle}`);

    // Save profile data
    await Apify.pushData(profileData);
}

/**
 * Extract employee count from various possible selectors
 */
function extractEmployeeCount($) {
    const sizeText = $('.org-about-company-module__company-size-definition-text').text();
    const match = sizeText.match(/(\d+)-(\d+)/);
    return match ? `${match[1]}-${match[2]}` : sizeText.trim();
}

/**
 * Extract recent activity/posts from company page
 */
function extractRecentActivity($) {
    const posts = [];
    $('.feed-shared-update-v2').slice(0, 3).each((index, element) => {
        posts.push({
            text: $(element).find('.feed-shared-text').text().trim().substring(0, 200),
            timestamp: $(element).find('.feed-shared-actor__sub-description').text().trim()
        });
    });
    return posts;
}

/**
 * Extract experience information from profile
 */
function extractExperience($) {
    const experience = [];
    $('.pvs-list__paged-list-item').slice(0, 3).each((index, element) => {
        experience.push({
            title: $(element).find('.mr1.t-bold').text().trim(),
            company: $(element).find('.t-14.t-normal').first().text().trim(),
            duration: $(element).find('.t-14.t-normal.t-black--light').text().trim()
        });
    });
    return experience;
}

/**
 * Extract email from profile if publicly visible
 */
function extractEmailFromProfile($) {
    // Look for email in contact info section
    const contactText = $('.pv-contact-info').text();
    const emailMatch = contactText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    return emailMatch ? emailMatch[1] : null;
}

/**
 * Generate random delay between min and max milliseconds
 */
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Export configuration for easy testing
 */
module.exports = {
    buildLinkedInSearchUrl,
    extractEmployeeCount,
    getRandomDelay
};
