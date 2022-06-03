// workloads created
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

// linked dashboards
export const WORKLOAD_RELATED_DASHBOARDS_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entity(guid: "NzM5NTE2fE5SMXxXT1JLTE9BRHw4NzEzOA") {
        accountId
        alertSeverity
        alertStatus
        domain
        entityType
        guid
        indexedAt
        name
        permalink
        reporting
        type
        relatedEntities(filter: {entityDomainTypes: {include: {domain: "VIZ", type: "DASHBOARD"}}}) {
          results {
            target {
              entity {
                type
                domain
                guid
                name
              }
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

// workloads with owner details ("Team" tag)
export const WORKLOAD_OWNER_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entity(guid: "NzM5NTE2fE5SMXxXT1JLTE9BRHw4NzEzOA") {
        accountId
        alertSeverity
        alertStatus
        domain
        entityType
        guid
        indexedAt
        name
        permalink
        reporting
        type
        ... on WorkloadEntity {
          guid
          name
          tags {
            key
            values
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
