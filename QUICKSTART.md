# Quick Start Guide - Seattle Schools Tracker

## For First-Time Users

### Step 1: Get the Code
```bash
git clone https://github.com/shivbijlani/seattle-schools-tracker.git
cd seattle-schools-tracker
code .
```

### Step 2: Ask Copilot
Once VS Code opens:
1. Press `Ctrl+Alt+I` (or `Cmd+Alt+I` on Mac) to open Copilot Chat
2. Type: **"Help me track my kids' school in Seattle"**
3. Follow Copilot's instructions!

### What Copilot Will Do
1. Install npm packages
2. Start web-pilot browser automation
3. Open Seattle Public Schools PowerSchool in browser
4. Ask you to log in
5. Detect your students automatically
6. Create a folder for each student
7. Capture grades, assignments, attendance
8. Create dated snapshots for tracking progress

### Expected Outcome
You'll get folders for each student with snapshots like:
```
student-name/
├── 2026-01-20.md     # Today's snapshot
└── 2026-01-18.md     # Previous snapshot
```

Each snapshot includes:
- Current grades (Q1, Q2, S1, etc.)
- Teacher information
- Attendance summary
- Action items (missing assignments, low grades)

## Next Time

Just open the project and ask Copilot:
- **"Create new snapshots"** - Updates all students
- **"Check [student name]'s grades"** - View specific student
- **"What assignments are due?"** - Check homework
- **"Show grade trends"** - Compare with previous snapshots

## Manual Method (Advanced)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Browser Profile (First Time)
```bash
npm run setup
```
*Close all browser windows first, then select your browser profile*

### 3. Start Tracking
```bash
npm run start
```

### 4. Log Into PowerSchool
- Browser opens to: https://ps.seattleschools.org
- Log in with your credentials
- Type "ready" in the terminal

### 5. Done!
Copilot will handle the rest automatically.

## Troubleshooting

### "Profile in use" error
**Close all browser windows** before running web-pilot

### Can't find students
Make sure you're logged in and on the grades page

### Grades not parsing correctly
Check that you're using Seattle Public Schools PowerSchool (ps.seattleschools.org)

## What's Next?

### Track Over Time
Run weekly or daily to build a history of:
- Grade improvements/declines
- Assignment completion
- Attendance patterns
- Teacher feedback

### Share with Family
Export snapshots to share with co-parents, tutors, or the students themselves

### Customize
Edit `.github/copilot-instructions.md` to:
- Add specific grading concerns
- Focus on certain subjects
- Include additional data points

## Need Help?
- Check [README.md](README.md) for detailed documentation
- Open an issue on GitHub
- Ask Copilot for clarification!

---

**Happy tracking! 📚**
