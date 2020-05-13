export const INFRA_DRILLDOWN_ENTITIES_GQL = {
  query: `query ($cursor: String, $entitySearchQuery: String) {
      actor {
        entitySearch(query: $entitySearchQuery) {
          results(cursor: $cursor) {
            nextCursor
            entities {
              accountId
              guid
              name
              reporting
              ... on InfrastructureHostEntityOutline {
                reporting
                alertSeverity
                tags {
                  key
                  values
                }
              }
            }
          }
          count
        }
      }
    }`,
  variables: {
    // cursor: null
  }
};
