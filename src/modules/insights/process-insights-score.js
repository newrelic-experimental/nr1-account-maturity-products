export function createInsightsTableData(
  accountMap,
  { docEventTypes = {}, enricherFn = null }
) {
  const table = [];

  const ootbEventTypes = Object.keys(docEventTypes);

  for (const account of accountMap.values()) {
    const row = _processInsightsData(account, {
      ootbEventTypes
    });

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

function _processInsightsData(account, { ootbEventTypes }) {
  const row = {};
  const { id, name, reportingEventTypes } = account;

  const dashboards = account.insightsDashboards || [];

  row.accountName = name;
  row.accountID = id;

  row.insightsHasDashboards = dashboards && dashboards.length > 0;

  // eslint-disable-next-line no-unused-vars
  const [hasCustomEvents, customEvents] = ((acctEvents, eventTypes) => {
    const customEvents = acctEvents.filter(e => !eventTypes.includes(e));
    return [customEvents.length > 0, customEvents];
  })(reportingEventTypes, ootbEventTypes);

  row.insightsUsingCustomEvents = hasCustomEvents;

  return row;
}

export function computeInsightsMaturityScore({ rowData, scoreWeights }) {
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
