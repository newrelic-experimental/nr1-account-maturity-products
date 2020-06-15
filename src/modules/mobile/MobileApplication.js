class MobileApplication {
  constructor(entity) {
    // entity, entitySearch result model see apm-gql.js
    this.id = entity.applicationId;
    this.name = entity.name;
    this.guid = entity.guid;
    this.accountId = entity.accountId;

    this.reporting = entity.reporting;

    this.healthStatus = entity.alertSeverity;
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
}

export { MobileApplication };
