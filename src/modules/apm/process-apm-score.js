/* eslint-disable guard-for-in */
/* eslint-disable dot-notation */

export function createAPMTableData(
  accountMap,
  { docEventTypes = {}, docAgentLatestVersion = {}, enricherFn = null }
) {
  const apmTable = [];

  for (const account of accountMap.values()) {
    const apmRow = {};

    apmRow.accountName = account.name;
    apmRow.accountID = account.id;
    apmRow.entityCount = account.getTotalApps();
    apmRow.reportingAppPercentage = account.getReportingAppsPercent();
    apmRow.appsWithAlertsPercentage = account.getAlertingAppsPercent();
    apmRow.customApdexPercentage = account.getCustomApdexAppsPercent();
    apmRow.usingLabelsPercentage = account.getAppsWithLabelsPercent();
    apmRow.apmUsingDTCapableAgentPercentage = account.getDTCapableAppsPercent();
    apmRow.apmDistributedTracingEnabledPercentage = account.getDTEnabledAppsPercent();
    apmRow.apmTargetedByKeyTxnPercentage = account.apiData
      ? account.getAppsWithKeyTxnsPercent()
      : 'api key required';

    apmRow.apmAlertingKeyTxnPercentage = account.apiData
      ? account.getAlertingKeyTxnsPercent()
      : 'api key required';
    apmRow.apmDeploymentMarkersPercentage = account.getDeploymentAppsPercent();

    const docTxnKeysetCount = docEventTypes['Transaction']
      ? docEventTypes['Transaction'].attributes.length
      : 0;

    apmRow.usingCustomAttributes =
      (account.txnKeyset ? account.txnKeyset.length : 0) > docTxnKeysetCount;

    apmRow.apmLatestAgentPercentage = _computeLatestAgentPercent(
      account.apmDeployedVersions,
      docAgentLatestVersion
    );

    apmRow.LIST = createAPMApplicationList(account.apmApps);

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(apmRow, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }

    apmTable.push(apmRow);
  }
  return apmTable;
}

export function computeAPMMaturityScore({ rowData, scoreWeights }) {
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

export function createAPMApplicationList(appMap) {
  if (!appMap || (appMap && appMap.size === 0)) {
    return [];
  }
  const itr = appMap.values();
  let app = itr.next();
  const appList = [];

  while (!app.done) {
    const appObj = { ...app.value };

    appObj.isDTCapable = app.value.isDTCapable();
    appObj.isDTEnabled = app.value.isDTEnabled();
    appObj.isCustomApdex = app.value.isCustomApdex();
    appObj.isAlerting = app.value.isAlerting();
    appObj.hasLabels = app.value.hasLabels();

    appList.push(appObj);
    app = itr.next();
  }

  return appList;
}

/**
 *
 * @param {*} apmDeployedVersions - deployed agent version for an account  , {java: { versions: [  { version: "1.1.0",  count: 4} ] }
 * @param {*} docAgentLatestVersion ,  {"android":"5.24.3","browser":"1167","dotnet":"8.24.244.0","elixir":"0.0.0","go":"3.3.0","infrastructure":"1.10.26","ios":"3.53.1","java":"5.10.0","nodejs":"6.4.2","php":"9.7.0.258","python":"5.8.0.136","ruby":"V6.9.0","skd":"1.3.0"}
 */
function _computeLatestAgentPercent(
  apmDeployedVersions,
  docAgentLatestVersion
) {
  let totalLatest = 0;
  let totalDeployed = 0;

  for (const key in apmDeployedVersions) {
    const latestVersion = docAgentLatestVersion[key];

    totalLatest = apmDeployedVersions[key].versions
      .filter(agent => {
        return agent.version === latestVersion;
      })
      .reduce((total, curr) => total + curr.count, 0);

    totalDeployed = apmDeployedVersions[key].versions.reduce(
      (total, curr) => total + curr.count,
      0
    );
  }
  return totalDeployed === 0
    ? 0
    : Math.round((totalLatest / totalDeployed) * 100);
}
