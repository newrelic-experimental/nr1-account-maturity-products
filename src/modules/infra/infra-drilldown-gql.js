export const INFRA_DRILLDOWN_ENTITIES_GQL = {
    query: `query ($cursor: String, $accountId: Int) {
      actor {
        entitySearch(query: "domain = 'INFRA' and type = 'HOST' and accountId= $accountId") {
          results(cursor: $cursor) {
            nextCursor
            entities {
              accountId
              guid
              name
              reporting
              ... on InfrastructureHostEntityOutline {
                guid
                name
                hostSummary {
                  servicesCount
                }
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


  