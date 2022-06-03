class Workload {
    constructor(entity, account) {
        this.id = entity.applicationId;
        this.guid = entity.guid;
        this.name = entity.name;
        this.accountId = entity.accountId;
        this.reporting = entity.reporting;
        this.alertSeverity = entity.alertSeverity;

        this.relatedDashboards = (account.workloadsWithRelatedDashboards.find(wkld => wkld.workloadGuid === this.guid) || {}).relatedDashboards || 0;

        this.labels = [];
        if (entity.tags) {
            this.labels = entity.tags
            .map(tag => tag.key)
            .filter(
                key =>
                [
                    'account',
                    'accountId',
                    'language',
                    'trustedAccountId',
                    'guid'
                ].indexOf(key) === -1
            );
        }

       this.owner = '';
        if (entity.tags) {
            const ownerTag = entity.tags.find(tag => tag.key === 'Team');
            this.owner = ownerTag ?  ownerTag.values[0] : '';
        }
        console.log('### SK >>> Workload:constructor:this: ', this);
    }

    isAlerting() {
        // if (this.reporting) {
        //     if (
        //         this.alertSeverity.indexOf('NOT_CONFIGURED') === -1 ||
        //         this.alertSeverity.indexOf('') === -1
        //     ) {
        //         return true;
        //     }
        // }
        return false;
    }

    hasLabels() {
        // if (this.reporting) {
        //     if ((this.labels || []).length > 0) {
        //         return true;
        //     }
        // }
        return false;
    }

    hasOwner() {
        // return this.owner;

        return true;
    }

    hasRelatedDashboards() {
        // return this.relatedDashboards;
        return 3
    }
}

export { Workload };
