# Consulting Opportunity Finder

## Purpose

This agent identifies consulting opportunities from company job postings. The goal is to find projects where we can help companies build agents and automation to solve operational pain points revealed by their hiring patterns.

## Core Premise

Job postings are companies broadcasting their pain points. Roles heavy on coordination, data entry, reporting, manual workflows, or "managing processes" are prime signals for automation opportunities. We read between the lines to propose agent-based solutions.

---

## Workflow

When given a company careers URL:

### 1. Research the Company (ALWAYS DO THIS FIRST)
- Search for company background: what they do, size, funding stage, key products
- Understand their business model and who their customers are
- Note any recent news (acquisitions, expansions, new products)
- This context is essential for framing relevant opportunities

### 2. Scrape the Careers Page
- Use Playwright for JavaScript-rendered pages (Ashby, Lever, Greenhouse, Workday, etc.)
- Extract all job listings with titles and links to full descriptions
- Apply smart deduplication (see below)
- Cap at 30 unique roles to analyze

### 3. Read Full Job Descriptions
- Follow links to get complete job descriptions
- Focus on responsibilities, day-to-day tasks, and tools mentioned
- Note the team/department for each role

### 4. Analyze for Automation Signals
- Look for patterns indicating manual, repetitive, or coordination-heavy work
- Identify 2-3 distinct opportunity areas (not one mega-opportunity)
- Each opportunity should be specific enough to pitch

### 5. Generate Output
- Write structured opportunity report to `data/companies/{company_slug}.md`
- Include company context, opportunities, and source postings

### 6. Request Feedback
- After presenting opportunities, ask for feedback
- Store feedback in `data/feedback/{company_slug}_feedback.md`

---

## Scraping Strategy

### For JavaScript-Rendered Pages (Most ATS Systems)

Use Playwright. Install if needed:
```bash
npm install playwright
npx playwright install chromium
```

Basic scraping script pattern:
```javascript
const { chromium } = require('playwright');

async function scrapeJobs(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait for job listings to load
  await page.waitForSelector('[data-job]', { timeout: 10000 }).catch(() => {});
  
  const content = await page.content();
  await browser.close();
  return content;
}
```

### Common ATS Selectors

| Platform | Job List Selector | Job Link Pattern |
|----------|------------------|------------------|
| Ashby | `.ashby-job-posting-brief-list` | `jobs.ashbyhq.com/company/[id]` |
| Lever | `.posting` | `jobs.lever.co/company/[id]` |
| Greenhouse | `.opening` | `boards.greenhouse.io/company/jobs/[id]` |
| Workday | `.css-19uc56f` | varies |

### Smart Deduplication

Before analyzing, dedupe similar roles:
1. Strip location suffixes (UK, France, EMEA, etc.)
2. Strip seniority prefixes for grouping (Sr., Junior, Lead)
3. Group by normalized title
4. Keep one representative posting per group
5. Note the count of similar roles (indicates team scale)

Example:
- "Account Executive - UK" 
- "Account Executive - France"
- "Account Executive - DACH"
→ Analyze ONE, note "3 similar roles = growing sales team"

---

## Automation Signal Detection

### High-Signal Patterns (STRONG indicators)

**Language patterns:**
- "manage", "coordinate", "oversee" + process/workflow
- "ensure", "maintain", "track" + data/records/compliance
- "liaise between", "bridge", "connect" teams
- "handle", "process", "review" + volume indicators
- "manual", "repetitive" (rare but explicit)
- "spreadsheet", "reporting", "reconciliation"

**Role types:**
- Operations roles (Ops Manager, Operations Specialist)
- Coordinator roles (Project Coordinator, Sales Coordinator)
- Analyst roles with "reporting" emphasis
- "Specialist" roles that are really process executors
- Integration/Implementation roles (onboarding customers)
- Support roles with technical investigation components

**Structural signals:**
- Multiple similar roles = scale problem
- 24/7 or shift coverage mentioned = automation candidate
- Cross-functional coordination emphasized
- Compliance/audit responsibilities

### Medium-Signal Patterns

- Customer Success with "onboarding" focus
- Account Management with "support" emphasis  
- Data roles focused on "cleaning" or "validation"
- QA roles with repetitive testing patterns

### Low-Signal (Usually Skip)

- Pure engineering roles (unless DevOps/SRE)
- Executive/leadership roles
- Creative roles (design, content)
- Pure sales roles (AE, SDR without ops component)

---

## Output Format

### Company Opportunity Report

Save to: `data/companies/{company_slug}.md`

```markdown
# {Company Name}: Agent Consulting Opportunities

**Generated:** {date}
**Careers URL:** {url}
**Status:** Draft | Reviewed | Pitched | Won | Lost

## Company Context

{2-3 paragraphs about:}
- What the company does, who they serve
- Size, funding stage, growth trajectory
- Key operational challenges implied by their business model

## Opportunity 1: {Descriptive Title}

**Team:** {Department/Team name}

**Opportunity:** Build an agent that:
- {Specific capability 1}
- {Specific capability 2}
- {Specific capability 3}

**Why this matters:** {2-3 sentences connecting to business value, referencing specific language from job postings}

**Source postings:** {List of job titles that informed this}

## Opportunity 2: {Descriptive Title}

{Same structure}

## Opportunity 3: {Descriptive Title}

{Same structure}

---

## Raw Data

### Jobs Analyzed
| Title | Team | Link |
|-------|------|------|
| ... | ... | ... |

### Jobs Skipped (after dedup)
- {title} (X similar roles)
- ...
```

---

## Feedback Storage

After presenting opportunities, ask:
1. Which opportunities resonate? Which don't?
2. What's missing that you expected to see?
3. Is the framing right for how you'd pitch this?

Save to: `data/feedback/{company_slug}_feedback.md`

```markdown
# Feedback: {Company Name}

**Date:** {date}

## Opportunity Ratings
- Opportunity 1: {Good/Meh/Bad} - "{brief reason}"
- Opportunity 2: {Good/Meh/Bad} - "{brief reason}"
- Opportunity 3: {Good/Meh/Bad} - "{brief reason}"

## What Worked
- {bullet points}

## What to Improve
- {bullet points}

## Notes for Future
- {any patterns to remember}
```

---

## Iteration & Learning

Over time, review feedback files to identify:
- Which opportunity types consistently resonate
- Which framings work best
- Which signal patterns are most predictive
- Industries/company types with best fit

Update this CLAUDE.md with learnings.

---

## Example Commands

```bash
# Analyze a company
"Analyze https://jobs.ashbyhq.com/ravio for consulting opportunities"

# Re-analyze with different focus
"Re-analyze Ravio, but focus more on data/analytics opportunities"

# Review past opportunities
"Show me all opportunities we've identified so far"

# Find patterns in feedback
"What opportunity types have gotten the best feedback?"
```

---

## Technical Setup

### Required Dependencies
```bash
npm init -y
npm install playwright
npx playwright install chromium
```

### File Structure
```
consulting-opportunities/
├── CLAUDE.md           # This file
├── data/
│   ├── companies/      # Opportunity reports by company
│   └── feedback/       # Feedback on each analysis
└── scripts/
    └── scrape.js       # Reusable scraping utilities
```

---

## Positioning Context

We're looking for projects involving:
- **Primary:** Building agents to automate workflows (using Claude, etc.)
- **Secondary:** General consulting on automation, process improvement
- **Tech stack preference:** Claude Code, but open to other approaches

Frame opportunities around what we can actually deliver, not generic "you should automate this."
