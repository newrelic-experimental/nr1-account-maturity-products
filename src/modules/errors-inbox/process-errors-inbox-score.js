export function createErrorsInboxTableData(accountMap, { enricherFn = null }) {
  const table = [];

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
  const row = {};
  const { id, name } = account;

  row.accountName = name;
  row.accountID = id;
  row.entityCount = account.getErrorsInboxGroupCount();
  row.assignedErrorGroupCount = account.getAssignedErrorGroupCount();
  row.errorGroupAssignedPercentage = account.getErrorGroupAssignedPercent();
  row.errorGroupUnresolvedPercentage = account.getErrorGroupUnresolvedPercent();
  row.errorGroupIgnoredPercentage = account.getErrorGroupIgnoredPercent();

  row.errorGroupCommentsPercentage = account.getErrorGroupCommentsPercent();
  return row;
}
