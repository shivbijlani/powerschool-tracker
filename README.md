# PowerSchool Tracker

Track student grades and assignments from PowerSchool using automated browser control powered by GitHub Copilot.

## 🚀 Quick Start

**Just want to get started?** See [QUICKSTART.md](QUICKSTART.md)

### For Copilot Users (Recommended)

1. Clone this repo and open in VS Code
2. Press `Ctrl+Alt+I` to open Copilot Chat
3. Type: **"Help me track my kids' school using PowerSchool"**
4. Copilot handles everything!

### Manual Setup

```bash
git clone https://github.com/shivbijlani/powerschool-tracker.git
cd powerschool-tracker
npm install
npm run setup    # Select your browser profile
npm run start    # Opens PowerSchool, log in and type 'ready'
```

## How It Works

This tool uses **web-pilot** (browser automation) with a **file mailbox pattern**:

```
You ← Copilot ← web-pilot (files) ← Browser ← PowerSchool
```

1. You ask Copilot to check grades
2. Copilot sends commands via `command.txt`
3. Web-pilot executes in browser
4. Results written to `result.txt`
5. Copilot reads and reports back

## Features

- ✅ **Automatic student detection** - Discovers all students in your account
- ✅ **Dynamic folder creation** - One folder per student
- ✅ **Dated snapshots** - Track changes over time
- ✅ **Grade trends** - See improvements and declines
- ✅ **Attendance tracking** - Monitor absences and tardies
- ✅ **Assignment details** - Click into courses for specifics
- ✅ **Privacy-first** - Student data never leaves your machine

## Project Structure

```
powerschool-tracker/
├── student-name/          # Created dynamically for each student
│   ├── 2026-01-20.md     # Today's snapshot
│   └── 2026-01-18.md     # Previous snapshot
├── .github/
│   ├── copilot-instructions.md    # Tells Copilot how to automate
│   └── copilot-constitution.md    # Core principles
├── QUICKSTART.md          # Fast setup guide
├── README.md              # This file
└── package.json           # Dependencies
```

## PowerSchool Compatibility

- **Works with:** Any district using PowerSchool Student Information System
- **Login:** Parent/guardian account
- **Portal URL:** Your district's PowerSchool URL (e.g., `ps.yourdistrict.org`)

This tool automates PowerSchool portals. It's been tested with Seattle Public Schools but should work with any district using PowerSchool.

## What Gets Tracked

Each snapshot includes:

### Grades
- Quarter grades (Q1, Q2, Q3, Q4)
- Semester grades (S1, S2)
- Letter grades and percentages
- Trends (↑ improved, ↓ declined, → same)

### Courses
- Course names
- Teacher names and room numbers
- Email addresses

### Attendance
- Absences per class
- Tardies per class
- Total counts

### Action Items
- Missing assignments
- Low grades needing attention
- Upcoming tests/projects

## Usage Examples

### First Run
```
You: "Help me track my kids' school using PowerSchool"
Copilot: [installs packages, starts browser, waits for login]
You: "ready"
Copilot: [detects students, creates folders, captures snapshots]
```

### Update Snapshots
```
You: "Create new snapshots"
Copilot: [updates all student data, shows changes]
```

### Check Specific Student
```
You: "What are Alex's current grades?"
Copilot: [shows latest snapshot for Alex]
```

### Compare Over Time
```
You: "Has Morgan's math grade improved?"
Copilot: [compares recent snapshots]
```

## Creating New Snapshots

Ask the LLM: **"Create new snapshots for Leif and Santi"**

The LLM will:
1. Navigate to PowerSchool and switch between students
2. Capture current grades for both kids
3. Compare with previous snapshots
4. Create new dated files in `leif/` and `santi/` folders
5. Note any changes, trends, or action items

### Snapshot Naming Convention
- Format: `YYYY-MM-DD.md` (e.g., `2026-01-17.md`)
- Stored in respective folders: `leif/` or `santi/`

## Important Notes

### Pronouns
- **Leif:** it/its
- **Santiago (Santi):** they/them

### PowerSchool URL
- Main portal: https://ps.seattleschools.org/guardian/home.html
- Grades: https://ps.seattleschools.org/guardian/scores.html

### Troubleshooting

**Profile already in use:**
- Close all Edge/Chrome windows before running web-pilot with `--profile`
- Or run without profile: `npx web-pilot` (you'll need to log in manually)

**Web-pilot not responding:**
- Check the terminal where web-pilot is running
- Look for errors or stopped processes
- Restart with the command above

**LLM can't click on specific grades:**
- You may need to manually click in the browser
- Tell the LLM "I clicked it, please continue"
- The LLM will read the result from the file mailbox

## Example Workflow

```
You: "Create new snapshots for both kids"

LLM: [Navigates to PowerSchool]
     [Clicks on Leif, captures grades]
     [Clicks on Santiago, captures grades]
     [Creates leif/2026-01-18.md and santi/2026-01-18.md]
     [Reports changes and action items]

You: "Why did Santi's math grade drop?"

LLM: [Clicks on Santiago's math grade]
     [Reads assignment details]
     [Reports which assignments changed]
```

## Available Commands (for reference)

Commands the LLM can send to web-pilot via `command.txt`:

- **screenshot** - Take a screenshot of the current page
- **text** - Extract all text from the page
- **tables** - Extract tables as JSON
- **html** - Get raw HTML
- **url** - Get current URL
- **title** - Get page title
- **goto:URL** - Navigate to a specific URL
- **click:selector** - Click an element (CSS selector or text)
- **type:selector:text** - Type text into an input field
- **wait:seconds** - Wait for a specified time
- **back** - Go back in browser history
- **forward** - Go forward
- **refresh** - Refresh the page
- **quit** - Close browser and exit

## Files Generated

| File | Purpose |
|------|---------|
| `command.txt` | Commands sent to web-pilot by the LLM |
| `result.txt` | Results returned from web-pilot |
| `screenshot-*.png` | Screenshots when requested |
| `leif/*.md` | Leif's homework snapshots |
| `santi/*.md` | Santiago's homework snapshots |

---

## Teachers Reference

**Leif (Grade 8):**
- Language Arts: Mr. VanderYacht (Grant M) - Room 109
- US History: Mr. Segall (William J) - Room 222
- Science: Ms. Colloton (Jaclyn P) - Room 119
- Math: Ms. Rasp (G N) - Room 216

**Santiago (Grade 6):**
- Math: Ms. Uri (Sarah N) - Room 206
- Science: Mr. Taylor (Ross A) - Room 123
- Language Arts: Ms. Visperas (Crystal) - Room 217
- World History: Mr. Ballinger (Mark M) - Room 107
