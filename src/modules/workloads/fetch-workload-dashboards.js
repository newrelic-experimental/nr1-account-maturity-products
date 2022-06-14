import PromisePool from 'es6-promise-pool';
import { WORKLOAD_RELATED_DASHBOARDS_COUNT_GQL } from './workload-gql';

const POOLMAXCONCURRENCY = 20;
const MAXGUIDS = 25;

export async function getWorkloadRelatedDashboardsCount(
  accountMap,
  accountId,
  gqlAPI
) {
  const dashboardCountGenerator = getWorkloadDashboardCount(
    accountMap,
    accountId,
    gqlAPI
  );
  const pool = new PromisePool(dashboardCountGenerator, POOLMAXCONCURRENCY);

  pool.addEventListener('fulfilled', event => {
    _dashboardPoolOnFulfilled(event, accountMap, accountId);
  });

  await pool.start();
}

function _dashboardPoolOnFulfilled(event, accountMap, accountId) {
  // add workload dashboard counts to Workload objects
  const account = accountMap.get(accountId);
  for (const entity of event.data.result.data.actor.entities) {
    const workload = account.workloadMap.get(entity.guid);
    workload.relatedDashboards =
      entity && entity.relatedEntities && entity.relatedEntities.results
        ? entity.relatedEntities.results.length
        : 0;
  }
}

export function* getWorkloadDashboardCount(accountMap, accountId, gqlAPI) {
  const query = {
    ...WORKLOAD_RELATED_DASHBOARDS_COUNT_GQL
  };

  yield (async () => {
    const promises = [];
    const workloads = Array.from(accountMap.get(accountId).workloadMap.keys());
    let response = {
      data: {
        actor: {
          entities: []
        }
      }
    };
    if (workloads.length) {
      while (workloads.length) {
        const workloadGuids = workloads.splice(0, MAXGUIDS);
        query.variables = {
          workloadGuids
        };

        promises.push(gqlAPI(query));
      }
      const results = await Promise.all(promises);
      response = assembleResults(results);
    }
    return Promise.resolve(response);
  })();
}

export function assembleResults(results) {
  const response = {
    data: {
      actor: {
        entities: []
      }
    }
  };
  let ctr = 0;
  for (const result of results) {
    if (result.error?.graphQLErrors) {
      // eslint-disable-next-line no-console
      console.log(
        `warning: assembleResults() Error found in results. Error=`,
        result.error.graphQLErrors,
        ` result=`,
        result
      );
    }

    if (
      result.data &&
      result.data.actor &&
      result.data.actor.entities !== null
    ) {
      ctr++;
      response.data.actor.entities = [
        ...response.data.actor.entities,
        ...result.data.actor.entities
      ];
    }
  }
  return ctr > 0 ? response : null;
}
