export const GET_INSIGHTS_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
            actor {
              entitySearch(query: $nrql) {
                count
                query
                results(cursor: $cursor) {
                  entities {
                    name
                    guid
                    accountId
                    reporting
                  }
                  nextCursor
                }
              }
            }
          }
  `,
  variables: {
    // cursor: null
    // nrql:  "type IN ('DASHBOARD') and accountId=xxxxxx"
  }
};
