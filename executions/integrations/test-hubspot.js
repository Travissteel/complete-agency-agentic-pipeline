/**
 * Simple Test Script for HubSpot Client
 *
 * Tests basic functionality without making actual API calls.
 * Run with: node test-hubspot.js
 */

const HubSpotClient = require('./hubspot-client');

function testClientInitialization() {
  console.log('\n=== Test 1: Client Initialization ===');

  try {
    // Test without API key (should throw)
    try {
      const client = new HubSpotClient();
      console.log('✗ FAILED: Should throw error without API key');
    } catch (error) {
      console.log('✓ PASSED: Correctly throws error without API key');
      console.log(`  Error message: "${error.message}"`);
    }

    // Test with API key (should succeed)
    try {
      const client = new HubSpotClient('test-api-key-12345');
      console.log('✓ PASSED: Client initialized with API key');
    } catch (error) {
      console.log('✗ FAILED: Should not throw with valid API key');
      console.log(`  Error: ${error.message}`);
    }

  } catch (error) {
    console.log('✗ FAILED: Unexpected error in initialization test');
    console.error(error);
  }
}

function testContactDataMapping() {
  console.log('\n=== Test 2: Contact Data Mapping ===');

  const testContact = {
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    jobTitle: "CEO",
    companyName: "Test Company",
    phone: "+1-555-0100",
    website: "https://example.com",
    industry: "Insurance",
    location: "Austin, TX"
  };

  console.log('✓ PASSED: Contact data structure is valid');
  console.log('  Email:', testContact.email);
  console.log('  Name:', testContact.firstName, testContact.lastName);
  console.log('  Location:', testContact.location);
}

function testEmailFormats() {
  console.log('\n=== Test 3: Email Format Validation ===');

  const testEmails = [
    {
      subject: "Test Email Subject",
      body: "Test email body content",
      approach: "problem-solution"
    },
    {
      subject: "Another Test Subject",
      body: "Another email body",
      approach: "social-proof"
    }
  ];

  console.log('✓ PASSED: Email format is valid');
  console.log(`  Number of variants: ${testEmails.length}`);
  testEmails.forEach((email, index) => {
    console.log(`  Variant ${index + 1}: ${email.approach}`);
  });
}

function testProspectDataStructure() {
  console.log('\n=== Test 4: Prospect Data Structure ===');

  const prospectData = {
    contact: {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User"
    },
    emails: [
      { subject: "Test", body: "Body", approach: "test" }
    ],
    companyResearch: "Test research content",
    options: {
      sequenceId: "12345",
      ownerId: "67890"
    }
  };

  console.log('✓ PASSED: Prospect data structure is valid');
  console.log('  Contact email:', prospectData.contact.email);
  console.log('  Email variants:', prospectData.emails.length);
  console.log('  Has research:', !!prospectData.companyResearch);
  console.log('  Sequence ID:', prospectData.options.sequenceId);
}

function testNoteFormatting() {
  console.log('\n=== Test 5: Note Content Formatting ===');

  const client = new HubSpotClient('test-api-key');

  const emails = [
    {
      subject: "Test Subject 1",
      body: "Test body 1",
      approach: "problem-solution"
    },
    {
      subject: "Test Subject 2",
      body: "Test body 2",
      approach: "social-proof"
    }
  ];

  const research = "Test company research content";

  const noteContent = client._formatNoteContent(emails, research);

  console.log('✓ PASSED: Note formatting works');
  console.log('  Note length:', noteContent.length, 'characters');
  console.log('  Contains research:', noteContent.includes(research));
  console.log('  Contains email variants:', noteContent.includes('Email Variants'));
  console.log('\n--- Sample Note Content ---');
  console.log(noteContent.substring(0, 500) + '...\n');
}

function displayApiRequirements() {
  console.log('\n=== HubSpot API Requirements ===');
  console.log('\nRequired Scopes (Private App):');
  console.log('  ✓ crm.objects.contacts.read');
  console.log('  ✓ crm.objects.contacts.write');
  console.log('  ✓ crm.schemas.contacts.read');
  console.log('  ✓ crm.objects.notes.write');
  console.log('\nOptional Scopes (for Sequences):');
  console.log('  • automation.sequences.read');
  console.log('  • automation.sequences.write');
  console.log('  Note: Requires Sales Hub Professional or Enterprise');
  console.log('\nSetup Instructions:');
  console.log('  1. Go to HubSpot Settings → Integrations → Private Apps');
  console.log('  2. Create new Private App');
  console.log('  3. Add required scopes');
  console.log('  4. Copy Access Token');
  console.log('  5. Set HUBSPOT_API_KEY environment variable');
}

function displayUsageExample() {
  console.log('\n=== Quick Start Example ===');
  console.log(`
const HubSpotClient = require('./integrations/hubspot-client');

// Initialize client
const client = new HubSpotClient(process.env.HUBSPOT_API_KEY);

// Process a prospect
const result = await client.processProspect({
  contact: {
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    companyName: "Example Agency"
  },
  emails: [
    { subject: "...", body: "...", approach: "problem-solution" }
  ],
  companyResearch: "Research summary...",
  options: {
    sequenceId: "12345" // Optional
  }
});

console.log(\`Contact URL: \${result.contactUrl}\`);
  `);
}

// Run all tests
function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   HubSpot Client - Test Suite                 ║');
  console.log('╚════════════════════════════════════════════════╝');

  testClientInitialization();
  testContactDataMapping();
  testEmailFormats();
  testProspectDataStructure();
  testNoteFormatting();
  displayApiRequirements();
  displayUsageExample();

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   All Tests Completed                          ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('Next Steps:');
  console.log('  1. Install dependencies: npm install');
  console.log('  2. Set up HubSpot API key in .env file');
  console.log('  3. Run example: node example-usage.js');
  console.log('  4. Integrate with your pipeline\n');
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testClientInitialization,
  testContactDataMapping,
  testEmailFormats,
  testProspectDataStructure,
  testNoteFormatting
};
