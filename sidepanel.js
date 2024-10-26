
async function getDomainMetadata(domain) {
  try {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    return {
      favicon: faviconUrl,
      safeUrl: `https://${domain}`
    };
  } catch (error) {
    console.error('Error fetching metadata for domain:', domain, error);
    return null;
  }
}

function formatDomainName(domain) {
  try {
    // Remove common prefixes and format domain
    return domain
      .replace(/^www\./, '')
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/-/g, ' ');
  } catch (error) {
    return domain;
  }
}

let currentData = null;
let domainMetadataCache = new Map();

function createDomainCard(domain, data, metadata) {
  const formattedDomain = formatDomainName(domain);
  
  return `
    <div class="domain-stat">
      <div class="domain-header">
        <img 
          src="${metadata?.favicon || 'icons/default-favicon.png'}" 
          alt="${formattedDomain} favicon"
          class="domain-favicon"
          onerror="this.src='icons/default-favicon.png'"
        />
        <div class="domain-title">
          <h3 title="${domain}">${formattedDomain}</h3>
          <a href="${metadata?.safeUrl}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="domain-link"
             title="Visit ${domain}">
            ${domain}
          </a>
        </div>
      </div>
      <div class="domain-metrics">
        <div class="metric">
          <span class="metric-label">Visits</span>
          <span class="metric-value">${data.visits}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Pages</span>
          <span class="metric-value">${Array.isArray(data.paths) ? data.paths.length : 0}</span>
        </div>
      </div>
      <div class="domain-dates">
        <p>First Visit: ${formatDate(data.firstVisit)}</p>
        <p>Last Visit: ${formatDate(data.lastVisit)}</p>
      </div>
      <details class="paths-details">
        <summary>View Unique Pages</summary>
        <div class="paths-list">
          ${Array.isArray(data.paths) && data.paths.length > 0 
            ? data.paths.map(path => `
                <div class="path-item" title="${path}">
                  <span class="path-icon">📄</span>
                  ${path}
                </div>
              `).join('')
            : '<div class="no-paths">No unique pages recorded</div>'
          }
        </div>
      </details>
    </div>
  `;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function sortDomainData(data, sortOrder) {
  return Object.entries(data)
    .filter(([domain, data]) => domain && data.visits > 0)
    .sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b[1].lastVisit - a[1].lastVisit;
        case 'oldest':
          return a[1].firstVisit - b[1].firstVisit;
        case 'visits':
        default:
          return b[1].visits - a[1].visits;
      }
    });
}

async function fetchDomainMetadata(domain) {
  if (domainMetadataCache.has(domain)) {
    return domainMetadataCache.get(domain);
  }
  
  const metadata = await getDomainMetadata(domain);
  if (metadata) {
    domainMetadataCache.set(domain, metadata);
  }
  return metadata;
}

async function updateAnalytics() {
  const response = await chrome.runtime.sendMessage({ type: 'getAnalytics' });
  currentData = response.data;
  
  const sortOrder = document.getElementById('sortOrder').value;
  const domainData = sortDomainData(currentData, sortOrder);
  const topDomains = domainData.slice(0, 10);
  
  if (topDomains.length === 0) {
    document.querySelector('.analytics-container').innerHTML = `
      <h1>Browsing Analytics</h1>
      <p class="no-data">No browsing history available yet. Start browsing to see your analytics!</p>
    `;
    return;
  }
  
  // Create custom bar graph
  const graphContainer = document.getElementById('visitsGraph');
  const maxVisits = Math.max(...topDomains.map(([, data]) => data.visits));
  
  graphContainer.innerHTML = `
    <h2>Top Domains by Visits</h2>
    <div class="graph-container">
      ${topDomains.map(([domain, data]) => `
        <div class="graph-item">
          <div class="graph-label" title="${domain}">${domain}</div>
          <div class="graph-bar-container">
            <div class="graph-bar" style="width: ${(data.visits / maxVisits) * 100}%">
              <span class="graph-value">${data.visits}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Update domain statistics with metadata
  const statsContainer = document.getElementById('domainStats');
  statsContainer.innerHTML = `
    <h2>Detailed Statistics</h2>
    <p class="last-update">Last updated: ${formatDate(response.lastUpdate)}</p>
    <div class="domains-grid">
      ${await Promise.all(topDomains.map(async ([domain, data]) => {
        const metadata = await fetchDomainMetadata(domain);
        return createDomainCard(domain, data, metadata);
      }))}
    </div>
  `;
}

// Event listeners for controls
document.getElementById('dateRange').addEventListener('change', async (e) => {
  const days = parseInt(e.target.value);
  await chrome.runtime.sendMessage({ type: 'updateDateRange', days });
  updateAnalytics();
});

document.getElementById('sortOrder').addEventListener('change', () => {
  if (currentData) {
    updateAnalytics();
  }
});

// Update analytics every minute
setInterval(updateAnalytics, 60 * 1000);
updateAnalytics();