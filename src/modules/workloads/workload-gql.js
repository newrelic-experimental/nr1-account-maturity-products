export const WORKLOAD_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entitySearch(query: $nrql) {
        count
        results(cursor: $cursor) {
          nextCursor
          entities {
            accountId
            alertSeverity
            guid
            indexedAt
            name
            reporting
            tags {
              key
              values
            }
          }
        }
      }
    }
  }`,
  variables: {
    // cursor: null
    // nrql:  "domain IN ('APM') AND type IN ('APPLICATION') and accountId=xxxxxx"
  }
};

export const WORKLOAD_RELATED_DASHBOARDS_COUNT_GQL = {
  query: `query ($workloadGuids: [EntityGuid]!) {
    actor {
      entities(guids: $workloadGuids) {
        name
        relatedEntities(filter: {entityDomainTypes: {include: {domain: "VIZ", type: "DASHBOARD"}}}) {
          count
        }
        guid
        accountId
      }
    }
  }`,
  variables: {
    // workloadGuids: [ guid1, guid2, ...]
  }
};
