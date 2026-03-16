import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Smartphone, Trash2, Download, Search, ChevronDown, ChevronRight, Info, Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateUserAgents, type UserAgentData } from '@/lib/userAgentGenerator';
import { useBrowserVersionData } from '@/hooks/useQueries';

type DeviceCategory = 'samsung' | 'iphone' | 'ipad' | 'pixel' | 'windows';
type PlatformType = 'facebook' | 'instagram' | 'general';

interface DeviceSelection {
  category: DeviceCategory | '';
  platform: PlatformType | '';
}

export default function UserAgentGenerator() {
  const [deviceSelection, setDeviceSelection] = useState<DeviceSelection>({
    category: '',
    platform: '',
  });
  const [country, setCountry] = useState<string>('');
  const [userAgents, setUserAgents] = useState<UserAgentData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState<DeviceCategory | ''>('');
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());

  // Fetch browser version data from backend (includes APKMirror, StatCounter, Browser-Update.org)
  const { data: versionResponse, isLoading: isLoadingVersionData, error: versionDataError } = useBrowserVersionData();
  
  const browserVersionData = versionResponse?.data;
  const versionStatus = versionResponse?.status;

  const deviceCategories: { value: DeviceCategory; label: string }[] = [
    { value: 'samsung', label: 'Samsung' },
    { value: 'iphone', label: 'iPhone' },
    { value: 'ipad', label: 'iPad' },
    { value: 'pixel', label: 'Pixel' },
    { value: 'windows', label: 'Windows' },
  ];

  const countries = [
    { value: 'US', label: 'United States (US)' },
    { value: 'UK', label: 'United Kingdom (UK)' },
    { value: 'BD', label: 'Bangladesh (BD)' },
    { value: 'IN', label: 'India (IN)' },
    { value: 'CA', label: 'Canada (CA)' },
    { value: 'AU', label: 'Australia (AU)' },
    { value: 'DE', label: 'Germany (DE)' },
    { value: 'FR', label: 'France (FR)' },
    { value: 'JP', label: 'Japan (JP)' },
    { value: 'CN', label: 'China (CN)' },
    { value: 'BR', label: 'Brazil (BR)' },
    { value: 'MX', label: 'Mexico (MX)' },
  ];

  const getPlatformOptions = (category: DeviceCategory): { value: PlatformType; label: string }[] => {
    if (category === 'windows') {
      return [{ value: 'general', label: 'User-Agent' }];
    }
    return [
      { value: 'facebook', label: 'Facebook User-Agent' },
      { value: 'instagram', label: 'Instagram User-Agent' },
    ];
  };

  const handleDeviceSelect = (category: DeviceCategory) => {
    setDeviceSelection({ category, platform: '' });
    setOpenCategory(category);
  };

  const handlePlatformSelect = (platform: PlatformType) => {
    setDeviceSelection((prev) => ({ ...prev, platform }));
  };

  const handleGenerate = () => {
    if (!deviceSelection.category || !deviceSelection.platform || !country) {
      toast.error('অনুগ্রহ করে ডিভাইস, প্ল্যাটফর্ম এবং দেশ সব নির্বাচন করুন');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateUserAgents(
        deviceSelection.category,
        deviceSelection.platform,
        country,
        25,
        browserVersionData
      );
      setUserAgents(generated);
      setExpandedDetails(new Set());
      setIsGenerating(false);
      toast.success(`${generated.length}টি ইউজার-এজেন্ট সফলভাবে তৈরি হয়েছে!`);
    }, 300);
  };

  const handleCopy = async (userAgent: string, index: number) => {
    try {
      await navigator.clipboard.writeText(userAgent);
      toast.success(`ইউজার-এজেন্ট #${index + 1} ক্লিপবোর্ডে কপি হয়েছে!`);
    } catch (error) {
      toast.error('কপি করতে ব্যর্থ হয়েছে');
    }
  };

  const handleClear = () => {
    setDeviceSelection({ category: '', platform: '' });
    setCountry('');
    setUserAgents([]);
    setSearchQuery('');
    setOpenCategory('');
    setExpandedDetails(new Set());
    toast.info('সব অপশন রিসেট করা হয়েছে');
  };

  const toggleDetails = (index: number) => {
    setExpandedDetails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Filter user agents based on search query
  const filteredUserAgents = useMemo(() => {
    if (!searchQuery.trim()) return userAgents;

    const query = searchQuery.toLowerCase();
    return userAgents.filter(
      (ua) =>
        ua.userAgent.toLowerCase().includes(query) ||
        ua.deviceModel.toLowerCase().includes(query) ||
        ua.browserName.toLowerCase().includes(query) ||
        ua.browserVersion.toLowerCase().includes(query) ||
        ua.osVersion.toLowerCase().includes(query) ||
        ua.releaseYear.includes(query) ||
        ua.hardwareVendor.toLowerCase().includes(query) ||
        ua.hardwareName.toLowerCase().includes(query) ||
        ua.platformName.toLowerCase().includes(query)
    );
  }, [userAgents, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredUserAgents.length === 0) {
      toast.error('এক্সপোর্ট করার জন্য কোনো ইউজার-এজেন্ট নেই');
      return;
    }

    const headers = [
      'User Agent',
      'Device Model',
      'Browser/Platform',
      'Version',
      'OS Version',
      'Release Year',
      'Hardware Vendor',
      'Hardware Model',
      'Hardware Name',
      'Platform Vendor',
      'Platform Name',
      'Platform Version',
      'Browser Vendor',
      'Hardware Family',
      'OEM',
      'Hardware Model Variants',
    ];
    const rows = filteredUserAgents.map((ua) => [
      ua.userAgent,
      ua.deviceModel,
      ua.browserName,
      ua.browserVersion,
      ua.osVersion,
      ua.releaseYear,
      ua.hardwareVendor,
      ua.hardwareModel,
      ua.hardwareName,
      ua.platformVendor,
      ua.platformName,
      ua.platformVersion,
      ua.browserVendor,
      ua.hardwareFamily,
      ua.oem,
      ua.hardwareModelVariants,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `user-agents-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredUserAgents.length}টি ইউজার-এজেন্ট CSV ফাইলে এক্সপোর্ট হয়েছে!`);
  };

  // Export to TXT
  const handleExportTXT = () => {
    if (filteredUserAgents.length === 0) {
      toast.error('এক্সপোর্ট করার জন্য কোনো ইউজার-এজেন্ট নেই');
      return;
    }

    const txtContent = filteredUserAgents.map((ua) => ua.userAgent).join('\n');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `user-agents-${timestamp}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredUserAgents.length}টি ইউজার-এজেন্ট TXT ফাইলে এক্সপোর্ট হয়েছে!`);
  };

  // Auto-generate when all selections are made
  useEffect(() => {
    if (deviceSelection.category && deviceSelection.platform && country) {
      handleGenerate();
    }
  }, [deviceSelection.category, deviceSelection.platform, country, browserVersionData]);

  // Format last updated time
  const formatLastUpdated = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'এখনই';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    return new Date(timestamp).toLocaleDateString('bn-BD');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* APKMirror Sync Status Banner */}
      {versionStatus && (
        <Card className={`border-2 ${versionStatus.hasApkMirrorData ? 'border-green-500/50 bg-green-500/5' : versionStatus.error ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-blue-500/50 bg-blue-500/5'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isLoadingVersionData ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : versionStatus.hasApkMirrorData ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {isLoadingVersionData
                        ? 'ভার্সন ডেটা লোড হচ্ছে...'
                        : versionStatus.hasApkMirrorData
                        ? 'APKMirror সিঙ্ক সক্রিয়'
                        : versionStatus.error
                        ? 'ক্যাশড ডেটা ব্যবহার করা হচ্ছে'
                        : 'ডিফল্ট ভার্সন ব্যবহার করা হচ্ছে'}
                    </span>
                    {versionStatus.hasApkMirrorData && (
                      <Badge variant="default" className="text-xs">
                        রিয়েল-টাইম আপডেট
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    {versionStatus.hasApkMirrorData && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        APKMirror
                      </span>
                    )}
                    {versionStatus.hasStatCounterData && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        StatCounter
                      </span>
                    )}
                    {versionStatus.hasBrowserUpdateData && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Browser-Update.org
                      </span>
                    )}
                    {versionStatus.lastUpdated && (
                      <span className="ml-2">
                        • আপডেট: {formatLastUpdated(versionStatus.lastUpdated)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {browserVersionData && (
                <div className="flex items-center gap-2 text-xs">
                  {browserVersionData.facebook && (
                    <Badge variant="secondary" className="font-mono">
                      FB {browserVersionData.facebook}
                    </Badge>
                  )}
                  {browserVersionData.instagram && (
                    <Badge variant="secondary" className="font-mono">
                      IG {browserVersionData.instagram}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card className="shadow-lg border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <Smartphone className="h-7 w-7 text-primary" />
            ইউজার-এজেন্ট জেনারেটর
          </CardTitle>
          <CardDescription className="text-base">
            আপনার পছন্দের ডিভাইস, প্ল্যাটফর্ম এবং দেশ নির্বাচন করুন, তারপর একাধিক রিয়েলিস্টিক ইউজার-এজেন্ট স্ট্রিং তৈরি করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Device Category and Platform Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">ডিভাইস ক্যাটাগরি এবং প্ল্যাটফর্ম</Label>
            <div className="space-y-2 border border-border/50 rounded-lg p-4 bg-muted/20">
              {deviceCategories.map((device) => (
                <Collapsible
                  key={device.value}
                  open={openCategory === device.value}
                  onOpenChange={(open) => {
                    if (open) {
                      handleDeviceSelect(device.value);
                    } else {
                      setOpenCategory('');
                    }
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={deviceSelection.category === device.value ? 'default' : 'outline'}
                      className="w-full justify-between h-12 text-base font-semibold"
                    >
                      <span>{device.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openCategory === device.value ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2 pl-4">
                    {getPlatformOptions(device.value).map((platform) => (
                      <Button
                        key={platform.value}
                        variant={
                          deviceSelection.category === device.value &&
                          deviceSelection.platform === platform.value
                            ? 'secondary'
                            : 'ghost'
                        }
                        className="w-full justify-start h-10 text-sm font-medium"
                        onClick={() => handlePlatformSelect(platform.value)}
                      >
                        {platform.label}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>

          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-base font-semibold">
              দেশ
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country" className="h-11">
                <SelectValue placeholder="একটি দেশ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!deviceSelection.category || !deviceSelection.platform || !country || isGenerating}
              className="flex-1 h-11 text-base font-semibold"
              size="lg"
            >
              <RefreshCw className={`mr-2 h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
              আবার তৈরি করুন
            </Button>
            <Button onClick={handleClear} variant="outline" className="flex-1 h-11 text-base font-semibold" size="lg">
              <Trash2 className="mr-2 h-5 w-5" />
              ক্লিয়ার/রিফ্রেশ
            </Button>
          </div>

          {/* Search and Export Controls */}
          {userAgents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="সার্চ করুন (ডিভাইস, ব্রাউজার, ভার্সন...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 font-semibold">
                    <Download className="mr-2 h-4 w-4" />
                    এক্সপোর্ট
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV ডাউনলোড
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportTXT}>
                    <Download className="mr-2 h-4 w-4" />
                    TXT ডাউনলোড
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Generated User Agents Display */}
          {userAgents.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  তৈরি করা ইউজার-এজেন্ট ({filteredUserAgents.length}/{userAgents.length}টি)
                </Label>
                {versionStatus?.hasApkMirrorData && (
                  <Badge variant="default" className="text-xs">
                    <Database className="h-3 w-3 mr-1" />
                    APKMirror সিঙ্ক
                  </Badge>
                )}
              </div>

              {filteredUserAgents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-border/50 rounded-lg bg-muted/20">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base">কোনো ইউজার-এজেন্ট খুঁজে পাওয়া যায়নি</p>
                  <p className="text-sm mt-2">অন্য কিছু সার্চ করে দেখুন</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] w-full rounded-lg border border-border/50 bg-muted/20">
                  <div className="p-4 space-y-3">
                    {filteredUserAgents.map((ua, index) => {
                      const originalIndex = userAgents.indexOf(ua);
                      const isExpanded = expandedDetails.has(originalIndex);

                      return (
                        <div
                          key={originalIndex}
                          className="group relative bg-background rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {originalIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0 space-y-2">
                                {/* Metadata */}
                                <div className="flex flex-wrap gap-2 text-xs">
                                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                    {ua.deviceModel}
                                  </span>
                                  <span className="px-2 py-1 rounded-md bg-accent/50 text-accent-foreground font-medium">
                                    {ua.browserName} {ua.browserVersion}
                                  </span>
                                  <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-medium">
                                    {ua.osVersion}
                                  </span>
                                  <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                                    {ua.releaseYear}
                                  </span>
                                </div>
                                {/* User Agent String */}
                                <p className="font-mono text-sm break-all leading-relaxed text-foreground/90">
                                  {ua.userAgent}
                                </p>
                              </div>
                              <div className="flex-shrink-0 flex gap-1">
                                <Button
                                  onClick={() => toggleDetails(originalIndex)}
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="বিস্তারিত দেখুন"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleCopy(ua.userAgent, originalIndex)}
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="কপি করুন"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Expandable Details Section */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <Info className="h-4 w-4 text-primary" />
                                  <h4 className="text-sm font-semibold text-primary">ইউজার এজেন্ট বিস্তারিত তথ্য</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">হার্ডওয়্যার ভেন্ডর:</span>
                                    <p className="font-semibold">{ua.hardwareVendor}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">হার্ডওয়্যার মডেল:</span>
                                    <p className="font-semibold">{ua.hardwareModel}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">হার্ডওয়্যার নাম:</span>
                                    <p className="font-semibold">{ua.hardwareName}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">প্ল্যাটফর্ম ভেন্ডর:</span>
                                    <p className="font-semibold">{ua.platformVendor}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">প্ল্যাটফর্ম নাম:</span>
                                    <p className="font-semibold">{ua.platformName}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">প্ল্যাটফর্ম ভার্সন:</span>
                                    <p className="font-semibold">{ua.platformVersion}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">ব্রাউজার ভেন্ডর:</span>
                                    <p className="font-semibold">{ua.browserVendor}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">ব্রাউজার নাম:</span>
                                    <p className="font-semibold">{ua.browserName}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">ব্রাউজার ভার্সন:</span>
                                    <p className="font-semibold">{ua.browserVersion}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">হার্ডওয়্যার ফ্যামিলি:</span>
                                    <p className="font-semibold">{ua.hardwareFamily}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-muted-foreground font-medium">OEM:</span>
                                    <p className="font-semibold">{ua.oem}</p>
                                  </div>
                                  <div className="space-y-1 md:col-span-2">
                                    <span className="text-muted-foreground font-medium">হার্ডওয়্যার মডেল ভ্যারিয়েন্ট:</span>
                                    <p className="font-semibold font-mono text-xs break-all">{ua.hardwareModelVariants}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {/* Data Source Attribution */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Database className="h-3 w-3" />
                <span>
                  {isLoadingVersionData
                    ? 'ডেটা লোড হচ্ছে...'
                    : versionStatus?.hasApkMirrorData
                    ? 'ডেটা সোর্স: StatCounter, APKMirror (রিয়েল-টাইম), Browser-Update.org'
                    : versionStatus?.error
                    ? 'ডেটা সোর্স: ক্যাশড ডেটা (ফলব্যাক)'
                    : 'ডেটা সোর্স: ডিফল্ট ভার্সন (2026)'}
                </span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {userAgents.length === 0 && deviceSelection.category && deviceSelection.platform && country && (
            <div className="text-center py-12 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base">ইউজার-এজেন্ট তৈরি করতে "আবার তৈরি করুন" বাটনে ক্লিক করুন</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">কীভাবে ব্যবহার করবেন?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>১. একটি ডিভাইস ক্যাটাগরি নির্বাচন করুন (Samsung, iPhone, iPad, Pixel, বা Windows)</p>
          <p>২. ডিভাইস ক্যাটাগরি সম্প্রসারিত হলে একটি প্ল্যাটফর্ম নির্বাচন করুন (Facebook, Instagram, বা সাধারণ User-Agent)</p>
          <p>৩. আপনার পছন্দের দেশ নির্বাচন করুন (যেমন: US, BD, IN)</p>
          <p>৪. স্বয়ংক্রিয়ভাবে ২৫টি রিয়েলিস্টিক ইউজার-এজেন্ট স্ট্রিং তৈরি হবে</p>
          <p>৫. সার্চ বক্সে টাইপ করে নির্দিষ্ট ইউজার-এজেন্ট খুঁজুন</p>
          <p>৬. প্রতিটি এন্ট্রিতে হোভার করে বিস্তারিত তথ্য দেখতে তীর আইকনে ক্লিক করুন</p>
          <p>৭. "এক্সপোর্ট" বাটনে ক্লিক করে CSV বা TXT ফাইল ডাউনলোড করুন</p>
          <p>৮. প্রতিটি ইউজার-এজেন্টের উপর হোভার করে কপি বাটনে ক্লিক করুন</p>
          <p>৯. "ক্লিয়ার/রিফ্রেশ" বাটনে ক্লিক করে সব অপশন রিসেট করুন</p>
          <p className="pt-2 border-t border-border/30 flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span className="font-medium">অ্যাপটি StatCounter, APKMirror এবং Browser-Update.org থেকে সর্বশেষ ভার্সন ডেটা ব্যবহার করে</span>
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium">APKMirror থেকে Facebook এবং Instagram অ্যাপের রিয়েল-টাইম ভার্সন আপডেট</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
