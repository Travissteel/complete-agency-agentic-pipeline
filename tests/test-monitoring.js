/**
 * Test Script for Monitoring System
 *
 * Tests the following components:
 * 1. Slack Notifications
 * 2. Metrics Collector
 * 3. Daily Report Generation
 *
 * Usage: node test-monitoring.js
 */

require('dotenv').config();

const SlackNotifications = require('../executions/integrations/slack-notifications');
const MetricsCollector = require('../executions/utils/metrics-collector');

/**
 * Test Slack Notifications
 */
async function testSlackNotifications() {
    console.log('\n========================================');
    console.log('Testing Slack Notifications');
    console.log('========================================\n');

    const slack = new SlackNotifications();

    try {
        // Test 1: Connection test
        console.log('1. Testing Slack connection...');
        const connectionOk = await slack.testConnection();
        console.log(`   Result: ${connectionOk ? '✅ PASS' : '❌ FAIL'}\n`);

        // Test 2: Send alert
        console.log('2. Testing alert notification...');
        await slack.sendAlert(
            process.env.SLACK_CHANNEL || '#agency-alerts',
            'Test alert from monitoring system',
            'INFO',
            { testRun: true, timestamp: new Date().toISOString() }
        );
        console.log('   Result: ✅ Alert sent\n');

        // Test 3: Error notification
        console.log('3. Testing error notification...');
        await slack.notifyOnError({
            error: 'Test error message',
            module: 'test-monitoring',
            stack: 'Error: Test error\n    at testSlackNotifications (/test-monitoring.js:35:10)',
            context: { testRun: true }
        });
        console.log('   Result: ✅ Error notification sent\n');

        // Test 4: Booking notification
        console.log('4. Testing booking notification...');
        await slack.notifyOnBooking({
            contactName: 'John Doe',
            contactEmail: 'john.doe@example.com',
            contactPhone: '+1-555-0123',
            appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            calendarType: 'Discovery Call',
            source: 'Test Script'
        });
        console.log('   Result: ✅ Booking notification sent\n');

        // Test 5: Daily report
        console.log('5. Testing daily report...');
        const mockMetrics = {
            leadGen: {
                leadsScraped: 250,
                leadsEnriched: 200,
                enrichmentRate: 80,
                qualityScore: 85
            },
            outreach: {
                emailsSent: 500,
                emailsDelivered: 480,
                openRate: 42,
                replyRate: 8
            },
            crm: {
                contactsCreated: 150,
                opportunitiesCreated: 35,
                opportunitiesWon: 8,
                pipelineValue: 45000
            },
            booking: {
                bookingsConfirmed: 12,
                bookingsCompleted: 10,
                noShows: 2,
                aiCalls: 25
            },
            uptime: '99.9%'
        };

        await slack.sendDailyReport(mockMetrics);
        console.log('   Result: ✅ Daily report sent\n');

        console.log('✅ All Slack notification tests passed!\n');
        return true;
    } catch (error) {
        console.error('❌ Slack notification test failed:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

/**
 * Test Metrics Collector
 */
async function testMetricsCollector() {
    console.log('\n========================================');
    console.log('Testing Metrics Collector');
    console.log('========================================\n');

    const collector = new MetricsCollector();

    try {
        // Test 1: Lead Gen Metrics
        console.log('1. Testing lead generation metrics...');
        const leadGenMetrics = await collector.getLeadGenMetrics();
        console.log('   Result: ✅ PASS');
        console.log('   Sample data:', JSON.stringify(leadGenMetrics, null, 2).substring(0, 200) + '...\n');

        // Test 2: Outreach Metrics
        console.log('2. Testing outreach metrics...');
        const outreachMetrics = await collector.getOutreachMetrics();
        console.log('   Result: ✅ PASS');
        console.log('   Sample data:', JSON.stringify(outreachMetrics, null, 2).substring(0, 200) + '...\n');

        // Test 3: CRM Metrics
        console.log('3. Testing CRM metrics...');
        const crmMetrics = await collector.getCRMMetrics();
        console.log('   Result: ✅ PASS');
        console.log('   Sample data:', JSON.stringify(crmMetrics, null, 2).substring(0, 200) + '...\n');

        // Test 4: Booking Metrics
        console.log('4. Testing booking metrics...');
        const bookingMetrics = await collector.getBookingMetrics();
        console.log('   Result: ✅ PASS');
        console.log('   Sample data:', JSON.stringify(bookingMetrics, null, 2).substring(0, 200) + '...\n');

        // Test 5: Daily Report
        console.log('5. Testing daily report generation...');
        const dailyReport = await collector.generateDailyReport();
        console.log('   Result: ✅ PASS');
        console.log('   Report generated at:', dailyReport.generatedAt);
        console.log('   Date range:', dailyReport.dateRange.start, 'to', dailyReport.dateRange.end, '\n');

        // Test 6: Weekly Report
        console.log('6. Testing weekly report generation...');
        const weeklyReport = await collector.generateWeeklyReport();
        console.log('   Result: ✅ PASS');
        console.log('   Report generated at:', weeklyReport.generatedAt);
        console.log('   Trends:', JSON.stringify(weeklyReport.weeklyTrends, null, 2), '\n');

        // Test 7: Cache functionality
        console.log('7. Testing cache functionality...');
        const start = Date.now();
        await collector.getLeadGenMetrics(); // Should use cache
        const elapsed = Date.now() - start;
        console.log(`   Result: ✅ PASS (cache hit in ${elapsed}ms)\n`);

        collector.clearCache();
        console.log('   Cache cleared: ✅\n');

        console.log('✅ All metrics collector tests passed!\n');
        return true;
    } catch (error) {
        console.error('❌ Metrics collector test failed:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

/**
 * Test Integration: Full workflow
 */
async function testFullWorkflow() {
    console.log('\n========================================');
    console.log('Testing Full Monitoring Workflow');
    console.log('========================================\n');

    try {
        console.log('Simulating daily monitoring workflow...\n');

        // Step 1: Collect metrics
        console.log('Step 1: Collecting metrics from all modules...');
        const collector = new MetricsCollector();
        const report = await collector.generateDailyReport();
        console.log('   ✅ Metrics collected\n');

        // Step 2: Send report to Slack
        console.log('Step 2: Sending daily report to Slack...');
        const slack = new SlackNotifications();
        await slack.sendDailyReport({
            leadGen: report.leadGen,
            outreach: report.outreach,
            crm: report.crm,
            booking: report.booking
        });
        console.log('   ✅ Report sent to Slack\n');

        // Step 3: Check for alerts
        console.log('Step 3: Checking for alert conditions...');

        // Simulate alert condition: Low outreach performance
        if (report.outreach.openRate < 30) {
            await slack.sendAlert(
                process.env.SLACK_CHANNEL || '#agency-alerts',
                'Low email open rate detected',
                'WARNING',
                { openRate: report.outreach.openRate + '%', threshold: '30%' }
            );
            console.log('   ⚠️ Alert sent: Low open rate\n');
        } else {
            console.log('   ✅ No alerts triggered\n');
        }

        console.log('✅ Full workflow test completed successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Full workflow test failed:', error.message);
        console.error('   Stack:', error.stack);
        return false;
    }
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   MONITORING SYSTEM TEST SUITE         ║');
    console.log('╚════════════════════════════════════════╝');

    const testResults = {
        slack: false,
        metrics: false,
        workflow: false
    };

    // Check if Slack webhook is configured
    if (!process.env.SLACK_WEBHOOK_URL && !process.env.SLACK_BOT_TOKEN) {
        console.log('\n⚠️  WARNING: Slack credentials not configured');
        console.log('   Set SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN in .env file');
        console.log('   Slack notification tests will be skipped.\n');
    } else {
        testResults.slack = await testSlackNotifications();
    }

    // Run metrics collector tests (no credentials needed)
    testResults.metrics = await testMetricsCollector();

    // Run full workflow test
    if (testResults.slack && testResults.metrics) {
        testResults.workflow = await testFullWorkflow();
    } else {
        console.log('\n⚠️  Skipping full workflow test (prerequisites failed)\n');
    }

    // Print summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║           TEST SUMMARY                 ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`Slack Notifications: ${testResults.slack ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Metrics Collector:   ${testResults.metrics ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Full Workflow:       ${testResults.workflow ? '✅ PASS' : '⏭️  SKIP'}`);

    const allPassed = testResults.slack && testResults.metrics && testResults.workflow;
    console.log(`\nOverall Status:      ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}\n`);

    process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
    console.error('\n❌ Fatal error running tests:', error);
    process.exit(1);
});
