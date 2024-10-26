# Memory Assistant Analytics Extension

A powerful browser extension that provides detailed insights into your browsing patterns and history. View comprehensive statistics about your most visited websites, track usage patterns, and analyze your browsing habits—all within a sleek side panel interface.

## Features

- **Domain Analytics**: Track visits and unique pages for each website
- **Time-Based Filtering**: View data for last 7, 30, or 90 days
- **Smart Sorting**: Order by most visits, newest, or oldest entries
- **Visual Statistics**: Clean, intuitive bar graphs for top domains
- **Detailed Domain Cards**:
  - Website favicons and metadata
  - Visit counts and unique page tracking
  - First and last visit timestamps
  - Detailed path history for each domain
- **Privacy-Focused**: All data stays in your browser

## Installation

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your browser toolbar 
2. Click 'Open side panel'
3. The side panel will open, showing your browsing analytics
4. Use the dropdown menus to:
   - Filter data by time range (7/30/90 days)
   - Sort domains by different criteria
5. Click "View Unique Pages" on any domain card to see detailed path history

## Technical Details

- Built with Modern JavaScript (ES6+)
- Uses Chrome Extension Manifest V3
- Implements the Side Panel API
- Utilizes Chrome History and Storage APIs
- Modular architecture for maintainability

## Project Structure

```
├── manifest.json           # Extension configuration
├── background.js          # Service worker for history processing
├── sidepanel.html         # Main UI entry point
├── sidepanel.js          # UI logic and data handling
├── styles.css            # UI styling
└── icons/              # Extension icons
```

## Privacy

This extension:
- Only accesses your browsing history with explicit permission
- Stores all data locally in your browser
- Does not send any data to external servers
- Does not track or collect personal information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

If you encounter any issues or have suggestions:
1. Check existing issues in the repository
2. Open a new issue with a detailed description
3. Include steps to reproduce any bugs