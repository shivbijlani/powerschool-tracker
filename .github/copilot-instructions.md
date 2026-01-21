# GitHub Copilot Instructions for PowerSchool Tracker

## Overview

This tool tracks student grades and assignments from PowerSchool portals using web-pilot browser automation.

## Automated Workflow

When user asks to track their kids' school (phrases like "Help me track my kids' school using PowerSchool", "Check my kids' grades", "PowerSchool homework tracker"):

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

> "A browser window has opened to your PowerSchool portal. Please log in, then type 'ready' when you're logged in."

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

2. **Navigate to home page (NOT scores.html!):**

```powershell
Set-Content -Path command.txt -Value "goto:https://ps.seattleschools.org/guardian/home.html"
Start-Sleep -Seconds 4
```

3. **Capture page text for overview:**

```powershell
Set-Content -Path command.txt -Value "text"
Start-Sleep -Seconds 3
$gradesText = Get-Content result.txt -Raw
```

4. **Parse overview grades:**
   Extract from text:

- Course names (LANGUAGE ARTS, MATHEMATICS, SCIENCE, etc.)
- Q1, Q2, S1 grades (look for patterns like "B 83", "C- 71")
- Teacher names (Email links)
- Absences and tardies

5. **Deep Dive: Get Assignment Details for Each Class**

**CRITICAL: Follow this method to avoid scores.html errors!**

```powershell
# Get HTML from home page to extract FRN codes
Set-Content -Path command.txt -Value "html"
Start-Sleep -Seconds 3
$html = Get-Content result.txt -Raw

# Extract all grade detail URLs (with frn codes)
$matches = [regex]::Matches($html, 'href="(scores\.html\?frn=\d+[^"]+)"')
$gradeUrls = $matches | ForEach-Object { $_.Groups[1].Value -replace '&amp;', '&' }

# Filter for latest term only (S1, Q2, etc - rightmost column with grades)
# Look at fg parameter: fg=Q1, fg=Q2, fg=S1, fg=Q3, fg=Q4, fg=S2
# For semester system: S1 is usually current in Jan
$latestTermUrls = $gradeUrls | Where-Object { $_ -match 'fg=S1' }

# For each class, get assignment details
foreach ($url in $latestTermUrls) {
    $className = "class"  # Extract from course name in overview
    $classUrl = "https://ps.seattleschools.org/guardian/$url"
    
    Set-Content -Path command.txt -Value "goto:$classUrl"
    Start-Sleep -Seconds 5
    Set-Content -Path command.txt -Value "text"
    Start-Sleep -Seconds 3
    $assignments = Get-Content result.txt -Raw
    
    # Save to file for analysis
    $assignments | Out-File "$folderName/$studentName-$className-assignments.txt"
}
```

6. **Parse Assignment Data:**

For each class, categorize assignments:

**DUE SOON** (within 7 days):
- Check Due Date column
- Flag assignments with dates between today and +7 days
- Note point values

**OVERDUE**:
- Due dates in the past
- Especially flag those with `--` (not graded) or `missing` flag
- Calculate days overdue

**AWAITING GRADES** (Turned in, not graded):
- Score shows `--` but no "missing" flag
- Recent due dates (< 14 days)
- Note point values

**MISSING**:
- Assignments with "missing" flag
- Score shows `--`
- Critical for grade recovery

7. **Create Comprehensive Snapshot:**

```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$snapshotPath = "$folderName/$date.md"
```

Format snapshot as markdown with:

**Section 1: Grade Overview**
- Student name and grade level
- Current grades table (Course | Q1 | Q2 | S1 | Teacher)
- Attendance summary

**Section 2: Assignment Analysis by Class**
For each class:
- Current grade and trend
- Assignments due in next 7 days (with point values)
- Overdue assignments (with days overdue)
- Awaiting grades (turned in but not scored)
- Missing assignments (critical)

**Section 3: Priority Actions**
Rank by impact:
1. **URGENT** (Due tomorrow or overdue + high points)
2. **HIGH** (Due this week + high points)
3. **MEDIUM** (Awaiting grades - follow up with teacher)
4. **LOW** (Small point assignments due soon)

**Section 4: Recommendations**
- What to work on tonight (highest value)
- What to discuss with teachers
- Trends to celebrate (grade improvements)
- Trends to address (declining grades)

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
>
> - Current grades
> - Teacher information
> - Attendance
> - Action items
>
> Next time, just say 'Create new snapshots' or 'Help me track my kids' school using PowerSchool' and I'll update them!"

## Subsequent Runs

When user asks to "Create new snapshots", "Update grades", "Get latest for [student]", or "Check [student]'s grades":

**ALWAYS follow the complete deep-dive workflow:**

1. Start web-pilot (if not running): `npm run start`
2. Wait for "ready" (or verify already logged in)
3. For each student:
   - Switch to that student
   - Navigate to home page (goto:home.html)
   - Capture overview grades
   - Extract FRN codes from HTML
   - Navigate to each class detail page using full URLs
   - Parse assignment data (due soon, overdue, awaiting grades)
   - Compare with previous snapshot (note grade changes)
   - Create new dated snapshot with:
     * Grade overview
     * Assignment analysis by class
     * Priority actions ranked by impact
     * Specific recommendations for tonight/this week

**NEVER skip the assignment deep-dive!** The user needs actionable insights, not just grade numbers.

**Key Success Metrics:**
- ✅ Identified what's due in next 7 days
- ✅ Flagged overdue assignments with days overdue
- ✅ Noted assignments awaiting grades (-- but not missing)
- ✅ Provided specific recommendations on what to work on first
- ✅ Compared to previous snapshot to show trends

## Important Notes

### PowerSchool Portal Specifics

- URL: User's district PowerSchool URL (e.g., ps.districtname.org)
- Portal: PowerSchool Student Information System
- Student selector is usually in top navigation
- Grades page shows Q1, Q2, S1, Q3, Q4, S2 columns
- Format: "B 83" means B grade with 83%

### Grade Detail Navigation - CRITICAL METHOD

**⚠️ CONSTITUTION RULE:**
**NEVER navigate to `scores.html` without full query parameters!**

- Bare scores.html (no frn/fg/dates) = BROKEN PAGE
- If you land there, immediately go back to student home page: `goto:https://ps.seattleschools.org/guardian/home.html`

**❌ DON'T** click grade numbers - leads to scores.html with no query params (broken page)

**✅ DO** extract href URLs from HTML and navigate directly:

1. **Get current student's home page HTML:**

```powershell
Set-Content -Path command.txt -Value "goto:https://ps.seattleschools.org/guardian/home.html"
Start-Sleep -Seconds 4
Set-Content -Path command.txt -Value "html"
Start-Sleep -Seconds 3
$html = Get-Content result.txt -Raw
```

2. **Extract grade URLs for LAST graded term (not hardcoded to S1!):**

```powershell
# Find all grade detail URLs - they have frn codes and fg parameters
$matches = [regex]::Matches($html, 'href="(scores\.html\?frn=\d+[^"]+)"')
$gradeUrls = $matches | ForEach-Object { $_.Groups[1].Value -replace '&amp;', '&' }

# Group by term (Q1, Q2, S1, Q3, Q4, S2) and pick the RIGHTMOST/LATEST term
# DON'T hardcode S1 - find the last column with grades automatically
# Look for pattern: fg=Q1, fg=Q2, fg=S1, fg=Q3, fg=Q4, fg=S2
# The rightmost term with grades is the current one
```

3. **Navigate to each class URL directly:**

```powershell
$classUrl = "https://ps.seattleschools.org/guardian/$($gradeUrls[0])"
Set-Content -Path command.txt -Value "goto:$classUrl"
Start-Sleep -Seconds 5
Set-Content -Path command.txt -Value "text"
Start-Sleep -Seconds 3
$assignments = Get-Content result.txt -Raw
```

**URL Pattern:**
`scores.html?frn=[code]&begdate=MM/DD/YYYY&enddate=MM/DD/YYYY&fg=[TERM]&schoolid=106`

**Key Facts:**

- **fg parameter** = Term code (Q1, Q2, S1, Q3, Q4, S2)
- **LAST GRADED TERM** = Most current grades (find automatically, don't hardcode!)
- **frn code** = Unique per class
- **schoolid** = District-specific (Seattle = 106)
- Must replace `&amp;` with `&` in extracted URLs

**Recovery from scores.html error:**

```powershell
# If you accidentally land on bare scores.html:
Set-Content -Path command.txt -Value "goto:https://ps.seattleschools.org/guardian/home.html"
Start-Sleep -Seconds 4
# Then start over with HTML extraction
```

Parse assignment categories, due dates, scores, and flags from the text output.

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
