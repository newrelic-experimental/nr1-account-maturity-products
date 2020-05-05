export const BROWSER_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entitySearch(query: $nrql) {
        count
        results(cursor: $cursor) {
          nextCursor
          entities {
            ... on BrowserApplicationEntityOutline {
              accountId
              account {
                reportingEventTypes
              }
              alertSeverity
              guid
              name
              settings {
                apdexTarget
              }
              servingApmApplicationId
              applicationId
              tags {
                key
                values
              }
              browserSummary {
                spaResponseTimeAverage
              }
              reporting
              runningAgentVersions {
                maxVersion
                minVersion
              }
            }
          }
        }
      }
    }
  }`,
  variables: {
    // cursor: null,
    // nrql:  "domain IN ('BROWSER') AND type IN ('APPLICATION') and accountId=xxxxxx"
  }
};
