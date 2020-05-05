/* eslint-disable guard-for-in */

export function createMobileTableData(
  accountMap,
  {
    docMobileLatestVersionHash = { android: '0.0.0', ios: '0.0.0' },
    enricherFn = null
  }
) {
  const table = [];

  for (const account of accountMap.values()) {
    const row = _processMobileData(account, docMobileLatestVersionHash);

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(row, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }

    table.push(row);
  }
  return table;
}

function _processMobileData(account, docMobileLatestVersionHash) {
  const row = {};
  const {
    id,
    name,
    mobileBreadcrumbs,
    mobileHandledExceptions,
    mobileEvents,
    mobileAppLaunch,
    mobileApps
  } = account;

  row.accountName = name;
  row.accountID = id;
  // eslint-disable-next-line no-unused-vars
  const { value, _ } = _computeVersionPercent(
    account,
    docMobileLatestVersionHash
  );
  const entities = [...mobileApps];
  const totalApps = entities ? entities.length : 0;

  row.entityCount = totalApps;
  row.mobileTotalAppPercentage = totalApps > 0 ? 100 : 0;

  row.mobileLatestAgentPercentage = value;
  row.mobileUsingBreadcrumbs = mobileBreadcrumbs.length > 0;
  row.mobileUsingHandledExceptions = mobileHandledExceptions.length > 0;
  row.mobileUsingBreadcrumbsPercentage =
    mobileBreadcrumbs.length > 0
      ? Math.round((mobileBreadcrumbs.length / totalApps) * 100)
      : 0;
  row.mobileUsingHandledExceptionsPercentage =
    mobileHandledExceptions.length > 0
      ? Math.round((mobileHandledExceptions.length / totalApps) * 100)
      : 0;

  row.mobileAppsActivePercentage = ((events, totalApps) => {
    const matchedEvent = events.filter(e => e.count > 100);
    return matchedEvent.length > 0
      ? Math.round((matchedEvent.length / totalApps) * 100)
      : 0;
  })(mobileEvents, totalApps);

  row.appsWithAlertsPercentage = ((entities, totalApps) => {
    // entities is [{"accountId":1606862,"alertSeverity":"NOT_CONFIGURED","guid":"MTYwNjg2MnxNT0JJTEV8QVBQTElDQVRJT058NjE2OTA3Nzg","name":"Acme Telco -Android","reporting":true}]
    if (!entities || (entities && entities.length === 0)) {
      return 0;
    }
    const appWithAlerts = entities
      .filter(e => e.reporting === true)
      .filter(e => e.alertSeverity !== 'NOT_CONFIGURED');
    return appWithAlerts.length > 0
      ? Math.round((appWithAlerts.length / totalApps) * 100)
      : 0;
  })(entities, totalApps);
  row.mobileAppLaunchCount = mobileAppLaunch;
  row.mobileAppLaunch = mobileAppLaunch > 0;
  return row;
}

export function computeMobileMaturityScore({ rowData, scoreWeights }) {
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

function _computeVersionPercent(account, latestMobileVerHash) {
  //   [ { facet": "5.19.1", "appCount": 1, "osName": "Android",  "newRelicVersion": "1.8.32"}, ...]
  const { mobileDeployedVersions } = account;
  if (
    !mobileDeployedVersions ||
    (mobileDeployedVersions && mobileDeployedVersions.length === 0)
  ) {
    return { value: 0, total: 0 };
  }
  let hasLatest = false;
  let totalUsers = 0;
  let totalLatestVer = 0;
  // latestMobileVerHash,  {"ios":"5.24.3","android":"1167"}
  for (const mobileOsName in latestMobileVerHash) {
    const latestVer = latestMobileVerHash[mobileOsName];
    const deployed = mobileDeployedVersions.filter(
      ({ osName }) => osName.toLowerCase() === mobileOsName.toLowerCase()
    );

    if (deployed && deployed.length === 0) {
      continue;
    }

    totalUsers += deployed.reduce((acc, curr) => acc + curr.appCount, 0);
    totalLatestVer += deployed.filter(d => d.newRelicVersion === latestVer)
      .length;

    hasLatest = hasLatest || totalLatestVer > 0;
  }

  if (!hasLatest) {
    return { value: 0, totalUsers };
  }

  const value = Math.round((totalLatestVer / totalUsers) * 100);
  return { value, totalUsers };
}
