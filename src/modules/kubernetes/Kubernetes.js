/* eslint-disable no-unneeded-ternary */
class Kubernetes {
  constructor(entity, account) {
    this.id = entity.id;
    this.guid = entity.guid;
    this.name = entity.name;
    this.accountId = entity.accountId;
    this.integrationTypeCode = entity.integrationTypeCode;
    this.account = account;

    this.reporting = entity.reporting ? entity.reporting : false;

    this.healthStatus = entity.alertSeverity
      ? entity.alertSeverity
      : 'NOT_CONFIGURED';
    this.alertConditions = [];

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
    this.pixieUniqueSpans = account.pixieUniqueSpans;
    this.pixieUniqueUrls = account.pixieUniqueUrls;
    this.prometheousLabels = account.prometheousLabels;
  }

  isAlerting() {
    if (this.reporting) {
      if (
        this.healthStatus.indexOf('NOT_CONFIGURED') === -1 ||
        this.healthStatus.indexOf('') === -1
      ) {
        return true;
      }
    }
    return false;
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

  isPrometheousLabelUsed() {
    const result = this.prometheousLabels.filter(
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
    const result = this.pixieUniqueServices.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  existPixieUniqueSpans() {
    const result = this.pixieUniqueSpans.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }

  existPixieUniqueUrls() {
    const result = this.pixieUniqueUrls.filter(
      cluster => cluster.clusterName === this.name
    );
    return result.length ? true : false;
  }
}

export { Kubernetes };
