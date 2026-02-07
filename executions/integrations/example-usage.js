/**
 * HubSpot Client Example Usage
 *
 * Demonstrates how to use the HubSpotClient for various operations.
 * Run with: node example-usage.js
 */

const HubSpotClient = require('./hubspot-client');

// Load environment variables (if using dotenv)
// require('dotenv').config();

async function exampleBasicContactCreation() {
  console.log('\n=== Example 1: Basic Contact Creation ===\n');

  const client = new HubSpotClient(process.env.HUBSPOT_API_KEY);

  try {
    const result = await client.createOrUpdateContact({
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      jobTitle: "CEO",
      companyName: "Example Insurance Agency",
      phone: "+1-555-0100",
      website: "https://example.com",
      industry: "Insurance",
      location: "Austin, TX"
    });

    console.log('Success!');
    console.log(`Contact ID: ${result.contactId}`);
    console.log(`Operation: ${result.operation}`);
    console.log(`View in HubSpot: https://app.hubspot.com/contacts/YOUR_PORTAL_ID/contact/${result.contactId}`);

  } catch (error) {
    console.error('Error creating contact:', error.message);
  }
}

async function exampleCompleteProspectWorkflow() {
  console.log('\n=== Example 2: Complete Prospect Workflow ===\n');

  const client = new HubSpotClient(process.env.HUBSPOT_API_KEY);

  const prospectData = {
    contact: {
      email: "sarah.johnson@acmeinsurance.com",
      firstName: "Sarah",
      lastName: "Johnson",
      jobTitle: "Agency Owner",
      companyName: "Acme Insurance Agency",
      phone: "+1-555-0200",
      website: "https://acmeinsurance.com",
      industry: "Commercial Insurance",
      location: "Dallas, TX"
    },
    emails: [
      {
        subject: "Transform Your Agency's Digital Presence",
        body: `Hi Sarah,

I noticed Acme Insurance Agency has a strong reputation in the Dallas commercial insurance market. However, I see an opportunity to amplify your online presence significantly.

Many agencies we work with face the same challenge: great service, but their website doesn't reflect their expertise or generate consistent leads.

Would you be open to a 15-minute call to discuss how we've helped similar agencies:
- 2x their organic website traffic in 90 days
- Reduce cost-per-lead by 40%
- Generate qualified inbound inquiries daily

Let me know if Tuesday or Wednesday works for a quick chat.

Best,
[Your Name]`,
        approach: "problem-solution"
      },
      {
        subject: "How 3 Texas Insurance Agencies Doubled Their Leads",
        body: `Hi Sarah,

Quick question: Are you happy with the number of quality leads your website generates?

I'm reaching out because we just helped three Texas insurance agencies significantly increase their inbound lead flow:

• Austin-based commercial agency: 127% increase in organic traffic
• Houston property & casualty firm: 89 qualified leads in Q4
• Dallas workers' comp specialist: 3.2x ROI on digital marketing

All three had similar starting points to Acme Insurance Agency.

Would you be interested in a brief conversation about what worked for them? I can share the specific strategies (no sales pitch, I promise).

Available for a 15-minute call this week?

Best,
[Your Name]`,
        approach: "social-proof"
      },
      {
        subject: "Quick question about acmeinsurance.com",
        body: `Hi Sarah,

I was researching commercial insurance agencies in Dallas and came across Acme Insurance Agency.

Your site mentions you specialize in commercial coverage, but I noticed it might be missing some opportunities to:
1. Capture visitors as leads (no newsletter/contact form CTA)
2. Showcase client testimonials/case studies
3. Rank for high-intent search terms like "Dallas commercial insurance"

These are quick wins that typically generate results in 30-60 days.

Would you be open to a brief call where I can share 2-3 specific recommendations? No charge, just want to help.

Let me know if you're interested.

Best,
[Your Name]`,
        approach: "question"
      }
    ],
    companyResearch: `Acme Insurance Agency is a commercial insurance brokerage based in Dallas, TX.

Key Findings:
- Specializes in commercial property, general liability, and workers' compensation
- 15+ years in business, strong local reputation
- Website traffic: ~500 monthly visitors (low for market)
- No active content marketing or SEO strategy visible
- Strong Google reviews (4.8/5 stars, 42 reviews)
- Primary competitors: Dallas Commercial Insurance Group, Texas Business Insurance Partners

Opportunities:
- Website redesign/optimization (current site is dated)
- Local SEO improvements (not ranking for commercial insurance terms)
- Content marketing strategy (blog, case studies)
- Lead magnet development (insurance checklists, guides)
- Email nurture sequence for warm leads

Decision Maker: Sarah Johnson (Owner, 15 years in insurance)
Contact: sarah.johnson@acmeinsurance.com, +1-555-0200`,
    options: {
      // sequenceId: "12345", // Uncomment if you have a sequence set up
      // ownerId: "67890"     // Uncomment to assign to specific owner
    }
  };

  try {
    const result = await client.processProspect(prospectData);

    console.log('\n✓ Workflow Complete!\n');
    console.log(`Success: ${result.success}`);
    console.log(`Contact ID: ${result.contactId}`);
    console.log(`Contact URL: ${result.contactUrl}`);
    console.log(`Sequence Enrolled: ${result.sequenceEnrolled}`);
    console.log(`Note Created: ${result.noteCreated}`);

    console.log('\nOperations:');
    console.log(`  - Contact ${result.operations.contactCreated ? 'Created' : 'Updated'}: ✓`);
    console.log(`  - Sequence Enrolled: ${result.operations.sequenceEnrolled ? '✓' : '✗'}`);
    console.log(`  - Note Added: ${result.operations.noteAdded ? '✓' : '✗'}`);

    if (result.errors.length > 0) {
      console.log('\nNon-Critical Errors:');
      result.errors.forEach(err => {
        console.log(`  - ${err.step}: ${err.message}`);
      });
    }

  } catch (error) {
    console.error('\n✗ Workflow Failed:', error.message);
  }
}

async function exampleAddNoteOnly() {
  console.log('\n=== Example 3: Add Note to Existing Contact ===\n');

  const client = new HubSpotClient(process.env.HUBSPOT_API_KEY);

  const noteContent = `# Follow-up Research

  ## New Information Discovered
  - Company recently expanded to Houston market
  - Hired 3 new agents last quarter
  - Planning digital transformation initiative

  ## Next Steps
  - Send case study on agency growth
  - Propose website audit
  - Schedule demo for Q2

  *Updated by Agency Pipeline AI - ${new Date().toLocaleDateString()}*`;

  try {
    // You would get this from a previous contact creation
    const contactId = "12345";

    const result = await client.addNoteToContact(contactId, noteContent);

    console.log('Note added successfully!');
    console.log(`Note ID: ${result.noteId}`);
    console.log(`Contact ID: ${result.contactId}`);

  } catch (error) {
    console.error('Error adding note:', error.message);
  }
}

async function exampleBatchProcessing() {
  console.log('\n=== Example 4: Batch Processing Multiple Prospects ===\n');

  const client = new HubSpotClient(process.env.HUBSPOT_API_KEY);

  const prospects = [
    {
      contact: {
        email: "prospect1@example.com",
        firstName: "Jane",
        lastName: "Smith",
        companyName: "Smith Insurance"
      },
      emails: [/* ... */],
      companyResearch: "Research for Smith Insurance..."
    },
    {
      contact: {
        email: "prospect2@example.com",
        firstName: "Bob",
        lastName: "Wilson",
        companyName: "Wilson Agency"
      },
      emails: [/* ... */],
      companyResearch: "Research for Wilson Agency..."
    },
    // ... more prospects
  ];

  console.log(`Processing ${prospects.length} prospects...\n`);

  const results = [];

  for (const prospect of prospects) {
    try {
      console.log(`Processing ${prospect.contact.email}...`);
      const result = await client.processProspect(prospect);
      results.push({ email: prospect.contact.email, success: true, contactUrl: result.contactUrl });
      console.log(`✓ ${prospect.contact.email} - Success\n`);

      // Add small delay between prospects to be nice to API
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`✗ ${prospect.contact.email} - Failed: ${error.message}\n`);
      results.push({ email: prospect.contact.email, success: false, error: error.message });
    }
  }

  console.log('\n=== Batch Processing Results ===\n');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Prospects:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.email}: ${r.error}`);
    });
  }
}

// Run examples
async function main() {
  // Check if API key is set
  if (!process.env.HUBSPOT_API_KEY) {
    console.error('\n❌ Error: HUBSPOT_API_KEY environment variable not set\n');
    console.log('Please set your HubSpot API key:');
    console.log('  export HUBSPOT_API_KEY="your-api-key"\n');
    console.log('Or create a .env file with:');
    console.log('  HUBSPOT_API_KEY=your-api-key\n');
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   HubSpot Client - Example Usage              ║');
  console.log('╚════════════════════════════════════════════════╝');

  // Uncomment the examples you want to run:

  // await exampleBasicContactCreation();
  await exampleCompleteProspectWorkflow();
  // await exampleAddNoteOnly();
  // await exampleBatchProcessing();

  console.log('\n✓ Examples completed\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  exampleBasicContactCreation,
  exampleCompleteProspectWorkflow,
  exampleAddNoteOnly,
  exampleBatchProcessing
};
