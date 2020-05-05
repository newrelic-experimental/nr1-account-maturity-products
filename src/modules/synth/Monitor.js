export class Monitor {
  constructor(entity) {
    this.id = entity.monitorId;
    this.name = entity.name;
    this.guid = entity.guid;
    this.accountId = entity.accountId;

    this.reporting =
      entity.monitorSummary && entity.monitorSummary.locationsRunning
        ? entity.monitorSummary.locationsRunning > 0
        : false;

    this.monitorType = entity.monitorType;
    this.healthStatus = entity.alertSeverity;
    this.period = entity.period;

    this.alertConditions = [];
    this.locations = 0;
    this.privateLocation = false;

    this.locationsRunning = entity.monitorSummary
      ? entity.monitorSummary.locationsRunning
      : 0;
    this.locationsFailing = entity.monitorSummary
      ? entity.monitorSummary.locationsFailing
      : 0;
    this.successRate = entity.monitorSummary
      ? entity.monitorSummary.successRate
      : 0;

    this.labels = entity.tags
      ? entity.tags
          .map(tag => tag.key)
          .filter(key => {
            this.privateLocation = key === 'privateLocation';

            return (
              [
                'account',
                'accountId',
                'trustedAccountId',
                'monitorStatus',
                'monitorType',
                'period',
                'publicLocation'
              ].indexOf(key) === -1
            );
          })
      : [];
  }

  isAlerting() {
    if (!this.reporting) {
      return false;
    }

    return (
      this.healthStatus.indexOf('NOT_CONFIGURED') === -1 ||
      this.healthStatus.indexOf('') === -1
    );
  }

  hasLabels() {
    if (!this.reporting) {
      return false;
    }

    return this.labels ? this.labels.length > 0 : 0;
  }

  has1plusLocations() {
    if (!this.reporting) {
      return false;
    }

    return this.locationsRunning > 1;
  }
}
