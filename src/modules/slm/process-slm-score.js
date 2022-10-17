export function createSLMTableData(accountMap, { enricherFn = null }) {
  const slmTable = [];

  for (const account of accountMap.values()) {
    const slmRow = {};
    slmRow.accountName = account.name;
    slmRow.accountID = account.id;
    slmRow.entityCount = account.slmMap.size;

    slmRow.sliUsedInAlertsCount = account.sliUsedInAlertsCount(); // not scored
    slmRow.isUsingSLI = account.isUsingSLI();
    slmRow.hasSLIAlerting = account.hasSLIAlerting();
    slmRow.getOwnerPercentage = account.getOwnerPercent();

    slmRow.LIST = createSLMList(account.slmMap);

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(slmRow, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }
    slmTable.push(slmRow);
  }
  return slmTable;
}

export function computeSLMMaturityScore({ rowData, scoreWeights }) {
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

export function createSLMList(slmMap) {
  if (!slmMap || (slmMap && slmMap.size === 0)) {
    return [];
  }
  const itr = slmMap.values();
  let slm = itr.next();
  const slmList = [];

  while (!slm.done) {
    const slmObj = { ...slm.value };
    slmObj.hasSLIQueryAlerts = slm.value.hasSLIQueryAlerts();
    slmObj.hasOwner = slm.value.hasOwner();

    slmList.push(slmObj);

    slm = itr.next();
  }
  return slmList;
}
