const { chromium } = require('playwright');

(async () => {
  // Connect to existing browser or launch new one
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the PowerSchool page (should redirect to grades if already logged in)
  await page.goto('https://ps.seattleschools.org/guardian/scores.html?frn=00465279747&begdate=11/06/2025&enddate=01/27/2026&fg=Q2&schoolid=106');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `screenshot-${timestamp}.png`, fullPage: true });
  console.log(`Screenshot saved: screenshot-${timestamp}.png`);
  
  // Get page text
  const text = await page.evaluate(() => document.body.innerText);
  require('fs').writeFileSync('page-content.txt', text);
  console.log('Page content saved to page-content.txt');
  
  // Extract any tables
  const tableData = await page.evaluate(() => {
    const tables = [];
    document.querySelectorAll('table').forEach((table, i) => {
      const rows = [];
      table.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td, th').forEach(cell => {
          cells.push(cell.innerText.trim());
        });
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 0) tables.push(rows);
    });
    return tables;
  });
  
  require('fs').writeFileSync('tables.json', JSON.stringify(tableData, null, 2));
  console.log('Table data saved to tables.json');
  
  console.log('\n--- Page Content Preview ---');
  console.log(text.substring(0, 2000));
  
  // Keep browser open
  console.log('\nBrowser will stay open. Press Ctrl+C to close.');
  await new Promise(() => {}); // Keep running
})();
