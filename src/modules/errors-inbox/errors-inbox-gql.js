export const ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $accountIds: [Int!]) {
    actor {
      errorsInbox {
        totalErrorGroups: errorGroups(cursor: $cursor, filter: {accountIds: $accountIds}) {
          totalCount
          results {
            # comments {
            #   totalCount
            #   results {
            #     text
            #   }
            # }
            entityGuid
            id
            name
            state
          }
          nextCursor
        }
        totalAssignedErrorGroupCount: errorGroups(filter: {accountIds: $accountIds, isAssigned: true}) {
          totalCount
        }
      }
    }
  }`,
  variables: {
    // cursor: null
    // accountIds: [xxx]
  }
};
