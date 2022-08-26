/* eslint-disable no-unneeded-ternary */
class Kubernetes {
  constructor(entity, account) {
    this.guid = entity.guid;
    this.name = entity.name;
    this.accountId = entity.accountId;
    this.integrationTypeCode = entity.integrationTypeCode;
    this.type = entity.type;
    this.account = account;

    this.tags = entity.tags;
    this.labels = this.tags
      ? this.tags
          .map(tag => tag.key)
          .filter(
            key =>
              ['account', 'accountId', 'trustedAccountId'].indexOf(key) === -1
          )
      : [];

    this.owner = false;
    if (entity.tags) {
      this.owner = entity.tags.find(tag => tag.key.toLowerCase() === 'team');
    }

    this.apmAgentsInsideK8sClusters = account.apmAgentsInsideK8sClusters;
    this.clustersUsingPixie = account.clustersUsingPixie;
    this.infraAgentsInstalled = account.infraAgentsInstalled;
    this.infraK8sEvents = account.infraK8sEvents;
    this.nrLogsEvents = account.nrLogsEvents;
    this.pixieUniqueServices = account.pixieUniqueServices;
    this.prometheusLabels = account.prometheusLabels;
    // this.pixieUniqueSpans = account.pixieUniqueSpans;
    // this.pixieUniqueUrls = account.pixieUniqueUrls;
  }

  hasLabels() {
    if (this.reporting) {
      if ((this.labels || []).length > 0) {
        return true;
      }
    }
    return false;
  }

  isClusterUsingPixie() {
    const result = this.clustersUsingPixie.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  isInfraAgentsInstalled() {
    const result = this.infraAgentsInstalled.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  isInfraK8sEventGenerated() {
    const result = this.infraK8sEvents.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  isPrometheusLabelUsed() {
    const result = this.prometheusLabels.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  isApmAgentsInstalledInsideK8sCluster() {
    const result = this.apmAgentsInsideK8sClusters.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  isNrLogEnabled() {
    const result = this.nrLogsEvents.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  existPixieUniqueServices() {
    const result = this.pixieUniqueServices.find(
      service => service.clusterName === this.name
    );
    return result === undefined ? 0 : result.pixieServices;
  }
}

export { Kubernetes };
