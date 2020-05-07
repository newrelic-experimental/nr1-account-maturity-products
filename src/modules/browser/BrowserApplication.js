class BrowserApplication {
  // https://docs.newrelic.com/docs/release-notes/new-relic-browser-release-notes/browser-agent-release-notes/browser-agent-v1153
  static DT_Support_Version = 1153;

  constructor(entity, account) {
    this.id = entity.applicationId;
    this.guid = entity.guid;
    this.name = entity.name;
    this.accountId = entity.accountId;

    this.throughput = 0;
    this.reporting = entity.reporting ? entity.reporting : false;
    this.apdexT =
      entity.settings && entity.settings.apdexTarget
        ? entity.settings.apdexTarget
        : 0;

    this.maxVersion = entity.runningAgentVersions
      ? entity.runningAgentVersions.maxVersion ||
        entity.runningAgentVersions.minVersion
      : '0.0.1';

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

    this.pageAction =
      account.pageActionList && account.pageActionList.includes(name);

    this.autoInstrumentation = entity.servingApmApplicationId !== null;
    this.spaAgentEnabled =
      entity.browserSummary && entity.browserSummary.spaResponseTimeAverage;
  }

  isDTCapable() {
    return this.maxVersion >= BrowserApplication.DT_Support_Version;
  }

  isCustomApdex() {
    return this.reporting && this.apdexT > 0 && this.apdexT !== 7;
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

  isAutoInstrumentation() {
    if (this.reporting) {
      if (this.autoInstrumentation) {
        return true;
      }
    }
    return false;
  }
}

export { BrowserApplication };
