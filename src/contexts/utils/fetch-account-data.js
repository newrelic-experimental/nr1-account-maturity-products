import {
  getCloudLinkedAccounts,
  getAgentReleases,
  getDocEventTypes,
  FETCH_ACCOUNTS_GQL
} from './index';

export async function fetchAccounts(nerdGraphQuery) {
  let accounts = [];
  let cloudLinkedAccounts = {};
  let docEventTypes = {};
  let docAgentLatestVersion = {};

  accounts = await _getGqlAccounts(nerdGraphQuery);
  cloudLinkedAccounts = await getCloudLinkedAccounts(nerdGraphQuery);
  docAgentLatestVersion = await getAgentReleases(nerdGraphQuery);
  docEventTypes = getDocEventTypes();

  return {
    accounts,
    cloudLinkedAccounts,
    docEventTypes,
    docAgentLatestVersion
  };
}

async function _getGqlAccounts(nerdGraphQuery) {
  const { data } = await nerdGraphQuery(FETCH_ACCOUNTS_GQL);
  let accounts = [];
  try {
    accounts = data.actor.accounts; // [{id, name, reportingEventTypes}]
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return accounts;
}
