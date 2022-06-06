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