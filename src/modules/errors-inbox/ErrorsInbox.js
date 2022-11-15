class ErrorsInbox {
  constructor(entity, account) {
    this.id = entity.id;
    this.entityGuid = entity.entityGuid;
    this.name = entity.name;
    this.accountId = account.id;
    this.state = entity.state;
  }
}

export { ErrorsInbox };
