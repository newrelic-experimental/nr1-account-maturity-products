//* eslint-disable no-unneeded-ternary */
/* eslint-disable no-useless-escape */
/* eslint-disable prettier/prettier */
      class SLM {
  constructor(entity, account) {
    this.id = entity.id;
    this.guid = entity.guid;
    this.name = entity.name;
    this.accountId = entity.accountId;
    this.account = account;

    this.reporting = entity.reporting ? entity.reporting : false;

    this.healthStatus = entity.alertSeverity
      ? entity.alertSeverity
      : 'NOT_CONFIGURED';
    this.alertConditions = [];

    this.tags = entity.tags;
    this.labels = this.tags.map(tag => tag.key.toLowerCase());
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

  hasOwner() {
    return this.labels.length && this.labels.includes('owner');
  }

  hasSLIQueryAlerts() {
    for (const condition of this.account.sliNrqlConditions.nrqlConditions) {
      const rxResult = condition.nrql.query.match(/sli\.guid\s*=\s*\'([a-zA-Z0-9]*)\'/)

      if (rxResult === null || rxResult[1] === this.guid) {
        return true;
      }
    }
    return false;
  }

}

export { SLM };
