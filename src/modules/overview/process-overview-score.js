export function createTableData(accountMap, maturityScores, enricherFn = null) {
  const itr = accountMap.entries();
  let entry = itr.next();
  const tableData = [];
  const scoreKeys = [];

  while (!entry.done) {
    const [accountId, account] = entry.value;
    const { id, name } = account;
    let rowData = {};

    // eslint-disable-next-line guard-for-in
    for (const productId in maturityScores) {
      const acctProductScore = maturityScores[productId];
      const scoreKey = `${productId}_SCORE`;
      const acctDetails = acctProductScore[accountId]
        ? { ...acctProductScore[accountId] }
        : {
            accountID: id,
            accountName: name,
            SCORE: 0
          };
      acctDetails[scoreKey] = acctDetails.SCORE || 0;
      delete acctDetails.SCORE;

      rowData = { ...acctDetails, ...rowData };

      if (enricherFn && typeof enricherFn === 'function') {
        try {
          enricherFn(rowData, account);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Enricher failed with error=${JSON.stringify(err)}`);
          throw err;
        }
      }
      scoreKeys.push(scoreKey);
    }

    console.log('rowData', rowData)

    tableData.push(rowData);
    entry = itr.next();
  }
  // dedup keys
  return {
    tableData,
    scoreKeys: (keys =>
      keys.filter((val, index) => keys.indexOf(val) === index))(scoreKeys)
  };
}
