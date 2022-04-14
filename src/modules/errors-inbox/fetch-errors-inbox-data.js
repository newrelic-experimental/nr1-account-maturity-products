import { ErrorsInbox } from './ErrorInbox'
import PromisePool from 'es6-promise-pool';
import { ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL } from './errors-inbox-gql';

export const ErrorsInboxModel = {
  scoreWeights: {
    // errorGroupCount: 0,
    errorGroupAssignedPercentage: 0.4,
    errorGroupUnresolvedPercentage: 0.2,
    errorGroupIgnoredPercentage: 0.2,
    errorGroupCommentsPercentage: 0.2
  },
  rowDataEnricher: null
};


export async function fetchErrorsInboxData(
  accountMap,
  gqlAPI,
  overrides = {
    fetchEntities: _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: _onFulFilledHandler,
    poolMaxConcurreny: 50
  }
) {
  const options = {
    fetchEntities: overrides.fetchEntities || _fetchEntitiesWithAcctIdGQL,
    poolOnFulfilled: overrides.poolOnFulfilled || _onFulFilledHandler,
    poolMaxConcurreny: overrides.poolMaxConcurreny || 50
  };

  const _getEntities = function*() {
    for (const account of accountMap.values()) {
      yield options.fetchEntities(gqlAPI, account);
    }
  };

  const pool = new PromisePool(_getEntities(), options.poolMaxConcurreny);

  pool.addEventListener('fulfilled', event => {
    options.poolOnFulfilled(event, accountMap);
  });

  await pool.start();
}

function _onFulFilledHandler(event, accountMap) {
  for (const entity of event.data.result) {
    console.log('event.data.result', event.data.result)
    const { accountId } = entity;
    const account = accountMap.get(accountId);
    const application = new ErrorsInbox(entity, account);

    if (!account.errorsInbox) {
      account.errorsInbox = new Map();
    }

    account.errorsInbox.set(application.guid, application);
  }
}


async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  entityArr = [],
  cursor = null
) {
  const accountId = account.id;
  const query = {
    ...ERRORSINBOX_ENTITIES_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      accountIds: [accountId],
    }
  };

  const response = await gqlAPI(query);

  if (
    !response.data.actor.errorInbox ||
    !response.data.actor.errorInbox.errorGroups
  ) {
    return entityArr;
  }

  const { results, nextCursor } = response.data.actor.errorInbox.errorGroups;
  entityArr = entityArr.concat(results);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return entityArr;
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, entityArr, nextCursor);
  }
}