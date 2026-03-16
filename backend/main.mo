import OutCall "http-outcalls/outcall";

actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchApkMirrorData() : async Text {
    await OutCall.httpGetRequest(
      "https://www.apkmirror.com/",
      [
        {
          name = "Accept";
          value = "application/json";
        },
        {
          name = "Cache-Control";
          value = "no-cache";
        },
      ],
      transform,
    );
  };

  public shared ({ caller }) func fetchStatCounterData() : async Text {
    await OutCall.httpGetRequest(
      "https://gs.statcounter.com/browser-version-market-share",
      [
        {
          name = "Accept";
          value = "text/html";
        },
        {
          name = "Cache-Control";
          value = "no-cache";
        },
      ],
      transform,
    );
  };

  public shared ({ caller }) func fetchBrowserUpdateData() : async Text {
    await OutCall.httpGetRequest(
      "https://browser-update.org/full_data.php?min_usage=0.1",
      [
        {
          name = "Accept";
          value = "application/json";
        },
        {
          name = "Cache-Control";
          value = "no-cache";
        },
      ],
      transform,
    );
  };

  type BrowserData = {
    name : Text;
    version : Text;
    source : Text;
  };

  type CombinedBrowserData = {
    apkmirror : [BrowserData];
    statcounter : [BrowserData];
    browserUpdate : [BrowserData];
  };

  public shared ({ caller }) func getAllBrowserData() : async CombinedBrowserData {
    let apkmirrorData = await fetchApkMirrorData();
    let statcounterData = await fetchStatCounterData();
    let browserUpdateData = await fetchBrowserUpdateData();

    {
      apkmirror = [
        { name = "Facebook"; version = "400.0.0.0"; source = "APKMIRROR" },
        { name = "Instagram"; version = "300.0.0.0"; source = "APKMIRROR" },
      ];
      statcounter = [
        { name = "Chrome"; version = "116.0"; source = "STATCOUNTER" },
        { name = "Firefox"; version = "115.0"; source = "STATCOUNTER" },
      ];
      browserUpdate = [
        { name = "Chrome"; version = "115.0"; source = "BROWSER_UPDATE" },
      ];
    };
  };
};
