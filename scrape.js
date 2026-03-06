const { chromium } = require('playwright');

/**
 * Scrape job listings from a careers page
 * Handles JavaScript-rendered pages (Ashby, Lever, Greenhouse, etc.)
 */
async function scrapeJobsPage(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  console.log(`Scraping: ${url}`);
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);
    
    // Get the full page content
    const content = await page.content();
    
    // Try to extract job listings based on common patterns
    const jobs = await page.evaluate(() => {
      const results = [];
      
      // Ashby pattern
      document.querySelectorAll('[data-testid="job-posting"]').forEach(el => {
        const titleEl = el.querySelector('h3, [data-testid="job-posting-title"]');
        const linkEl = el.querySelector('a');
        const deptEl = el.querySelector('[data-testid="job-posting-department"]');
        if (titleEl) {
          results.push({
            title: titleEl.textContent.trim(),
            link: linkEl?.href || '',
            department: deptEl?.textContent.trim() || ''
          });
        }
      });
      
      // Lever pattern
      document.querySelectorAll('.posting').forEach(el => {
        const titleEl = el.querySelector('.posting-title h5');
        const linkEl = el.querySelector('a.posting-title');
        const deptEl = el.querySelector('.posting-categories .sort-by-team');
        if (titleEl) {
          results.push({
            title: titleEl.textContent.trim(),
            link: linkEl?.href || '',
            department: deptEl?.textContent.trim() || ''
          });
        }
      });
      
      // Greenhouse pattern
      document.querySelectorAll('.opening').forEach(el => {
        const titleEl = el.querySelector('a');
        const deptEl = el.querySelector('.department');
        if (titleEl) {
          results.push({
            title: titleEl.textContent.trim(),
            link: titleEl.href || '',
            department: deptEl?.textContent.trim() || ''
          });
        }
      });
      
      // Generic fallback - look for job-like links
      if (results.length === 0) {
        document.querySelectorAll('a').forEach(el => {
          const href = el.href || '';
          const text = el.textContent.trim();
          // Look for links that seem like job postings
          if (href.includes('/job') || href.includes('/position') || 
              href.includes('/careers/') || href.includes('/opening')) {
            if (text.length > 3 && text.length < 100) {
              results.push({
                title: text,
                link: href,
                department: ''
              });
            }
          }
        });
      }
      
      return results;
    });
    
    await browser.close();
    
    return {
      success: true,
      url,
      jobs,
      rawHtml: content
    };
    
  } catch (error) {
    await browser.close();
    return {
      success: false,
      url,
      error: error.message,
      jobs: [],
      rawHtml: ''
    };
  }
}

/**
 * Scrape a single job posting page for full description
 */
async function scrapeJobDescription(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // Extract text content, focusing on main content area
    const description = await page.evaluate(() => {
      // Remove scripts, styles, nav, footer
      const elementsToRemove = document.querySelectorAll('script, style, nav, footer, header');
      elementsToRemove.forEach(el => el.remove());
      
      // Try to find main content
      const mainContent = document.querySelector('main, [role="main"], .job-description, .posting-description, article');
      if (mainContent) {
        return mainContent.textContent.replace(/\s+/g, ' ').trim();
      }
      
      // Fallback to body
      return document.body.textContent.replace(/\s+/g, ' ').trim();
    });
    
    await browser.close();
    
    return {
      success: true,
      url,
      description
    };
    
  } catch (error) {
    await browser.close();
    return {
      success: false,
      url,
      error: error.message,
      description: ''
    };
  }
}

/**
 * Deduplicate jobs by normalizing titles
 */
function deduplicateJobs(jobs, maxJobs = 30) {
  const normalized = {};
  
  jobs.forEach(job => {
    // Normalize title: remove location suffixes, trim
    let normTitle = job.title
      .replace(/\s*[-–—]\s*(UK|US|USA|EMEA|APAC|Europe|France|Germany|Spain|Italy|Netherlands|Remote|Hybrid|London|NYC|SF|Berlin|Paris).*$/i, '')
      .replace(/\s*\((UK|US|USA|EMEA|APAC|Europe|Remote|Hybrid)\)$/i, '')
      .trim();
    
    if (!normalized[normTitle]) {
      normalized[normTitle] = {
        ...job,
        originalTitle: job.title,
        normalizedTitle: normTitle,
        similarCount: 1
      };
    } else {
      normalized[normTitle].similarCount++;
    }
  });
  
  // Sort by similarity count (higher = more interesting for scale)
  const dedupedJobs = Object.values(normalized)
    .sort((a, b) => b.similarCount - a.similarCount)
    .slice(0, maxJobs);
  
  return dedupedJobs;
}

// Export for use
module.exports = {
  scrapeJobsPage,
  scrapeJobDescription,
  deduplicateJobs
};

// CLI usage
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.log('Usage: node scrape.js <careers-url>');
    process.exit(1);
  }
  
  scrapeJobsPage(url).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}
