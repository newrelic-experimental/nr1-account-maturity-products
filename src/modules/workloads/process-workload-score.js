/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
// /* eslint-disable guard-for-in */
// /* eslint-disable dot-notation */
// import semver from 'semver';
// import _ from 'lodash';

export function createWorkloadTableData(accountMap, { enricherFn = null }) {
  const workloadTable = [];
  console.log('### SK >>> process-worklaods-score->accountMap:  ', accountMap);

  for (const account of accountMap.values()) {
    const workloadRow = {};

    workloadRow.accountName = account.name;
    workloadRow.accountID = account.id;
    workloadRow.entityCount = account.getTotalWorkloads();
    workloadRow.reportingWorkloadsPercentage = account.getReportingWorkloadsPercent();
    workloadRow.alertingWorkloadsPercentage = account.getAlertingWorkloadsPercent();
    workloadRow.usingLabelsPercentage = account.getWorkloadsWithLabelsPercent();
    workloadRow.workloadsWithOwnerPercentage = account.getWorkloadsWithOwnerPercent();
    workloadRow.workloadsWithRelatedDashboardsPercentage = account.getWorkloadsWithRelatedDashboardsPercent();

    // console.log('### SK >>> process-worklaods-score->workloadRow:  ', workloadRow);

    // ### SK - DEBUG - don't create workload entity "LIST" for each account
    workloadRow.LIST = createWorkloadList(
      account.workloadViews
    );

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        console.log('### SK >>> process-worklaods-score:using enricherFn:  ', enricherFn);
        enricherFn(workloadRow, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }

    // console.log('### SK >>> process-worklaods-score->createWorkloadTableData:workloadRow  ', workloadRow);
    workloadTable.push(workloadRow);
  }
  console.log('### SK >>> process-worklaods-score->workloadTable: ', workloadTable);
  return workloadTable;
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

    // // fsakr data
    // workloadObj.isAlerting = true;
    // workloadObj.hasLabels = true;
    // workloadObj.hasOwner = false;
    // workloadObj.hasRelatedDashboards = false;

// ###
    workloadList.push(workloadObj);
// ###
    workload = itr.next();
// ###
  }

  return workloadList;
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
