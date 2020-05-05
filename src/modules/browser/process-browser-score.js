/* eslint-disable no-console */
/* eslint-disable dot-notation */
export function createBrowserTableData(
  accountMap,
  { docEventTypes = {}, enricherFn = null }
) {
  const browserTable = [];

  for (const account of accountMap.values()) {
    const browserRow = {};

    browserRow.accountName = account.name;
    browserRow.accountID = account.id;
    browserRow.entityCount = account.getBrowserTotalApps();
    browserRow.reportingAppPercentage = account.getBrowserReportingAppsPercent();
    browserRow.appsWithAlertsPercentage = account.getBrowserAlertingAppsPercent();
    browserRow.customApdexPercentage = account.getBrowserCustomApdexAppsPercent();
    browserRow.browserUsingPageActionsPercentage = account.getPageActionEnabledAppsPercent();
    browserRow.browserAutoInstrumentationUsedPercentage = account.getAutoInstrumentationAppsPercent();
    browserRow.browserSpaAgentEnabledPercentage = account.getSpaAgentEnabledAppsPercent();

    const docPgViewKeysetCount = docEventTypes['PageView']
      ? docEventTypes['PageView'].attributes.length
      : 0;

    browserRow.usingCustomAttributes =
      (account.pgViewKeyset ? account.pgViewKeyset.length : 0) >
      docPgViewKeysetCount;

    console.log(
      `processBrowserScore docKeyCount=${docPgViewKeysetCount} txnKeyCount=${account.pgViewKeyset.length}`
    );
    const { appList, percentDTCapableApps } = createBrowserApplicationList(
      account.browserApps
    );

    browserRow.browserDTEnabledPercentage = percentDTCapableApps;

    browserRow.LIST = appList;
    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(browserRow, account);
      } catch (err) {
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }
    browserTable.push(browserRow);
  }
  return browserTable;
}

export function computeBrowserMaturityScore({ rowData, scoreWeights }) {
  let score = 0;
  let overallPercentage = 0;

  for (const key of Object.keys(scoreWeights)) {
    let value = rowData[key];
    const weight = scoreWeights[key];

    if (typeof value === 'undefined') {
      throw new Error(`computeMaturityScore() key not found. key =${key}`);
    }

    if (typeof value === 'boolean') {
      value = value ? 100 : 0;
    }

    overallPercentage += weight * 100;
    score += value * weight;
  }

  overallPercentage = overallPercentage <= 100 ? overallPercentage : 100;

  return {
    score: Math.round((score / overallPercentage) * 100),
    overallPercentage
  };
}

export function createBrowserApplicationList(appMap) {
  if (!appMap || (appMap && appMap.size === 0)) {
    return { appList: [], percentDTCapableApps: 0 };
  }
  const itr = appMap.values();
  let app = itr.next();
  const appList = [];

  let dtCapableCount = 0;
  while (!app.done) {
    const appObj = { ...app.value };

    const isDTCapable = app.value.isDTCapable();
    dtCapableCount += isDTCapable ? 1 : 0;

    appObj.isDTCapable = isDTCapable;
    appObj.isAutoInstrumentation = app.value.isAutoInstrumentation();
    appObj.isCustomApdex = app.value.isCustomApdex();
    appObj.isAlerting = app.value.isAlerting();
    appObj.hasLabels = app.value.hasLabels();

    appList.push(appObj);
    app = itr.next();
  }
  const percentDTCapableApps =
    appList.length > 0
      ? Math.round((dtCapableCount / appList.length) * 100)
      : 0;

  return {
    appList,
    percentDTCapableApps
  };
}
