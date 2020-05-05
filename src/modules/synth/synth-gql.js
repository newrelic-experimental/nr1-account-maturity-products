export const SYNTH_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entitySearch(query: $nrql) {
        count
        results(cursor: $cursor) {
          entities {
            name
            ... on SyntheticMonitorEntityOutline {
              guid
              name
              alertSeverity
              monitorType
              reporting
              monitorId
              monitorSummary {
                locationsRunning
                locationsFailing
                successRate
              }
              tags {
                key
                values
              }
              period
              entityType
              domain
              accountId
            }
          }
          nextCursor
        }
      }
    }
  }
  `,
  variables: {
    // cursor: null
    // nrql:  "domain IN ('BROWSER') AND type IN ('APPLICATION') and accountId=xxxxxx"
  }
};
