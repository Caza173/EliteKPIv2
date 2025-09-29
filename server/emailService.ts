import sgMail from '@sendgrid/mail';

// Initialize SendGrid only if the API key is available
console.log('🔐 SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('🔐 SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length);
console.log('🔐 SENDGRID_API_KEY starts with SG.:', process.env.SENDGRID_API_KEY?.startsWith('SG.'));

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key not configured. Please add SENDGRID_API_KEY to your .env file');
      return false;
    }

    if (process.env.SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY_HERE') {
      console.error('❌ Please replace the placeholder SENDGRID_API_KEY with your actual SendGrid API key');
      return false;
    }

    console.log(`📧 Attempting to send email to: ${params.to}`);
    await sgMail.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    
    console.log('✅ Email sent successfully via SendGrid');
    return true;
  } catch (error: any) {
    console.error('❌ SendGrid email error:', error);
    if (error.response) {
      console.error('❌ SendGrid response:', error.response.body);
    }
    return false;
  }
}

export function generateReportEmail(reportData: any, reportType: string): { subject: string; html: string; text: string } {
  const { properties, commissions, expenses, timeEntries, mileageLogs } = reportData;
  
  const totalRevenue = (commissions || []).reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0);
  const totalExpenses = (expenses || []).reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0);
  const mileageGasCosts = (mileageLogs || []).reduce((total: number, log: any) => total + parseFloat(log.gasCost || '0'), 0);
  const totalExpensesWithMileage = totalExpenses + mileageGasCosts;
  const closedProperties = (properties || []).filter((p: any) => p.status === 'closed').length;
  const totalHours = (timeEntries || []).reduce((sum: number, t: any) => sum + parseFloat(t.hours || '0'), 0);
  const netProfit = totalRevenue - totalExpensesWithMileage;

  const subject = `EliteKPI ${reportType} Report - ${new Date().toLocaleDateString()}`;
  
  const text = `
EliteKPI ${reportType} Report
Generated: ${new Date().toLocaleDateString()}

PERFORMANCE SUMMARY
===================
Total Revenue: $${totalRevenue.toLocaleString()}
Total Expenses: $${totalExpensesWithMileage.toLocaleString()}
Net Profit: $${netProfit.toLocaleString()}
Properties Closed: ${closedProperties}
Total Hours Worked: ${totalHours.toFixed(1)}

COMMISSION BREAKDOWN
===================
${(commissions || []).map((c: any) => 
  `${new Date(c.dateEarned).toLocaleDateString()}: $${parseFloat(c.amount || '0').toLocaleString()} (${c.type})`
).join('\n')}

EXPENSE BREAKDOWN
================
${(expenses || []).map((e: any) => 
  `${new Date(e.date).toLocaleDateString()}: $${parseFloat(e.amount || '0').toLocaleString()} (${e.category})`
).join('\n')}

TIME TRACKING
=============
${(timeEntries || []).map((t: any) => 
  `${new Date(t.date).toLocaleDateString()}: ${parseFloat(t.hours || '0').toFixed(1)}h (${t.activity})`
).join('\n')}

This report was generated automatically by EliteKPI.
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .summary { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 12px; color: #64748b; }
        .section { margin: 20px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: bold; }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>EliteKPI ${reportType} Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="summary">
        <div class="metric">
          <div class="metric-value">$${totalRevenue.toLocaleString()}</div>
          <div class="metric-label">Total Revenue</div>
        </div>
        <div class="metric">
          <div class="metric-value">$${totalExpensesWithMileage.toLocaleString()}</div>
          <div class="metric-label">Total Expenses</div>
        </div>
        <div class="metric">
          <div class="metric-value ${netProfit >= 0 ? 'positive' : 'negative'}">$${netProfit.toLocaleString()}</div>
          <div class="metric-label">Net Profit</div>
        </div>
        <div class="metric">
          <div class="metric-value">${closedProperties}</div>
          <div class="metric-label">Properties Closed</div>
        </div>
        <div class="metric">
          <div class="metric-value">${totalHours.toFixed(1)}</div>
          <div class="metric-label">Hours Worked</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Recent Commissions</div>
        <table>
          <thead>
            <tr><th>Date</th><th>Amount</th><th>Type</th><th>Rate</th></tr>
          </thead>
          <tbody>
            ${(commissions || []).slice(0, 10).map((c: any) => `
              <tr>
                <td>${new Date(c.dateEarned).toLocaleDateString()}</td>
                <td>$${parseFloat(c.amount || '0').toLocaleString()}</td>
                <td>${c.type.replace('_', ' ')}</td>
                <td>${parseFloat(c.commissionRate || '0').toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Recent Expenses</div>
        <table>
          <thead>
            <tr><th>Date</th><th>Amount</th><th>Category</th><th>Description</th></tr>
          </thead>
          <tbody>
            ${(expenses || []).slice(0, 10).map((e: any) => `
              <tr>
                <td>${new Date(e.date).toLocaleDateString()}</td>
                <td>$${parseFloat(e.amount || '0').toLocaleString()}</td>
                <td>${e.category.replace('_', ' ')}</td>
                <td>${e.description || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>This report was generated automatically by EliteKPI.<br/>
        Visit your dashboard for real-time updates and detailed analytics.</p>
      </div>
    </body>
    </html>
  `;

  return { subject, html, text };
}