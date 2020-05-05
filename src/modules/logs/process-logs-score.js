export function createLogsTableData(accountMap, enricherFn = null) {
  const table = [];

  for (const account of accountMap.values()) {
    const row = _processLogsData(account);

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

export function computeLogsMaturityScore({ rowData, scoreWeights }) {
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

function _processLogsData(account) {
  const row = {};
  const { id, name, logMessageCount } = account;

  row.accountName = name;
  row.accountID = id;
  row.loggingReporting = logMessageCount > 0;
  row.loggingLogVolumePercentage = (count => {
    if (count === 0) {
      return 0;
    }
    return count > 5 ? 100 : 20;
  })(logMessageCount);

  return row;
}
