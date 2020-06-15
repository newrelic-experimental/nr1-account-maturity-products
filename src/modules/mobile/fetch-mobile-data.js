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
  let hasErrors = false;
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
    const acctErrors = options.poolOnFulfilled(event, accountMap);
    if (!hasErrors) {
      hasErrors = acctErrors;
    }
  });

  await pool.start();
  return hasErrors;
}

function _onFulFilledHandler(event, accountMap) {
  const { entityArr, hasErrors } = event.data.result;
  for (const entity of entityArr) {
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
  return hasErrors;
}

async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  entityArr = [],
  cursor = null,
  hasErrors = false
) {
  const { id } = account;
  const query = {
    ...GET_MOBILE_APP_SUBSCRIBER_ID_GQL,
    variables: {
      cursor,
      nrql: `domain IN ('MOBILE') AND type IN ('APPLICATION') and accountId=${id}`
    }
  };

  const response = await gqlAPI(query);
  if (!hasErrors) {
    const { errors } = response;
    hasErrors = errors != null;
  }

  if (
    !response.data.actor.entitySearch ||
    !response.data.actor.entitySearch.results
  ) {
    return { entityArr, hasErrors };
  }

  const { entities, nextCursor } = response.data.actor.entitySearch.results;
  entityArr = entityArr.concat(entities);

  if (nextCursor === null || (nextCursor != null && nextCursor.length === 0)) {
    return { entityArr, hasErrors };
  } else {
    return _fetchEntitiesWithAcctIdGQL(
      gqlAPI,
      account,
      entityArr,
      nextCursor,
      hasErrors
    );
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
