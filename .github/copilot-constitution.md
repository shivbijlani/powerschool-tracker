# GitHub Copilot Constitution for Seattle Schools Tracker

## Core Principles

### 1. Automated Workflow
- Use web-pilot's `--background` flag to run browser automation in the background
- Let web-pilot's self-documenting output guide the user through any setup
- Communicate with web-pilot using the file mailbox pattern (command.txt → result.txt)

### 2. Profile Management
- If `.web-pilot-prefs.json` doesn't exist, run `npm run setup` first
- Let the user select their browser profile once
- All subsequent runs use the saved preference automatically

### 3. Simple User Experience
- User only needs to say: "Help me track my kids' school in Seattle"
- Copilot handles everything else automatically
- User only intervenes to log in to PowerSchool when browser opens

### 4. Dynamic Student Discovery
- Never hardcode student names
- Detect students from PowerSchool interface after login
- Create folders dynamically based on detected students
- Use sanitized folder names (lowercase, no spaces)

### 5. File Mailbox Communication
Commands to web-pilot:
```powershell
Set-Content -Path command.txt -Value "goto:URL"
Start-Sleep -Seconds 2
Get-Content result.txt
```

Click elements:
```powershell
Set-Content -Path command.txt -Value "click:selector"
Start-Sleep -Seconds 2
Get-Content result.txt
```

Extract text:
```powershell
Set-Content -Path command.txt -Value "text"
Start-Sleep -Seconds 3
Get-Content result.txt
```

### 6. Data Privacy
- Never commit student folders to git
- All student data stays local only
- .gitignore protects personal information
- Only generic templates and instructions go in repo

### 7. Incremental Snapshots
- Each run creates a new dated snapshot (YYYY-MM-DD.md)
- Compare with previous snapshots to show trends
- Highlight grade changes, new assignments, attendance issues
- Keep history to track progress over time

### 8. Seattle PowerSchool Specifics
- URL: https://ps.seattleschools.org
- Students are in top navigation (clickable names)
- Grades page shows quarters: Q1, Q2, S1, Q3, Q4, S2
- Grade format: "Letter Percentage" (e.g., "B 83")
- Click grades to see assignment details

---

Web-pilot is self-documenting - trust its output and error messages to guide users through any issues.
