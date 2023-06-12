export function createErrorsInboxTableData(accountMap, { enricherFn = null }) {
  const table = [];

  for (const account of accountMap.values()) {
    const row = _processErrorsInboxData(account);

    row.LIST = createErrorsInboxList(account.errorsInbox);

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
  row.errorGroupAssignedPercentage = account.getErrorGroupAssignedPercent();
  row.errorGroupResolvedPercentage = account.getErrorGroupResolvedPercent();
  row.errorGroupIgnoredPercentage = account.getErrorGroupIgnoredPercent();
  return row;
}

export function createErrorsInboxList(errorsInbox) {
  if (!errorsInbox || (errorsInbox && errorsInbox.size === 0)) {
    return [];
  }
  const itr = errorsInbox.values();
  let errorGroup = itr.next();
  const errorGroupList = [];

  while (!errorGroup.done) {
    const errorGroupObj = { ...errorGroup.value };
    errorGroupObj.isErrorGroupAssigned = errorGroup.value.isErrorGroupAssigned();

    errorGroupList.push(errorGroupObj);

    errorGroup = itr.next();
  }
  return errorGroupList;
}
