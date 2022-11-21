export const ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL = {
  query: `query ($cursor: String, $accountIds: [Int!], $startTime: EpochMilliseconds!, $endTime: EpochMilliseconds!) {
    actor {
      errorsInbox {
        errorGroups: errorGroups(cursor: $cursor, filter: {accountIds: $accountIds}, timeWindow: {startTime: $startTime, endTime: $endTime}) {
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
            assignment {
              email
              userInfo: userInfo {
                email
                id
                name
              }
            }
          }
          nextCursor
        }
        assignedErrorGroupCount: errorGroups(filter: {accountIds: $accountIds, isAssigned: true}, timeWindow: {startTime: $startTime, endTime: $endTime}) {
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
