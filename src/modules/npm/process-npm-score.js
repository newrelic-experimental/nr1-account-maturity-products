export function createNPMTableData(accountMap, { enricherFn = null }) {
  const npmTable = [];

  for (const account of accountMap.values()) {
    const npmRow = {};
    npmRow.accountName = account.name;
    npmRow.accountID = account.id;
    npmRow.snmpDeviceCount = account.getSnmpDeviceCount();

    // % devices without profiles -- using generic profile
    npmRow.noKentikProviderPercentage = account.getNoKentikProviderPercent();

    // % devices without entity definitions
    npmRow.devicesWithNoEntityDefinitionPercentage = account.getDevicesWithNoEntityDefinitionPercent();

    // % SNMP polling failures
    npmRow.snmpPollingFailurePercentage = account.getSnmpPollingFailurePercent();

    // # devices sending Network Flow data
    // npmRow.kentikFlowDeviceCount = account.getKentikFlowDeviceCount();
    npmRow.isKentikFlowDeviceUsed = account.isKentikFlowDeviceUsed();

    // # devices sending VPC Flow Log data
    // npmRow.kentikVpcDeviceCount = account.getKentikVpcDeviceCount();
    npmRow.isKentikVpcDeviceUsed = account.isKentikVpcDeviceUsed();

    // # devices sending Network Syslog data
    // npmRow.ktranslateSyslogDeviceCount = account.getKtranslateSyslogDeviceCount();
    npmRow.isKtranslateSyslogDeviceUsed = account.isKtranslateSyslogDeviceUsed();

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(npmRow, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }
    npmTable.push(npmRow);
  }
  return npmTable;
}

export function computeNPMMaturityScore({ rowData, scoreWeights }) {
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
