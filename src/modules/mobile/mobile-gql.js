export const GET_MOBILE_APP_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
                  actor {
                    entitySearch(query: $nrql) {
                      count
                      results(cursor: $cursor) {
                        entities {
                          name
                          ... on MobileApplicationEntityOutline {
                            applicationId
                            guid
                            name
                            alertSeverity
                            reporting
                            mobileSummary {
                              appLaunchCount
                            }
                          }
                          accountId
                        }
                        nextCursor
                      }
                    }
                  }
                }

  `,
  variables: {
    // cursor: null
    // nrql:  "domain IN ('MOBILE') AND type IN ('APPLICATION') and accountId=xxxxxx"
  }
};
