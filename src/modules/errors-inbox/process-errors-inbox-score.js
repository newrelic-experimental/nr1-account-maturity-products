export function createErrorsInboxTableData(accountMap, enricherFn = null) {
  const table = [];

  console.log('createErrorsInboxTableData', accountMap)

  for (const account of accountMap.values()) {
    const row = _processErrorsInboxData(account);

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

export function computeErrorsInboxMaturityScore({ rowData, scoreWeights }) {
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

function _processErrorsInboxData(account) {
  console.log('_processErrorsInboxData', account)
  const row = {};
  const { id, name } = account;

  /**
   * errorGroupCount
   * errorGroupAssignedPercentage
   * errorGroupUnresolvedPercentage
   * errorGroupIgnoredPercentage
   * errorGroupCommentsPercentage
   * overallScore
   */

  row.entityCount = account.entityCount
  row.accountName = name;
  row.accountID = id;
  row.errorGroupCount = 10;
  row.errorGroupAssignedPercentage = 999;
  row.errorGroupUnresolvedPercentage = 999;
  row.errorGroupIgnoredPercentage = 999;
  row.errorGroupCommentsPercentage = 999;

  return row;
}
