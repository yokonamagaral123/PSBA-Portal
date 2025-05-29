// withholdingTaxCalculator.js
// Function to calculate withholding tax based on basic pay and other parameters
// You can expand this logic as needed for your tax brackets

const TAX_BRACKETS = [
  { min: 0, max: 10417, baseTax: 0, rate: 0, lowerLimit: 0 },
  { min: 10417.01, max: 16666.99, baseTax: 0, rate: 0.15, lowerLimit: 10417 },
  { min: 16667, max: 33332.99, baseTax: 937.50, rate: 0.20, lowerLimit: 16667 },
  { min: 33333, max: 83332.99, baseTax: 4270.70, rate: 0.25, lowerLimit: 33333 },
  { min: 83333, max: 333332.99, baseTax: 16770.70, rate: 0.30, lowerLimit: 83333 },
  { min: 333333, max: Infinity, baseTax: 91770.70, rate: 0.35, lowerLimit: 333333 },
];

export function calculateWithholdingTax({ basicPay, totalDeductions }) {
  const taxableIncome = parseFloat(basicPay || 0) - parseFloat(totalDeductions || 0);
  let withholdingTax = 0;
  // Debug log for troubleshooting
  // eslint-disable-next-line no-console
  console.log('TAX DEBUG:', { basicPay, totalDeductions, taxableIncome });
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome > parseFloat(bracket.min) && taxableIncome <= parseFloat(bracket.max)) {
      withholdingTax = bracket.baseTax + (taxableIncome - bracket.lowerLimit) * bracket.rate;
      // eslint-disable-next-line no-console
      console.log('TAX BRACKET:', bracket, 'WithholdingTax:', withholdingTax);
      break;
    }
  }
  return withholdingTax > 0 ? withholdingTax.toFixed(2) : '0.00';
}
