# User Agent Generator Progressive Web App

## Overview
An interactive Progressive Web App (PWA) that generates realistic user-agent strings based on selected device category, platform type, and country. The application features an expandable device selection interface where each device category reveals specific platform options (Facebook User-Agent, Instagram User-Agent, or general User-Agent). The interface is in Bengali language and generates multiple user-agent strings simultaneously with enhanced filtering, metadata display, detailed user agent information, and export capabilities. The app supports offline functionality and can be installed on devices as a standalone application. The app dynamically fetches the latest browser version data from multiple sources including StatCounter, Browser-Update.org, and APKMirror to ensure generated user-agents use current version information.

## Core Features

### Progressive Web App Capabilities
- Web App Manifest configuration with:
  - App name in Bengali
  - App icons for various sizes (192x192, 512x512)
  - Theme color matching the purple/violet color scheme
  - Display mode set to "standalone" for app-like experience
  - Background color and start URL configuration
- Service Worker implementation for offline functionality:
  - Caches static assets (HTML, CSS, JavaScript, images)
  - Enables offline use of the application
  - Cache-first strategy for static resources
- Install App functionality:
  - Visible "অ্যাপ ইনস্টল করুন" (Install App) button in header or settings area
  - Triggers browser's add-to-home-screen prompt
  - Shows installation prompt when PWA criteria are met
- Standalone app experience:
  - Runs without browser UI when installed
  - Custom splash screen with app icon and theme colors
  - App icon appears on device home screen

### Enhanced Multi-Source Dynamic Browser Version Data Integration
- Periodically fetches browser version data from multiple sources:
  - https://gs.statcounter.com/browser-version-market-share
  - https://www.apkmirror.com/ for mobile app versions with enhanced dynamic parsing
  - Browser-Update.org for additional browser data
- Enhanced APKMirror data fetching with dynamic parsing of app names and version details
- Real-time version synchronization from APKMirror with automatic updates
- Fetches data on app refresh/reload to ensure current version information
- Backend endpoints to fetch and parse data from all three sources with enhanced APKMirror parsing
- Automatic update of user-agent generation logic using unified fetched version data
- APKMirror data prioritized for app-specific (Facebook, Instagram) platform versions with real-time updates
- Data source attribution displayed as "Data sources: StatCounter, APKMirror, Browser-Update.org" note beneath the user-agent list in Bengali
- APKMirror synchronization indicator displayed in the generator UI showing real-time version updates
- Error handling and fallback mechanism:
  - Uses cached version data if fetching fails
  - Falls back to default 2026 version data if no cached data available
  - Graceful degradation ensures app continues functioning even with fetch failures
- Backend stores and serves the latest unified fetched version data to frontend with enhanced APKMirror integration

### Expandable Device and Platform Selection
- Primary device category selection with five options:
  - Samsung (Android devices)
  - iPhone
  - iPad
  - Pixel (Google Pixel devices)
  - Windows
- Each device category (except Windows) expands to show platform options:
  - "Facebook User-Agent" - generates Facebook app user-agent strings using enhanced APKMirror version data
  - "Instagram User-Agent" - generates Instagram app user-agent strings using enhanced APKMirror version data
- Windows category shows only general "User-Agent" option
- Expandable/collapsible interface design for intuitive navigation
- Dynamic regeneration triggers when deeper platform options are selected

### Country Selection
- Dropdown for country selection including:
  - US (United States)
  - UK (United Kingdom)
  - BD (Bangladesh)
  - IN (India)
  - Other major countries
- Region-based variations in generated user-agent strings

### Search and Filter
- Search/filter input field positioned above the results list
- Real-time filtering of generated user-agent strings based on user input
- Matches text within user-agent strings, device models, browser names, or any metadata
- Bengali placeholder text for search input
- Case-insensitive search functionality

### Dynamic User-Agent Generation with Enhanced APKMirror Integration
- Generates 20-30 realistic user-agent strings simultaneously for each selected combination
- Automatic regeneration when device category, platform type, or country selection changes
- Uses unified version data from StatCounter, APKMirror, and Browser-Update.org with enhanced APKMirror parsing
- Real-time version updates from APKMirror data with automatic user-agent regeneration
- Platform-specific generation logic:
  - Facebook User-Agent: generates Facebook mobile app user-agent strings using enhanced APKMirror version data
  - Instagram User-Agent: generates Instagram mobile app user-agent strings using enhanced APKMirror version data
  - General User-Agent: generates standard browser user-agent strings using StatCounter and Browser-Update.org data
- Uses randomization to create variations while maintaining realistic combinations
- Combines device type, platform, OS version, and locale parameters dynamically
- Fallback to 2026-era versions if dynamic data unavailable

### Enhanced User-Agent Display
- Each user-agent entry displays additional metadata:
  - Device model (e.g., "Samsung Galaxy S24", "iPhone 15 Pro", "Pixel 8")
  - Browser/Platform name and version using current multi-source data with enhanced APKMirror integration
  - OS version (e.g., "Android 14", "iOS 17.2", "Windows 11")
  - Release year based on fetched version data
- Metadata displayed in organized, readable format alongside the user-agent string
- Scrollable, visually organized display maintaining purple/violet theme consistency
- "Data sources: StatCounter, APKMirror, Browser-Update.org" attribution note displayed beneath the user-agent list in Bengali
- APKMirror synchronization status indicator showing real-time version updates in Bengali

### User Agent Details Section
- Each generated user-agent entry can be expanded or hovered to reveal comprehensive metadata in a structured card layout
- Detailed information includes:
  - HardwareVendor (e.g., "Apple", "Samsung", "Google")
  - HardwareModel (e.g., "iPhone Air", "Galaxy S24", "Pixel 8")
  - HardwareName (full device name)
  - PlatformVendor (e.g., "Apple", "Google", "Microsoft")
  - PlatformName (e.g., "iOS", "Android", "Windows")
  - PlatformVersion using current multi-source data with enhanced APKMirror integration
  - BrowserVendor (e.g., "Meta", "Google", "Microsoft")
  - BrowserName (e.g., "Facebook", "Instagram", "Chrome")
  - BrowserVersion using current multi-source data with APKMirror priority for apps and real-time updates
  - HardwareFamily (e.g., "iPhone", "Galaxy", "Pixel")
  - OEM (Original Equipment Manufacturer)
  - HardwareModelVariants (comma-separated list if multiple variants exist)
- Interactive expand/collapse or hover functionality for each user-agent entry
- Structured card layout displaying all metadata fields in Bengali labels
- Maintains visual consistency with existing purple/violet theme

### Export Functionality
- Export dropdown or button group offering two file format options:
  - CSV export - includes user-agent string and all metadata in structured columns
  - TXT export - plain text format with user-agent strings
- Bengali labels for export options ("CSV ডাউনলোড", "TXT ডাউনলোড")
- Downloads respect current filter state - only visible/filtered results are exported
- Automatic filename generation with timestamp

### User Interface Controls
- "ক্লিয়ার/রিফ্রেশ" button to reset all selections and clear the generated user-agent list
- Individual "Copy to Clipboard" button for each generated user-agent string
- "অ্যাপ ইনস্টল করুন" (Install App) button for PWA installation
- Clean, intuitive expandable interface with Bengali labels and text
- Responsive design maintaining existing purple/violet color scheme
- Export controls integrated seamlessly with existing UI layout
- Interactive elements for expanding/collapsing detailed metadata view
- APKMirror synchronization indicator in Bengali showing real-time version update status

### Footer
- Application footer containing copyright information
- Additional credits text "Credits 114 baranor opaiy" displayed beneath the copyright
- Footer text styled consistently with other footer elements

### Generation Logic
- Frontend-based generation using predefined templates and randomization enhanced with multi-source dynamic version data
- Backend provides latest unified browser version data fetched from StatCounter, APKMirror, and Browser-Update.org with enhanced APKMirror parsing
- Real-time version updates from APKMirror with automatic user-agent regeneration
- Platform-specific user-agent templates for Facebook and Instagram apps using enhanced APKMirror version data
- Realistic parameter combinations based on actual device specifications and current browser/app versions
- Multi-source version data integration with APKMirror prioritized for mobile app versions and real-time updates
- Comprehensive metadata generation for all detailed fields including hardware variants
- Dynamic regeneration system that triggers on selection changes and APKMirror updates
- Error handling and fallback mechanisms for version data fetching from all sources
- Backend stores unified fetched data from all sources and serves it to frontend with enhanced APKMirror integration

## Backend Requirements
- Enhanced HTTP endpoints to fetch browser version data from multiple sources:
  - https://gs.statcounter.com/browser-version-market-share
  - https://www.apkmirror.com/ for mobile app versions with dynamic parsing capabilities
  - Browser-Update.org for additional browser data
- Enhanced `fetchApkMirrorData()` function with dynamic parsing of app names and version details from APKMirror
- Parse and process data from all three sources to extract latest browser, platform, and version information with enhanced APKMirror parsing
- Real-time APKMirror data synchronization with automatic backend updates
- Merge and unify version data from multiple sources into a single dataset with APKMirror priority for mobile apps
- Store and serve the unified latest version data to frontend with enhanced APKMirror integration
- Error handling for failed requests to any of the sources including APKMirror parsing errors
- Caching mechanism for version data to serve as fallback including APKMirror data
- Data persistence for cached unified version information with APKMirror integration
- HTTP outcalls implementation for enhanced APKMirror data fetching and parsing

## Technical Requirements
- Progressive Web App implementation with Web App Manifest and Service Worker
- Offline functionality through asset caching and service worker
- Install prompt and standalone app experience
- All user interface text and labels in Bengali
- Responsive expandable/collapsible design for device and platform selection
- Client-side user-agent generation enhanced with backend-provided unified version data and real-time APKMirror updates
- Platform-specific generation logic for Facebook and Instagram user-agents using enhanced APKMirror data
- Clipboard API integration for copy functionality
- File download functionality for CSV and TXT exports
- Real-time search/filter implementation
- Scrollable container for displaying multiple user-agent strings with metadata
- Interactive expand/hover functionality for detailed metadata display
- Structured card layout for comprehensive user-agent details
- Automatic list updates and regeneration when selections change and APKMirror data updates
- Multi-source dynamic version data integration with enhanced APKMirror, StatCounter, and Browser-Update.org APIs
- Complete metadata field generation and display system with APKMirror integration
- PWA installation detection and prompt management
- Backend integration for fetching and serving unified browser version data from multiple sources with enhanced APKMirror parsing
- Error handling and fallback mechanisms for multi-source version data including APKMirror
- Enhanced frontend `useQueries.ts` hook integration for requesting APKMirror data with real-time updates
- Enhanced `UserAgentGenerator.ts` module for APKMirror-based version updates and real-time regeneration
- APKMirror synchronization status display in Bengali within the generator UI
