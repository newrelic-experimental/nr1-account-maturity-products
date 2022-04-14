class ErrorInbox {
    constructor(entity, account) {
        this.id = entity.applicationId;
        this.guid = entity.guid;
        this.name = entity.name;
        this.accountId = entity.accountId;

        // console.log('entity', entity)
        // console.log('account', account)

        this.errorGroupCount = 0;
        this.errorGroupAssignedPercentage = 999;
        this.errorGroupUnresolvedPercentage = 999;
        this.errorGroupIgnoredPercentage = 999;
        this.errorGroupCommentsPercentage = 999;
    }
}

export { ErrorInbox };