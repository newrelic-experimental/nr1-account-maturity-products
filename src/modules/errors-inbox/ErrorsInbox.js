class ErrorsInbox {
    constructor(entity, account) {
        this.id = entity.applicationId;
        this.guid = entity.guid;
        this.name = entity.name;
        this.accountId = entity.accountId;

        let {
            totalErrorGroups,
            totalAssignedErrorGroups,
            errorGroupAssignedPercentage,
            errorGroupUnresolvedPercentage,
            errorGroupIgnoredPercentage,
            errorGroupCommentsPercentage,
        } = account

        this.totalErrorGroups = totalErrorGroups;
        this.totalAssignedErrorGroups = totalAssignedErrorGroups;
        this.errorGroupAssignedPercentage = errorGroupAssignedPercentage;
        this.errorGroupUnresolvedPercentage = errorGroupUnresolvedPercentage;
        this.errorGroupIgnoredPercentage = errorGroupIgnoredPercentage;
        this.errorGroupCommentsPercentage = errorGroupCommentsPercentage;
    }
}

export { ErrorsInbox };