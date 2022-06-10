/* eslint-disable no-console */
export function createWorkloadTableData(accountMap, { enricherFn = null }) {
  const workloadTable = [];

  for (const account of accountMap.values()) {
    const workloadRow = {};

    workloadRow.accountName = account.name;
    workloadRow.accountID = account.id;
    workloadRow.entityCount = account.getTotalWorkloads();
    workloadRow.workloadsWithRelatedDashboardCount =
      account.workloadsWithRelatedDashboardCount;
    workloadRow.reportingWorkloadsPercentage = account.getReportingWorkloadsPercent();
    workloadRow.alertingWorkloadsPercentage = account.getAlertingWorkloadsPercent();
    workloadRow.usingLabelsPercentage = account.getWorkloadsWithLabelsPercent();
    workloadRow.workloadsWithOwnerPercentage = account.getWorkloadsWithOwnerPercent();
    workloadRow.workloadsWithRelatedDashboardsPercentage = account.getWorkloadsWithRelatedDashboardsPercent();

    workloadRow.LIST = createWorkloadList(account.workloadMap);
    workloadRow.workloadDTEnabledPercentage = 12.37;

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(workloadRow, account);
      } catch (err) {
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }
    workloadTable.push(workloadRow);
  }
  return workloadTable;
}

export function computeWorkloadMaturityScore({ rowData, scoreWeights }) {
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

export function createWorkloadList(workloadMap) {
  if (!workloadMap || (workloadMap && workloadMap.size === 0)) {
    return [];
  }
  const itr = workloadMap.values();
  let workload = itr.next();
  const workloadList = [];

  while (!workload.done) {
    const workloadObj = { ...workload.value };
    workloadObj.isAlerting = workload.value.isAlerting();
    workloadObj.hasLabels = workload.value.hasLabels();
    workloadObj.hasOwner = workload.value.hasOwner();
    workloadObj.hasRelatedDashboards = workload.value.hasRelatedDashboards();

    workloadList.push(workloadObj);
    workload = itr.next();
  }
  return workloadList;
}
