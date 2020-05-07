const semver = require('semver');

class Application {
  constructor(entity, account) {
    // entity, entitySearch result model see apm-gql.js
    this.id = entity.applicationId;
    this.name = entity.name;
    this.guid = entity.guid;
    this.accountId = entity.accountId;

    this.throughput = entity.apmSummary ? entity.apmSummary.throughput : 0;
    this.reporting = entity.reporting;
    this.apdexT = entity.settings ? entity.settings.apdexTarget : 0;

    this.maxVersion = entity.runningAgentVersions
      ? entity.runningAgentVersions.maxVersion ||
        entity.runningAgentVersions.minVersion
      : '0.0.0';

    this.language = entity.language;
    this.deployMarker =
      account.deploymentAppList &&
      account.deploymentAppList.length > 0 &&
      account.deploymentAppList.includes(this.id);

    this.dtEnabled =
      account.dtAppList &&
      account.dtAppList.length &&
      account.dtAppList.includes(this.name);

    this.healthStatus = entity.alertSeverity;
    this.alertConditions = [];
    this.labels = [];
    if (entity.tags) {
      this.labels = entity.tags
        .map(tag => tag.key)
        .filter(
          key =>
            ['account', 'accountId', 'language', 'trustedAccountId'].indexOf(
              key
            ) === -1
        );
    }

    this.keyTxns = [];
  }

  isDTCapable() {
    let isDTCapable = false;
    try {
      if (this.reporting) {
        switch (this.language) {
          case 'python':
            if (semver.gt(semver.coerce(this.maxVersion), '4.1.0')) {
              isDTCapable = true;
            }
            break;
          case 'ruby':
            if (semver.gt(semver.coerce(this.maxVersion), '5.2.0')) {
              isDTCapable = true;
            }
            break;
          case 'nodejs':
            if (semver.gt(semver.coerce(this.maxVersion), '4.3.0')) {
              isDTCapable = true;
            }
            break;
          case 'go':
            if (semver.gt(semver.coerce(this.maxVersion), '2.0.0')) {
              isDTCapable = true;
            }
            break;
          case 'dotnet':
            if (semver.gt(semver.coerce(this.maxVersion), '8.5.45')) {
              isDTCapable = true;
            }
            break;
          case 'php':
            if (semver.gt(semver.coerce(this.maxVersion), '8.3.0')) {
              isDTCapable = true;
            }
            break;
          case 'java':
            if (semver.gt(semver.coerce(this.maxVersion), '4.2.0')) {
              isDTCapable = true;
            }
            break;
          default:
            isDTCapable = false;
        }
      }
      return isDTCapable;
    } catch (err) {
      return isDTCapable;
    }
  }

  isCustomApdex() {
    if (this.reporting) {
      if (
        (this.apdexT !== 0.5 && this.language !== 'nodejs') ||
        (this.apdexT !== 0.1 && this.language === 'nodejs')
      ) {
        return true;
      }
    }
    return false;
  }

  isDTEnabled() {
    if (this.reporting) {
      if (this.dtEnabled) {
        return true;
      }
    }
    return false;
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

  hasReportingKeyTxns() {
    if (this.reporting) {
      if ((this.keyTxns || []).length > 0) {
        for (const kt of this.keyTxns) {
          if (kt.reporting) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getAlertingKeyTxns() {
    let total = 0;
    if (this.reporting) {
      if ((this.keyTxns || []).length > 0) {
        for (const kt of this.keyTxns) {
          if (kt.isAlerting()) {
            total++;
          }
        }
      }
    }
    return total;
  }

  getReportingKeyTxns() {
    let total = 0;
    if (this.reporting) {
      if ((this.keyTxns || []).length > 0) {
        for (const kt of this.keyTxns) {
          if (kt.reporting) {
            total++;
          }
        }
      }
    }
    return total;
  }
}

export { Application };
