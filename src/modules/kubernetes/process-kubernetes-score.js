export function createKubernetesTableData(accountMap, { enricherFn = null }) {
  const k8sTable = [];

  for (const account of accountMap.values()) {
    const k8sRow = {};
    k8sRow.accountName = account.name;
    k8sRow.accountID = account.id;
    k8sRow.entityCount = account.getK8sClusterCount();

    k8sRow.infraAgentsInstalledPercentage = account.getInfraAgentsInstalledPercent();
    k8sRow.infraK8sEventsPercentage = account.getInfraK8sEventsPercent();
    k8sRow.prometheusLabelsPercentage = account.getPrometheusLabelsPercent();
    k8sRow.apmAgentsInsideK8sClustersPercentage = account.getApmAgentsInsideK8sClustersPercent();
    k8sRow.nrLogsEventsPercentage = account.getNrLogsEventsPercent();
    k8sRow.clustersUsingPixiePercentage = account.getClustersUsingPixiePercent();

    k8sRow.LIST = createKubernetesList(account.kubernetesMap);

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(k8sRow, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }
    k8sTable.push(k8sRow);
  }
  return k8sTable;
}

export function computeKubernetesMaturityScore({ rowData, scoreWeights }) {
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

export function createKubernetesList(kubernetesMap) {
  if (!kubernetesMap || (kubernetesMap && kubernetesMap.size === 0)) {
    return [];
  }
  const itr = kubernetesMap.values();
  let k8s = itr.next();
  const k8sList = [];

  while (!k8s.done) {
    const k8sObj = { ...k8s.value };
    k8sObj.isInfraAgentsInstalled = k8s.value.isInfraAgentsInstalled();
    k8sObj.isInfraK8sEventGenerated = k8s.value.isInfraK8sEventGenerated();
    k8sObj.isPrometheusLabelUsed = k8s.value.isPrometheusLabelUsed();
    k8sObj.isApmAgentsInstalledInsideK8sCluster = k8s.value.isApmAgentsInstalledInsideK8sCluster();
    k8sObj.isNrLogEnabled = k8s.value.isNrLogEnabled();
    k8sObj.isClusterUsingPixie = k8s.value.isClusterUsingPixie();
    k8sObj.existPixieUniqueServices = k8s.value.existPixieUniqueServices();

    k8sList.push(k8sObj);

    k8s = itr.next();
  }
  return k8sList;
}
