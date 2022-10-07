export const KUBERNETES_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entitySearch(query: $nrql) {
        count
        results(cursor: $cursor) {
          nextCursor
          entities {
            ... on InfrastructureIntegrationEntityOutline {
              integrationTypeCode
            }
            accountId
            alertSeverity
            domain
            entityType
            guid
            indexedAt
            name
            reporting
            tags {
              key
              values
            }
            type
          }
        }
      }
    }
  }`,
  variables: {
    // cursor: null
    // nrql:  "accountId=xxxxxxx and domain = 'INFRA' and type LIKE'KUBERNETES%'"
  }
};
