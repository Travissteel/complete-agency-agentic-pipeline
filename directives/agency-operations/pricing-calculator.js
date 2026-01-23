/**
 * AI Agency Pricing Calculator
 *
 * Purpose: Calculate project pricing for AI automation services
 * Usage: Can be used in proposals, quotes, or internal planning
 *
 * Author: Travis
 * Version: 1.0
 * Last Updated: January 2026
 */

// ========================================
// BASE PRICING PACKAGES
// ========================================

const PACKAGES = {
  STARTER: {
    name: 'Starter',
    setupFee: 3500,
    monthlyFee: 500,
    supportHours: 5,
    features: [
      '1 custom AI agent or automation pipeline',
      'Integration with 2-3 existing tools',
      '2 weeks implementation',
      '5 hours/month support',
      'Email/Slack support (48-hour response)'
    ],
    description: 'Best for single workflow automation'
  },
  GROWTH: {
    name: 'Growth',
    setupFee: 7500,
    monthlyFee: 1200,
    supportHours: 10,
    features: [
      '3 custom AI agents or automation pipelines',
      'Integration with 5+ existing tools',
      '4 weeks implementation',
      '10 hours/month support',
      'Priority email/Slack support (24-hour response)',
      'Monthly optimization call'
    ],
    description: 'Best for multi-workflow automation suite'
  },
  ENTERPRISE: {
    name: 'Enterprise',
    setupFee: 15000,
    monthlyFee: 2500,
    supportHours: 20,
    features: [
      'Unlimited automation workflows',
      'Full tech stack integration',
      '8 weeks implementation',
      '20 hours/month support',
      'Phone/Slack support (4-hour response)',
      'Weekly strategy calls',
      'Quarterly roadmap planning'
    ],
    description: 'Best for company-wide AI transformation'
  }
};

// ========================================
// A LA CARTE SERVICES
// ========================================

const A_LA_CARTE = {
  additionalAgent: {
    name: 'Additional AI Agent',
    price: 2000,
    description: 'Add another AI agent to existing system'
  },
  toolIntegrationSimple: {
    name: 'Simple Tool Integration',
    price: 500,
    description: 'Connect to standard API (e.g., HubSpot, Zapier)'
  },
  toolIntegrationComplex: {
    name: 'Complex Tool Integration',
    price: 1500,
    description: 'Connect to legacy system or custom API'
  },
  customDashboard: {
    name: 'Custom Reporting Dashboard',
    price: 1500,
    description: 'Build interactive analytics dashboard'
  },
  emergencySupport: {
    name: 'Emergency Support (Same-Day)',
    price: 300,
    unit: 'per hour',
    description: 'After-hours or same-day urgent support'
  },
  trainingSession: {
    name: 'Training Session',
    price: 200,
    unit: 'per hour',
    description: 'Additional training beyond onboarding'
  },
  processAudit: {
    name: 'Process Audit & Roadmap',
    price: 1000,
    description: 'Analyze workflows and create automation roadmap'
  }
};

// ========================================
// COMPLEXITY MULTIPLIERS
// ========================================

const MULTIPLIERS = {
  highSecurity: {
    name: 'High Security/Compliance Requirements',
    multiplier: 1.25,
    description: 'HIPAA, SOC2, or other compliance needs'
  },
  legacySystems: {
    name: 'Legacy System Integrations',
    multiplier: 1.30,
    description: 'Connecting to older or poorly documented systems'
  },
  realTime: {
    name: 'Real-Time Processing',
    multiplier: 1.20,
    description: 'Sub-second response time requirements'
  },
  multiLanguage: {
    name: 'Multi-Language Support',
    multiplier: 1.15,
    description: 'Support for multiple languages in AI agents'
  }
};

// ========================================
// VOLUME DISCOUNTS
// ========================================

const DISCOUNTS = {
  prepay6Months: {
    name: '6-Month Prepay',
    discount: 0.10,
    description: '10% off monthly fees'
  },
  prepay12Months: {
    name: '12-Month Prepay',
    discount: 0.20,
    description: '20% off monthly fees'
  },
  referralCredit: {
    name: 'Referral Credit',
    discount: 500,
    type: 'fixed',
    description: '$500 credit when referral becomes client'
  }
};

// ========================================
// CORE FUNCTIONS
// ========================================

/**
 * Calculate package price with optional complexity multipliers
 *
 * @param {string} packageName - 'STARTER', 'GROWTH', or 'ENTERPRISE'
 * @param {object} options - Configuration options
 * @param {array} options.multipliers - Array of multiplier keys (e.g., ['highSecurity', 'legacySystems'])
 * @param {number} options.additionalAgents - Number of additional agents beyond package
 * @param {array} options.integrations - Array of integration types (e.g., ['simple', 'complex'])
 * @param {boolean} options.customDashboard - Include custom dashboard
 * @returns {object} Price breakdown
 */
function calculatePackagePrice(packageName, options = {}) {
  const pkg = PACKAGES[packageName];

  if (!pkg) {
    throw new Error(`Invalid package name: ${packageName}`);
  }

  let setupFee = pkg.setupFee;
  let monthlyFee = pkg.monthlyFee;
  let breakdown = [];

  // Base package
  breakdown.push({
    item: `${pkg.name} Package (Base)`,
    setup: pkg.setupFee,
    monthly: pkg.monthlyFee
  });

  // Apply complexity multipliers to setup fee
  if (options.multipliers && options.multipliers.length > 0) {
    let totalMultiplier = 1;
    options.multipliers.forEach(key => {
      const mult = MULTIPLIERS[key];
      if (mult) {
        totalMultiplier *= mult.multiplier;
        breakdown.push({
          item: mult.name,
          setup: 0,
          monthly: 0,
          note: `${((mult.multiplier - 1) * 100).toFixed(0)}% increase on setup`
        });
      }
    });
    setupFee *= totalMultiplier;
  }

  // Add additional agents
  if (options.additionalAgents && options.additionalAgents > 0) {
    const agentCost = A_LA_CARTE.additionalAgent.price * options.additionalAgents;
    setupFee += agentCost;
    breakdown.push({
      item: `Additional AI Agents (${options.additionalAgents})`,
      setup: agentCost,
      monthly: 0
    });
  }

  // Add integrations
  if (options.integrations && options.integrations.length > 0) {
    options.integrations.forEach(type => {
      if (type === 'simple') {
        setupFee += A_LA_CARTE.toolIntegrationSimple.price;
        breakdown.push({
          item: A_LA_CARTE.toolIntegrationSimple.name,
          setup: A_LA_CARTE.toolIntegrationSimple.price,
          monthly: 0
        });
      } else if (type === 'complex') {
        setupFee += A_LA_CARTE.toolIntegrationComplex.price;
        breakdown.push({
          item: A_LA_CARTE.toolIntegrationComplex.name,
          setup: A_LA_CARTE.toolIntegrationComplex.price,
          monthly: 0
        });
      }
    });
  }

  // Add custom dashboard
  if (options.customDashboard) {
    setupFee += A_LA_CARTE.customDashboard.price;
    breakdown.push({
      item: A_LA_CARTE.customDashboard.name,
      setup: A_LA_CARTE.customDashboard.price,
      monthly: 0
    });
  }

  return {
    package: pkg.name,
    setupFee: Math.round(setupFee),
    monthlyFee: Math.round(monthlyFee),
    breakdown,
    supportHours: pkg.supportHours,
    features: pkg.features
  };
}

/**
 * Calculate discounted pricing based on prepayment or referrals
 *
 * @param {number} monthlyFee - Base monthly fee
 * @param {string} discountType - 'prepay6Months', 'prepay12Months', or 'referralCredit'
 * @returns {object} Discount details
 */
function calculateDiscount(monthlyFee, discountType) {
  const discount = DISCOUNTS[discountType];

  if (!discount) {
    throw new Error(`Invalid discount type: ${discountType}`);
  }

  if (discount.type === 'fixed') {
    return {
      name: discount.name,
      discountAmount: discount.discount,
      newMonthlyFee: monthlyFee,
      savings: discount.discount,
      description: discount.description
    };
  }

  const discountAmount = monthlyFee * discount.discount;
  const newMonthlyFee = monthlyFee - discountAmount;

  let totalSavings = discountAmount;
  if (discountType.includes('6Months')) {
    totalSavings *= 6;
  } else if (discountType.includes('12Months')) {
    totalSavings *= 12;
  }

  return {
    name: discount.name,
    discountPercent: discount.discount * 100,
    discountAmount: Math.round(discountAmount),
    newMonthlyFee: Math.round(newMonthlyFee),
    totalSavings: Math.round(totalSavings),
    description: discount.description
  };
}

/**
 * Calculate ROI based on time savings
 *
 * @param {number} hoursPerWeekSaved - Hours saved per week by automation
 * @param {number} hourlyRate - Client's loaded hourly cost (salary + overhead)
 * @param {number} setupFee - One-time setup cost
 * @param {number} monthlyFee - Ongoing monthly cost
 * @returns {object} ROI analysis
 */
function calculateROI(hoursPerWeekSaved, hourlyRate, setupFee, monthlyFee) {
  const weeklySavings = hoursPerWeekSaved * hourlyRate;
  const monthlySavings = weeklySavings * 4.33; // Average weeks per month
  const annualSavings = monthlySavings * 12;

  const firstYearCost = setupFee + (monthlyFee * 12);
  const firstYearNetSavings = annualSavings - firstYearCost;
  const breakEvenMonths = firstYearCost / monthlySavings;

  const subsequentYearCost = monthlyFee * 12;
  const subsequentYearNetSavings = annualSavings - subsequentYearCost;

  return {
    weeklySavings: Math.round(weeklySavings),
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    firstYearCost: Math.round(firstYearCost),
    firstYearNetSavings: Math.round(firstYearNetSavings),
    firstYearROI: Math.round((firstYearNetSavings / firstYearCost) * 100),
    breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
    subsequentYearCost: Math.round(subsequentYearCost),
    subsequentYearNetSavings: Math.round(subsequentYearNetSavings),
    subsequentYearROI: Math.round((subsequentYearNetSavings / subsequentYearCost) * 100)
  };
}

/**
 * Generate full proposal pricing summary
 *
 * @param {string} packageName - Package name
 * @param {object} packageOptions - Options for package calculation
 * @param {object} roiParams - ROI calculation parameters
 * @param {string} discountType - Optional discount to apply
 * @returns {object} Complete proposal pricing
 */
function generateProposal(packageName, packageOptions = {}, roiParams = null, discountType = null) {
  const pricing = calculatePackagePrice(packageName, packageOptions);

  let discount = null;
  let finalMonthlyFee = pricing.monthlyFee;

  if (discountType) {
    discount = calculateDiscount(pricing.monthlyFee, discountType);
    finalMonthlyFee = discount.newMonthlyFee;
  }

  let roi = null;
  if (roiParams) {
    roi = calculateROI(
      roiParams.hoursPerWeekSaved,
      roiParams.hourlyRate,
      pricing.setupFee,
      finalMonthlyFee
    );
  }

  return {
    pricing,
    discount,
    roi,
    summary: {
      setupFee: pricing.setupFee,
      monthlyFee: finalMonthlyFee,
      firstMonthTotal: pricing.setupFee + finalMonthlyFee,
      annualTotal: pricing.setupFee + (finalMonthlyFee * 12)
    }
  };
}

/**
 * Format proposal for display
 *
 * @param {object} proposal - Proposal object from generateProposal
 * @returns {string} Formatted proposal text
 */
function formatProposal(proposal) {
  let output = '';

  output += `\n${'='.repeat(60)}\n`;
  output += `  ${proposal.pricing.package.toUpperCase()} PACKAGE PROPOSAL\n`;
  output += `${'='.repeat(60)}\n\n`;

  // Pricing Breakdown
  output += `PRICING BREAKDOWN:\n`;
  output += `${'-'.repeat(60)}\n`;
  proposal.pricing.breakdown.forEach(item => {
    const setupStr = item.setup > 0 ? `$${item.setup.toLocaleString()}` : '-';
    const monthlyStr = item.monthly > 0 ? `$${item.monthly.toLocaleString()}/mo` : '-';
    output += `${item.item.padEnd(40)} ${setupStr.padStart(10)} ${monthlyStr.padStart(10)}\n`;
    if (item.note) {
      output += `  ${item.note}\n`;
    }
  });
  output += `${'-'.repeat(60)}\n`;
  output += `${'TOTAL'.padEnd(40)} $${proposal.pricing.setupFee.toLocaleString().padStart(10)} $${proposal.pricing.monthlyFee.toLocaleString()}/mo\n\n`;

  // Discount
  if (proposal.discount) {
    output += `DISCOUNT APPLIED:\n`;
    output += `${'-'.repeat(60)}\n`;
    output += `${proposal.discount.name}\n`;
    if (proposal.discount.discountPercent) {
      output += `Savings: ${proposal.discount.discountPercent}% off monthly fee\n`;
    }
    output += `New Monthly Fee: $${proposal.discount.newMonthlyFee.toLocaleString()}/mo\n`;
    if (proposal.discount.totalSavings) {
      output += `Total Savings: $${proposal.discount.totalSavings.toLocaleString()}\n`;
    }
    output += `\n`;
  }

  // Summary
  output += `INVESTMENT SUMMARY:\n`;
  output += `${'-'.repeat(60)}\n`;
  output += `Setup Fee (one-time): $${proposal.summary.setupFee.toLocaleString()}\n`;
  output += `Monthly Fee: $${proposal.summary.monthlyFee.toLocaleString()}/mo\n`;
  output += `First Month Total: $${proposal.summary.firstMonthTotal.toLocaleString()}\n`;
  output += `Annual Total (Year 1): $${proposal.summary.annualTotal.toLocaleString()}\n\n`;

  // ROI
  if (proposal.roi) {
    output += `RETURN ON INVESTMENT:\n`;
    output += `${'-'.repeat(60)}\n`;
    output += `Time Savings: ${proposal.roi.weeklySavings.toLocaleString()} per week → $${proposal.roi.monthlySavings.toLocaleString()}/month\n`;
    output += `Annual Savings: $${proposal.roi.annualSavings.toLocaleString()}\n`;
    output += `Break-Even: ${proposal.roi.breakEvenMonths} months\n`;
    output += `First Year ROI: ${proposal.roi.firstYearROI}%\n`;
    output += `Subsequent Years ROI: ${proposal.roi.subsequentYearROI}%\n`;
    output += `Year 1 Net Savings: $${proposal.roi.firstYearNetSavings.toLocaleString()}\n\n`;
  }

  // Features
  output += `INCLUDED FEATURES:\n`;
  output += `${'-'.repeat(60)}\n`;
  proposal.pricing.features.forEach(feature => {
    output += `  ✓ ${feature}\n`;
  });
  output += `\n`;

  return output;
}

// ========================================
// USAGE EXAMPLES
// ========================================

/**
 * Example 1: Basic STARTER package
 */
function example1_BasicStarter() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 1: Basic STARTER Package');
  console.log('='.repeat(70));

  const proposal = generateProposal('STARTER');
  console.log(formatProposal(proposal));
}

/**
 * Example 2: GROWTH package with custom dashboard and complex integration
 */
function example2_GrowthWithAddons() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 2: GROWTH Package with Add-ons');
  console.log('='.repeat(70));

  const proposal = generateProposal('GROWTH', {
    customDashboard: true,
    integrations: ['complex']
  });
  console.log(formatProposal(proposal));
}

/**
 * Example 3: ENTERPRISE with security requirements and ROI calculation
 */
function example3_EnterpriseWithROI() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 3: ENTERPRISE Package with Security + ROI');
  console.log('='.repeat(70));

  const proposal = generateProposal(
    'ENTERPRISE',
    {
      multipliers: ['highSecurity'],
      additionalAgents: 2,
      integrations: ['simple', 'complex']
    },
    {
      hoursPerWeekSaved: 20,
      hourlyRate: 75
    }
  );
  console.log(formatProposal(proposal));
}

/**
 * Example 4: GROWTH with 12-month prepay discount
 */
function example4_GrowthWith12MonthDiscount() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 4: GROWTH Package with 12-Month Prepay Discount');
  console.log('='.repeat(70));

  const proposal = generateProposal(
    'GROWTH',
    {},
    {
      hoursPerWeekSaved: 15,
      hourlyRate: 60
    },
    'prepay12Months'
  );
  console.log(formatProposal(proposal));
}

/**
 * Example 5: Custom quote for commercial insurance agency
 */
function example5_CommercialInsuranceQuote() {
  console.log('\n' + '='.repeat(70));
  console.log('EXAMPLE 5: Commercial Insurance Agency Custom Quote');
  console.log('='.repeat(70));
  console.log('Scenario: Agency wants lead qualification AI + CRM integration + compliance requirements');
  console.log('Currently spending 12 hours/week on manual lead qualification at $50/hour loaded cost\n');

  const proposal = generateProposal(
    'STARTER',
    {
      multipliers: ['highSecurity'], // Insurance data compliance
      integrations: ['simple'] // CRM integration
    },
    {
      hoursPerWeekSaved: 12,
      hourlyRate: 50
    },
    'prepay6Months'
  );
  console.log(formatProposal(proposal));
}

// ========================================
// EXPORT FOR USE IN OTHER FILES
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PACKAGES,
    A_LA_CARTE,
    MULTIPLIERS,
    DISCOUNTS,
    calculatePackagePrice,
    calculateDiscount,
    calculateROI,
    generateProposal,
    formatProposal
  };
}

// ========================================
// RUN EXAMPLES (if executed directly)
// ========================================

if (require.main === module) {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║              AI AGENCY PRICING CALCULATOR v1.0                     ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  // Run all examples
  example1_BasicStarter();
  example2_GrowthWithAddons();
  example3_EnterpriseWithROI();
  example4_GrowthWith12MonthDiscount();
  example5_CommercialInsuranceQuote();

  console.log('\n' + '='.repeat(70));
  console.log('To use this calculator programmatically:');
  console.log('='.repeat(70));
  console.log(`
const pricing = require('./pricing-calculator.js');

const proposal = pricing.generateProposal('GROWTH', {
  customDashboard: true,
  integrations: ['simple', 'complex']
}, {
  hoursPerWeekSaved: 15,
  hourlyRate: 60
}, 'prepay12Months');

console.log(pricing.formatProposal(proposal));
  `);
  console.log('\n');
}
