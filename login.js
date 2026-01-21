const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,  // Show the browser window
    slowMo: 100       // Slow down for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the PowerSchool page
  await page.goto('https://ps.seattleschools.org/guardian/scores.html?frn=00465279747&begdate=11/06/2025&enddate=01/27/2026&fg=Q2&schoolid=106');
  
  console.log('Browser opened. Please enter your credentials manually.');
  console.log('The script will wait for you to login...');
  console.log('Press Enter in this terminal when you are ready to continue...');
  
  // Wait for user input in terminal
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('Continuing... What would you like to do next?');
  
  // Keep browser open - you can add more actions here
  // await browser.close();
})();
