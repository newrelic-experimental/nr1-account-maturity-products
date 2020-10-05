import { MobileApplication } from './MobileApplication';
import PromisePool from 'es6-promise-pool';
import { GET_MOBILE_APP_SUBSCRIBER_ID_GQL } from './mobile-gql';

export async function fetchMobileData(
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
    const { accountId } = entity;
    const account = accountMap.get(accountId);
    const mobileApplication = new MobileApplication(entity);

    const breadcrumbs = account.mobileBreadcrumbs.find(
      app => app.appName === entity.name
    );
    const handledExceptions = account.mobileHandledExceptions.find(
      app => app.appName === entity.name
    );
    const mobileEvents = account.mobileEvents.find(
      app => app.appName === entity.name
    );

    mobileApplication.breadcrumbs = breadcrumbs ? breadcrumbs.count : 0;
    mobileApplication.handledExceptions = handledExceptions
      ? handledExceptions.count
      : 0;
    mobileApplication.mobileEvents = mobileEvents ? mobileEvents.count : 0;

    if (!account.mobileApps) {
      account.mobileApps = new Map();
    }

    account.mobileApps.set(mobileApplication.guid, mobileApplication);
  }
}

async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  tag,
  entityArr = [],
  cursor = null
) {
  const { id } = account;
  let query = {
    ...GET_MOBILE_APP_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('MOBILE') AND type IN ('APPLICATION') and accountId=${id}`
    }
  };

  if (tag !== null) {
    query = {
      ...GET_MOBILE_APP_SUBSCRIBER_ID_GQL,
      variables: {
        cursor,
        nrql: `domain IN ('MOBILE') AND type IN ('APPLICATION') and accountId=${id} AND tags.${key} = '${value}'`
      }
    };
  }

  const response = await gqlAPI(query);

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return entityArr;
  }

  const { entities, nextCursor } = response.data.actor.entitySearch.results;
  entityArr = entityArr.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return entityArr;
  } else {
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, entityArr, nextCursor);
  }
}

export const MobileModel = {
  scoreWeights: {
    mobileTotalAppPercentage: 0.05,
    mobileLatestAgentPercentage: 0.15,
    mobileUsingBreadcrumbsPercentage: 0.15,
    mobileUsingHandledExceptionsPercentage: 0.15,
    mobileAppsActivePercentage: 0.05,
    appsWithAlertsPercentage: 0.2,
    mobileAppLaunch: 0.05
  },

  rowDataEnricher: null
};
