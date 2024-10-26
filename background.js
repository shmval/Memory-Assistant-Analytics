// Background service worker to track and process history
let visitData = {};


async function processHistoryData(days = 7) {
  const startTime = new Date().getTime() - (days * 24 * 60 * 60 * 1000);
  
  chrome.history.search({
    text: '',
    startTime: startTime,
    maxResults: 10000
  }, async (historyItems) => {
    // Reset visit data
    visitData = {};
    
    for (const item of historyItems) {
      // Skip invalid URLs or empty entries
      if (!item.url || !item.url.trim()) continue;
      
      try {
        const url = new URL(item.url);
        const domain = url.hostname;
        
        // Skip empty domains
        if (!domain) continue;
        
        if (!visitData[domain]) {
          visitData[domain] = {
            visits: 0,
            totalTime: 0,
            paths: new Set(),
            lastVisit: null,
            firstVisit: Infinity
          };
        }
        
        visitData[domain].visits++;
        // Only add valid paths (ignore empty ones)
        if (url.pathname && url.pathname !== '/') {
          visitData[domain].paths.add(url.pathname);
        }
        visitData[domain].lastVisit = Math.max(item.lastVisitTime, visitData[domain].lastVisit || 0);
        visitData[domain].firstVisit = Math.min(item.lastVisitTime, visitData[domain].firstVisit);
      } catch (error) {
        console.error('Invalid URL:', item.url);
        continue;
      }
    }
    
    // Convert Sets to arrays for storage
    const storageData = Object.fromEntries(
      Object.entries(visitData).map(([domain, data]) => [
        domain,
        {
          ...data,
          paths: Array.from(data.paths)
        }
      ])
    );
    
    await chrome.storage.local.set({ 
      analyticsData: storageData,
      lastUpdate: new Date().getTime()
    });
  });
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getAnalytics') {
    chrome.storage.local.get(['analyticsData', 'lastUpdate'], (data) => {
      sendResponse({
        data: data.analyticsData || {},
        lastUpdate: data.lastUpdate
      });
    });
    return true;
  } else if (request.type === 'updateDateRange') {
    processHistoryData(request.days);
    sendResponse({ success: true });
    return true;
  }
});

// Initial data processing
processHistoryData();