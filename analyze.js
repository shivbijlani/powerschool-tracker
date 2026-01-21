const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the PowerSchool page
  await page.goto('https://ps.seattleschools.org/guardian/scores.html?frn=00465279747&begdate=11/06/2025&enddate=01/27/2026&fg=Q2&schoolid=106');
  
  console.log('\n=== PowerSchool Grade Analyzer ===');
  console.log('Browser opened. Please login manually.');
  console.log('\nCommands:');
  console.log('  screenshot - Take a screenshot');
  console.log('  grades - Extract grade data from page');
  console.log('  navigate <url> - Go to a URL');
  console.log('  leif - Navigate to Leif\'s grades');
  console.log('  santiago - Navigate to Santiago\'s grades');
  console.log('  quit - Close browser and exit');
  console.log('');
  
  while (true) {
    const cmd = await prompt('> ');
    const [command, ...args] = cmd.trim().split(' ');
    
    try {
      switch (command.toLowerCase()) {
        case 'screenshot':
        case 's':
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `screenshot-${timestamp}.png`;
          await page.screenshot({ path: filename, fullPage: true });
          console.log(`Screenshot saved: ${filename}`);
          break;
          
        case 'grades':
        case 'g':
          // Try to extract grade information from the page
          const grades = await page.evaluate(() => {
            const data = {
              title: document.title,
              tables: []
            };
            
            // Get all tables
            document.querySelectorAll('table').forEach((table, i) => {
              const rows = [];
              table.querySelectorAll('tr').forEach(tr => {
                const cells = [];
                tr.querySelectorAll('td, th').forEach(cell => {
                  cells.push(cell.innerText.trim());
                });
                if (cells.length > 0) rows.push(cells);
              });
              if (rows.length > 0) data.tables.push(rows);
            });
            
            // Get any grade elements
            const gradeElements = document.querySelectorAll('[class*="grade"], [class*="score"], [class*="percent"]');
            data.gradeElements = Array.from(gradeElements).map(el => el.innerText.trim());
            
            return data;
          });
          console.log('\n--- Grade Data ---');
          console.log(JSON.stringify(grades, null, 2));
          fs.writeFileSync('grades-data.json', JSON.stringify(grades, null, 2));
          console.log('Saved to grades-data.json');
          break;
          
        case 'navigate':
        case 'n':
          const url = args.join(' ');
          if (url) {
            await page.goto(url);
            console.log(`Navigated to: ${url}`);
          } else {
            console.log('Usage: navigate <url>');
          }
          break;
          
        case 'text':
        case 't':
          // Get all visible text from the page
          const text = await page.evaluate(() => document.body.innerText);
          console.log('\n--- Page Text ---');
          console.log(text);
          fs.writeFileSync('page-text.txt', text);
          console.log('\nSaved to page-text.txt');
          break;
          
        case 'html':
        case 'h':
          const html = await page.content();
          fs.writeFileSync('page.html', html);
          console.log('Saved page HTML to page.html');
          break;
          
        case 'quit':
        case 'q':
          console.log('Closing browser...');
          await browser.close();
          rl.close();
          process.exit(0);
          break;
          
        default:
          if (command) {
            console.log(`Unknown command: ${command}`);
            console.log('Commands: screenshot, grades, navigate, text, html, quit');
          }
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
})();
