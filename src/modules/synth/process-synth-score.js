export function createSynthTableData(accountMap, enricherFn = null) {
  const synthTable = [];
  for (const account of accountMap.values()) {
    const synthRow = {};

    synthRow.accountName = account.name;
    synthRow.accountID = account.id;
    synthRow.entityCount = account.getTotalMonitors();
    synthRow.reportingMonitorPercentage = account.getReportingMonitorsPercent();
    synthRow.monitorsWithAlertsPercentage = account.getAlertingMonitorsPercent();
    synthRow.usingLabelsPercentage = account.getMonitorsWithLabelsPercent();
    synthRow.syntheticsMonitorTypesPercentage = account.getMonitorTypesPercent();
    synthRow.syntheticsMonitorWithMultipleLocationsPercentage = account.getMonitorsWith1plusLocationsPercent();
    synthRow.syntheticsUsingPrivateLocationsPercentage = account.getUsingPrivateLocations();

    synthRow.LIST = createMonitorList(account.synthMonitors);
    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(synthRow, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }
    synthTable.push(synthRow);
  }
  return synthTable;
}

export function computeSynthMaturityScore({ rowData, scoreWeights }) {
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

export function createMonitorList(monitorMap) {
  if (!monitorMap || (monitorMap && monitorMap.size === 0)) {
    return [];
  }
  const itr = monitorMap.values();
  let monitor = itr.next();
  const monitorList = [];

  while (!monitor.done) {
    const monitorObj = { ...monitor.value };

    monitorObj.isAlerting = monitor.value.isAlerting();
    monitorObj.hasLabels = monitor.value.hasLabels();
    monitorObj.has1plusLocations = monitor.value.has1plusLocations();
    monitorObj.usingPrivateLocations = monitor.value.privateLocation;
    monitorList.push(monitorObj);
    monitor = itr.next();
  }

  return monitorList;
}
