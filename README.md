# Consulting Opportunity Finder

An agent-driven workflow that identifies consulting opportunities from company job postings. Job postings are companies broadcasting their pain points — roles heavy on coordination, data entry, reporting, and manual workflows signal where agent-based automation could replace or augment hiring.

## How It Works

1. Give the agent a company's careers page URL
2. It researches the company (background, size, funding, products)
3. Scrapes all job listings via Playwright (handles JS-rendered ATS pages)
4. Deduplicates and analyzes roles for automation signals
5. Generates a structured opportunity report with specific, scoped engagement proposals
6. Collects feedback for iteration

## Setup

```bash
npm install
npm run setup  # installs Playwright's Chromium browser
```

Optionally copy the environment template:

```bash
cp .env.example .env
```

## Usage

Run with Claude Code — give it a careers URL:

```
Analyze https://jobs.ashbyhq.com/somecompany for consulting opportunities
```

The agent will produce a report in `data/companies/{company-slug}.md` with:
- Company context
- 2-3 scoped opportunities (framed as 2-4 week engagements)
- Implementation plans with week-by-week breakdowns
- Dependency tables for each engagement
- Source job postings that informed each opportunity

## Project Structure

```
consulting-opportunities/
├── CLAUDE.md              # Agent instructions and workflow
├── scrape.js              # Reusable Playwright scraping utilities
├── package.json
├── .env.example           # Environment variable template
├── data/
│   ├── INDEX.md           # Opportunity tracking index
│   ├── companies/         # Generated opportunity reports (gitignored)
│   └── feedback/          # Feedback on analyses (gitignored)
```

## What Gets Tracked in Git

The repo contains the **tooling and instructions** — the agent workflow, scraping utilities, and templates. Company analysis reports (`data/companies/`) and feedback files (`data/feedback/`) are gitignored since they contain client-sensitive information.
