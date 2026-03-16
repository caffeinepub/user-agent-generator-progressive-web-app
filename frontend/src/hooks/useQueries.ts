import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CombinedBrowserData } from '@/backend';

export interface BrowserVersionData {
  chrome?: string;
  safari?: string;
  firefox?: string;
  edge?: string;
  android?: string;
  ios?: string;
  facebook?: string;
  instagram?: string;
}

export interface VersionDataStatus {
  isLoading: boolean;
  hasApkMirrorData: boolean;
  hasStatCounterData: boolean;
  hasBrowserUpdateData: boolean;
  lastUpdated?: number;
  error?: string;
}

// Parse and extract version data from backend response
function parseBackendData(combinedData: CombinedBrowserData): BrowserVersionData {
  const versionData: BrowserVersionData = {};
  
  // Parse StatCounter data
  if (combinedData.statcounter && combinedData.statcounter.length > 0) {
    for (const item of combinedData.statcounter) {
      const name = item.name.toLowerCase();
      if (name === 'chrome') versionData.chrome = item.version;
      else if (name === 'firefox') versionData.firefox = item.version;
      else if (name === 'safari') versionData.safari = item.version;
      else if (name === 'edge') versionData.edge = item.version;
    }
  }
  
  // Parse APKMirror data (priority for mobile apps)
  if (combinedData.apkmirror && combinedData.apkmirror.length > 0) {
    for (const item of combinedData.apkmirror) {
      const name = item.name.toLowerCase();
      if (name === 'facebook') versionData.facebook = item.version;
      else if (name === 'instagram') versionData.instagram = item.version;
    }
  }
  
  // Parse Browser-Update.org data (fallback for browsers)
  if (combinedData.browserUpdate && combinedData.browserUpdate.length > 0) {
    for (const item of combinedData.browserUpdate) {
      const name = item.name.toLowerCase();
      if (name === 'chrome' && !versionData.chrome) versionData.chrome = item.version;
      else if (name === 'firefox' && !versionData.firefox) versionData.firefox = item.version;
      else if (name === 'safari' && !versionData.safari) versionData.safari = item.version;
      else if (name === 'edge' && !versionData.edge) versionData.edge = item.version;
    }
  }
  
  return versionData;
}

// Hook to fetch unified browser version data from all sources
export function useBrowserVersionData() {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<{
    data: BrowserVersionData | null;
    status: VersionDataStatus;
  }>({
    queryKey: ['browserVersionData'],
    queryFn: async () => {
      if (!actor) {
        return {
          data: null,
          status: {
            isLoading: false,
            hasApkMirrorData: false,
            hasStatCounterData: false,
            hasBrowserUpdateData: false,
            error: 'Actor not initialized',
          },
        };
      }
      
      try {
        // Fetch data from all three sources via backend
        const combinedData = await actor.getAllBrowserData();
        
        // Parse the backend response
        const parsedData = parseBackendData(combinedData);
        
        // Determine which sources have data
        const hasApkMirrorData = combinedData.apkmirror && combinedData.apkmirror.length > 0;
        const hasStatCounterData = combinedData.statcounter && combinedData.statcounter.length > 0;
        const hasBrowserUpdateData = combinedData.browserUpdate && combinedData.browserUpdate.length > 0;
        
        const status: VersionDataStatus = {
          isLoading: false,
          hasApkMirrorData,
          hasStatCounterData,
          hasBrowserUpdateData,
          lastUpdated: Date.now(),
        };
        
        // Cache the data in localStorage for fallback
        if (Object.keys(parsedData).length > 0) {
          localStorage.setItem('cachedBrowserVersionData', JSON.stringify(parsedData));
          localStorage.setItem('cachedBrowserVersionDataTimestamp', Date.now().toString());
          localStorage.setItem('cachedBrowserVersionStatus', JSON.stringify(status));
        }
        
        return {
          data: parsedData,
          status,
        };
      } catch (error) {
        console.error('Error fetching browser version data:', error);
        
        // Try to use cached data as fallback
        const cachedData = localStorage.getItem('cachedBrowserVersionData');
        const cachedStatus = localStorage.getItem('cachedBrowserVersionStatus');
        
        if (cachedData) {
          try {
            const parsedCachedData = JSON.parse(cachedData);
            const parsedCachedStatus = cachedStatus ? JSON.parse(cachedStatus) : null;
            
            return {
              data: parsedCachedData,
              status: {
                isLoading: false,
                hasApkMirrorData: parsedCachedStatus?.hasApkMirrorData || false,
                hasStatCounterData: parsedCachedStatus?.hasStatCounterData || false,
                hasBrowserUpdateData: parsedCachedStatus?.hasBrowserUpdateData || false,
                lastUpdated: parsedCachedStatus?.lastUpdated,
                error: 'Using cached data (network error)',
              },
            };
          } catch (e) {
            console.error('Error parsing cached data:', e);
          }
        }
        
        return {
          data: null,
          status: {
            isLoading: false,
            hasApkMirrorData: false,
            hasStatCounterData: false,
            hasBrowserUpdateData: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    },
    enabled: !!actor && !isActorFetching,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 60, // Refetch every hour for real-time updates
  });
}
