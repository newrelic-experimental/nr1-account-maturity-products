class Workload {
  // eslint-disable-next-line no-unused-vars
  constructor(entity, account) {
    this.id = entity.id;
    this.guid = entity.guid;
    this.name = entity.name;
    this.accountId = entity.accountId;

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
  }

  hasOwner() {
    return this.owner !== undefined;
  }

  hasRelatedDashboards() {
    return this.relatedDashboards > 0; // ###
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
}

export { Workload };
