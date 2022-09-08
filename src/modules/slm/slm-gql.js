export const SLI_USED_COUNT_GQL = {
  query: `query ($accountId: Int!, $searchCriteria: String) {
    actor {
      account(id: $accountId) {
        alerts {
          nrqlConditionsSearch(searchCriteria: {queryLike: $searchCriteria}) {
            totalCount
            nrqlConditions {
              nrql {
                query
              }
            }
          }
        }
      }
    }
  }`,
  variables: {
    // accountId,
    // searchCriteria: 'newrelic.sli'
  }
};

export const SLM_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $nrql: String) {
    actor {
      entitySearch(query: $nrql) {
        results(cursor: $cursor) {
          entities {
            accountId
            alertSeverity
            name
            type
            serviceLevel {
              indicators {
                id
                name
              }
            }
            tags {
              key
              values
            }
          }
          nextCursor
        }
        count
      }
    }
  }`,
  variables: {
    // cursor: null
    // nrql:  `accountId=${accountId} and type = 'SERVICE_LEVEL'`
  }
};
