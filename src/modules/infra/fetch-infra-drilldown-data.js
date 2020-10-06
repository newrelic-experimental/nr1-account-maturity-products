import { INFRA_DRILLDOWN_ENTITIES_GQL } from './infra-drilldown-gql';
import { Host } from './Host';

export async function fetchInfraDrilldownData(accountMap, accountId, gqlAPI, tag) {
  const account = accountMap.get(accountId);
  account.infraHosts = new Map();
  const result = await _fetchEntitiesWithAcctIdGQL(gqlAPI, account, tag);

  _onFulFilledHandler(result, account);
}

function _onFulFilledHandler(result, account) {
  for (const entity of result) {
    const host = new Host(entity);

    if (!account.infraHosts) {
      account.infraHosts = new Map();
    }

    account.infraHosts.set(host.guid, host);
  }
}
async function _fetchEntitiesWithAcctIdGQL(
  gqlAPI,
  account,
  tag,
  entityArr = [],
  cursor = null
) {
  const accountId = account.id;
  let entitySearchQuery = `domain = 'INFRA' and type = 'HOST' and accountId= ${accountId}`;
  if (tag !== null) {
    let split = tag.split(":");
    const key = split[0];
    const value = split[1];
    entitySearchQuery = `domain = 'INFRA' and type = 'HOST' and accountId= ${accountId} AND tags.${key} = '${value}'`;
  }

  const query = {
    ...INFRA_DRILLDOWN_ENTITIES_GQL,
    variables: {
      entitySearchQuery,
      cursor
    }
  };

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
    return _fetchEntitiesWithAcctIdGQL(gqlAPI, account, tag, entityArr, nextCursor);
  }
}
