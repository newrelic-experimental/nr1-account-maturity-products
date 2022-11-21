class ErrorsInbox {
  constructor(entity, account) {
    this.id = entity.id;
    this.entityGuid = entity.entityGuid;
    this.name = entity.name;
    this.accountId = account.id;
    this.state = entity.state;
    this.assignment = entity.assignment;
  }

  isErrorGroupAssigned() {
    return (
      (this.assignment !== null && this.assignment.email !== null) ||
      (this.assignment !== null && this.assignment.userInfo !== null) ||
      false
    );
  }
}

export { ErrorsInbox };
