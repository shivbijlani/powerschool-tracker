const { chromium } = require('playwright');
const fs = require('fs');

const COMMAND_FILE = 'C:/temp/playwright-login/command.txt';
const RESULT_FILE = 'C:/temp/playwright-login/result.txt';

(async () => {
  console.log('Starting browser...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  
  await page.goto('https://ps.seattleschools.org/guardian/scores.html?frn=00465279747&begdate=11/06/2025&enddate=01/27/2026&fg=Q2&schoolid=106');
  
  console.log('Browser opened! Log in and then commands will be processed.');
  fs.writeFileSync(RESULT_FILE, 'READY - Browser open');
  
  // Clear command file
  try { fs.unlinkSync(COMMAND_FILE); } catch(e) {}
  
  let lastCmd = '';
  
  // Polling loop
  setInterval(async () => {
    try {
      if (!fs.existsSync(COMMAND_FILE)) return;
      
      const cmd = fs.readFileSync(COMMAND_FILE, 'utf-8').trim();
      if (!cmd || cmd === lastCmd) return;
      
      lastCmd = cmd;
      console.log(`Command: ${cmd}`);
      
      let result = '';
      
      if (cmd === 'screenshot') {
        const file = `C:/temp/playwright-login/screen-${Date.now()}.png`;
        await page.screenshot({ path: file, fullPage: true });
        result = `Screenshot: ${file}`;
      } 
      else if (cmd === 'text') {
        const text = await page.evaluate(() => document.body.innerText);
        fs.writeFileSync('C:/temp/playwright-login/page.txt', text);
        result = text;
      }
      else if (cmd === 'tables') {
        const data = await page.evaluate(() => {
          let out = '';
          document.querySelectorAll('table').forEach((t, i) => {
            out += `\n=== TABLE ${i+1} ===\n`;
            t.querySelectorAll('tr').forEach(r => {
              const cells = Array.from(r.querySelectorAll('td,th')).map(c => c.innerText.trim().replace(/\s+/g,' '));
              out += cells.join(' | ') + '\n';
            });
          });
          return out;
        });
        result = data;
      }
      else if (cmd === 'url') {
        result = page.url();
      }
      else if (cmd.startsWith('goto:')) {
        await page.goto(cmd.slice(5).trim(), {waitUntil: 'domcontentloaded'});
        result = 'Navigated to: ' + page.url();
      }
      else if (cmd.startsWith('click:')) {
        await page.click(cmd.slice(6).trim());
        await page.waitForTimeout(1000);
        result = 'Clicked';
      }
      
      fs.writeFileSync(RESULT_FILE, result);
      console.log('Done: ' + cmd);
      
    } catch(e) {
      fs.writeFileSync(RESULT_FILE, 'ERROR: ' + e.message);
      console.error(e.message);
    }
  }, 1000);
  
})();
