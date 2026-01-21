const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COMMAND_FILE = 'command.txt';
const RESULT_FILE = 'result.txt';
const SCREENSHOT_DIR = '.';

async function main() {
  console.log('=== PowerSchool Browser Controller ===');
  console.log('Launching browser...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();
  
  // Navigate to the PowerSchool page
  await page.goto('https://ps.seattleschools.org/guardian/scores.html?frn=00465279747&begdate=11/06/2025&enddate=01/27/2026&fg=Q2&schoolid=106');
  
  console.log('Browser opened!');
  console.log('Please log in manually in the browser window.\n');
  console.log('Waiting for commands via command.txt file...');
  console.log('Available commands: screenshot, text, tables, html, navigate:<url>, click:<selector>, wait:<seconds>\n');
  
  // Clear any old command file
  if (fs.existsSync(COMMAND_FILE)) fs.unlinkSync(COMMAND_FILE);
  if (fs.existsSync(RESULT_FILE)) fs.unlinkSync(RESULT_FILE);
  
  // Write ready status
  fs.writeFileSync(RESULT_FILE, 'READY: Browser is open. Please log in.\n');
  
  // Watch for commands
  let lastCommand = '';
  
  while (true) {
    await new Promise(r => setTimeout(r, 500)); // Check every 500ms
    
    try {
      if (!fs.existsSync(COMMAND_FILE)) continue;
      
      const command = fs.readFileSync(COMMAND_FILE, 'utf-8').trim();
      if (!command || command === lastCommand) continue;
      
      lastCommand = command;
      console.log(`\nReceived command: ${command}`);
      
      let result = '';
      
      try {
        if (command === 'screenshot') {
          const timestamp = Date.now();
          const filename = `screenshot-${timestamp}.png`;
          await page.screenshot({ path: filename, fullPage: true });
          result = `SUCCESS: Screenshot saved as ${filename}`;
          console.log(result);
          
        } else if (command === 'text') {
          const text = await page.evaluate(() => document.body.innerText);
          fs.writeFileSync('page-text.txt', text);
          result = `SUCCESS: Page text saved to page-text.txt\n\n--- CONTENT ---\n${text}`;
          console.log('Page text extracted');
          
        } else if (command === 'tables') {
          const tables = await page.evaluate(() => {
            const result = [];
            document.querySelectorAll('table').forEach((table, idx) => {
              const rows = [];
              table.querySelectorAll('tr').forEach(tr => {
                const cells = [];
                tr.querySelectorAll('td, th').forEach(cell => {
                  cells.push(cell.innerText.trim().replace(/\n/g, ' '));
                });
                if (cells.length > 0) rows.push(cells.join(' | '));
              });
              if (rows.length > 0) {
                result.push(`=== TABLE ${idx + 1} ===\n${rows.join('\n')}`);
              }
            });
            return result.join('\n\n');
          });
          fs.writeFileSync('tables.txt', tables);
          result = `SUCCESS: Tables extracted\n\n${tables}`;
          console.log('Tables extracted');
          
        } else if (command === 'html') {
          const html = await page.content();
          fs.writeFileSync('page.html', html);
          result = 'SUCCESS: HTML saved to page.html';
          console.log(result);
          
        } else if (command === 'url') {
          result = `SUCCESS: Current URL is ${page.url()}`;
          console.log(result);
          
        } else if (command.startsWith('navigate:')) {
          const url = command.substring(9).trim();
          await page.goto(url, { waitUntil: 'networkidle' });
          result = `SUCCESS: Navigated to ${url}`;
          console.log(result);
          
        } else if (command.startsWith('click:')) {
          const selector = command.substring(6).trim();
          await page.click(selector);
          await page.waitForLoadState('networkidle');
          result = `SUCCESS: Clicked ${selector}`;
          console.log(result);
          
        } else if (command.startsWith('wait:')) {
          const seconds = parseInt(command.substring(5).trim()) || 2;
          await new Promise(r => setTimeout(r, seconds * 1000));
          result = `SUCCESS: Waited ${seconds} seconds`;
          console.log(result);
          
        } else if (command === 'grades') {
          // Special command to extract grade-specific data
          const gradeData = await page.evaluate(() => {
            const data = {
              title: document.title,
              url: window.location.href,
              studentName: '',
              grades: []
            };
            
            // Try to find student name
            const nameEl = document.querySelector('.student-name, [class*="student"], h1, h2');
            if (nameEl) data.studentName = nameEl.innerText.trim();
            
            // Extract all text that looks like grades
            const text = document.body.innerText;
            data.fullText = text;
            
            return data;
          });
          fs.writeFileSync('grades.json', JSON.stringify(gradeData, null, 2));
          result = `SUCCESS: Grade data extracted\n\nTitle: ${gradeData.title}\nURL: ${gradeData.url}\nStudent: ${gradeData.studentName}\n\n--- FULL PAGE TEXT ---\n${gradeData.fullText}`;
          console.log('Grade data extracted');
          
        } else if (command === 'quit') {
          result = 'SUCCESS: Closing browser...';
          fs.writeFileSync(RESULT_FILE, result);
          await browser.close();
          process.exit(0);
          
        } else {
          result = `ERROR: Unknown command: ${command}`;
          console.log(result);
        }
      } catch (err) {
        result = `ERROR: ${err.message}`;
        console.error(result);
      }
      
      fs.writeFileSync(RESULT_FILE, result);
      
    } catch (err) {
      // Ignore file read errors
    }
  }
}

main().catch(console.error);
