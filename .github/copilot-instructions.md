# GitHub Copilot Instructions for Seattle Schools Tracker

## Overview

This tool tracks student grades and assignments from Seattle Public Schools PowerSchool portal using web-pilot browser automation.

## Automated Workflow

When user asks to track their kids' school (phrases like "Help me track my kids' school", "Check my kids' grades in Seattle", "Seattle school homework tracker"):

### Step 1: Check Setup

```powershell
# Check if npm packages installed
Test-Path node_modules
```

If not: `npm install`

### Step 2: Profile Setup (First Time Only)

```powershell
# Check if profile is configured
Test-Path .web-pilot-prefs.json
```

If file doesn't exist:
```powershell
npm run setup
```
Wait for user to select their browser profile.

### Step 3: Start Web-Pilot in Background

```powershell
npm run start
```

This runs web-pilot with `--background` flag pointing to Seattle Public Schools PowerSchool.

**Tell user:**
> "A browser window has opened to Seattle Public Schools PowerSchool. Please log in, then type 'ready' when you're logged in."

### Step 4: Detect Students

Once user says "ready":

```powershell
Set-Content -Path command.txt -Value "text"
Start-Sleep -Seconds 3
$page = Get-Content result.txt -Raw
```

Parse student names from the page (look for student selector/links like "Leif" "Santiago" etc.)

**Tell user:**
> "I found X students in your account. I'll create a folder for each student to track their progress."

### Step 5: Create Student Folders

For each detected student:
```powershell
$studentName = "StudentName"  # detected from page
$folderName = $studentName.ToLower() -replace '\s+','-'
New-Item -ItemType Directory -Path $folderName -Force
```

### Step 6: Capture Grades for Each Student

For each student:

1. **Switch to student:**
```powershell
Set-Content -Path command.txt -Value "click:$studentName"
Start-Sleep -Seconds 3
```

2. **Navigate to grades:**
```powershell
Set-Content -Path command.txt -Value "goto:https://ps.seattleschools.org/guardian/scores.html"
Start-Sleep -Seconds 4
```

3. **Capture page text:**
```powershell
Set-Content -Path command.txt -Value "text"
Start-Sleep -Seconds 3
$gradesText = Get-Content result.txt -Raw
```

4. **Parse grades:**
Extract from text:
- Course names (LANGUAGE ARTS, MATHEMATICS, SCIENCE, etc.)
- Q1, Q2, S1 grades (look for patterns like "B 83", "C- 71")
- Teacher names (Email links)
- Absences and tardies

5. **Create snapshot:**
```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$snapshotPath = "$folderName/$date.md"
```

Format snapshot as markdown with:
- Student name and grade level
- Current grades table (Course | Grade | Teacher)
- Attendance summary
- Action items (missing assignments, low grades)

### Step 7: Show Results

```powershell
Write-Host "`n✅ SUCCESS! Created snapshots for all students"
Get-ChildItem -Directory | Where-Object { $_.Name -ne 'node_modules' } | ForEach-Object {
    $snapshots = Get-ChildItem $_.FullName -Filter "*.md"
    Write-Host "`n📁 $($_.Name):"
    Write-Host "   Snapshots: $($snapshots.Count)"
    if ($snapshots.Count -gt 0) {
        $latest = $snapshots | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-Host "   Latest: $($latest.Name)"
    }
}
```

**Tell user:**
> "🎉 Your kids' school data has been captured!
>
> Each student has their own folder with a dated snapshot of:
> - Current grades
> - Teacher information
> - Attendance
> - Action items
>
> Next time, just say 'Create new snapshots' and I'll update them!"

## Subsequent Runs

When user asks to "Create new snapshots" or "Update grades":

1. Start web-pilot: `npm run start`
2. Wait for "ready"
3. For each existing student folder:
   - Switch to that student
   - Capture grades
   - Compare with previous snapshot
   - Note changes (grade increases/decreases)
   - Create new dated snapshot

## Important Notes

### Seattle Public Schools Specifics
- URL: https://ps.seattleschools.org
- Portal: PowerSchool
- Student selector is usually in top navigation
- Grades page shows Q1, Q2, S1, Q3, Q4, S2 columns
- Format: "B 83" means B grade with 83%

### Grade Detail Navigation
To see assignment details:
```powershell
Set-Content -Path command.txt -Value "click:CourseNameOrGrade"
Start-Sleep -Seconds 4
Set-Content -Path command.txt -Value "text"
Start-Sleep -Seconds 3
$assignments = Get-Content result.txt -Raw
```

Parse assignment categories, due dates, scores, and flags.

### Pronouns
- Always use neutral language when referring to students
- Let user specify pronouns if needed
- Default to they/them

### Data Privacy
- Never commit actual student folders to git
- .gitignore excludes all student data
- Only template/example files should be in repo

---

Web-pilot is self-documenting - trust its output and error messages to guide users through any issues.
