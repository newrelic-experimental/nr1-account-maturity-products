export const ERRORSINBOX_ENTITIES_GQL = {
    query: `query ($cursor: String, $accountIds: [Int!]) {
      actor {
        errorsInbox {
          errorGroups(cursor: $cursor, filter: {accountIds: $accountIds}) {
            totalCount
            results {
              state
              comments {
                totalCount
                results {
                  text
                }
              }
            }
          }
        }
      }
    }`,
    variables: {
      // cursor: null
      // accountIds: [xxx]
    }
  };
  
export const ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $accountIds: [Int!]) {
    actor {
      errorsInbox {
        errorGroups(cursor: $cursor, filter: {accountIds: $accountIds}) {
          totalCount
          results {
            state
            comments {
              totalCount
              results {
                text
              }
            }
          }
        }
      }
    }
  }`,
  variables: {
    // cursor: null
    // accountIds: [xxx]
  }
};
