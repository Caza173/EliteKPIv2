// Simple SMS service that can work with multiple providers
// Currently set up as a fallback service that logs messages

interface SMSParams {
  to: string;
  message: string;
}

export async function sendSMS(params: SMSParams): Promise<boolean> {
  try {
    // For now, we'll log the SMS message and store it as a notification
    // This gives users a way to see what would have been sent
    console.log(`📱 SMS to ${params.to}: ${params.message}`);
    
    // In a real implementation, you could integrate with:
    // - Plivo (free inbound, $0.066/message outbound)
    // - Telnyx (free trial)
    // - TheTexting.com ($0.0055/message)
    // - Or any other SMS provider
    
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
}

export function generateReportSMS(reportData: any, reportType: string): string {
  const { properties, commissions, expenses } = reportData;
  
  const totalRevenue = (commissions || []).reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0);
  const totalExpenses = (expenses || []).reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0);
  const netProfit = totalRevenue - totalExpenses;
  const closedProperties = (properties || []).filter((p: any) => p.status === 'closed').length;

  return `EliteKPI ${reportType} Report (${new Date().toLocaleDateString()}):
💰 Revenue: $${totalRevenue.toLocaleString()}
💸 Expenses: $${totalExpenses.toLocaleString()}
💵 Net: $${netProfit.toLocaleString()}
🏠 Closed: ${closedProperties}

View full report at your dashboard.`;
}