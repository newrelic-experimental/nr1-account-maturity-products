/* eslint-disable no-console */
import _ from 'lodash';
import PromisePool from 'es6-promise-pool';

import { Account } from '../../modules/Account';
import { EventTypes } from '../../modules/EventTypes';
import {
  DOC_AGENT_RELEASES_GQL,
  CLOUD_LINKED_ACCTS_GQL,
  CLOUD_LINKED_ACCTS_WITH_ID_GQL,
  APM_DEPLOYMENTS_GQL,
  FETCH_ACCOUNT_WITH_ID_GQL_OBJ
} from './account-gql';

export async function createAccountMap(
  accounts,
  cloudLinkedAccounts,
  gqlAPI,
  { nrqlFragment = null, createAccountFn = createAccount, maxConcurrency = 10 }
) {
  const accountMap = new Map();

  const acctDetailGenerator = getAccountDetails(
    accountMap,
    accounts,
    cloudLinkedAccounts,
    gqlAPI,
    nrqlFragment,
    createAccountFn
  );
  const pool = new PromisePool(acctDetailGenerator, maxConcurrency);
  await pool.start();
  return accountMap;
}

export async function createAccountMapBatch(
  accounts,
  cloudLinkedAccounts,
  gqlAPI,
  { nrqlFragment = null, createAccountFn = createAccount, maxConcurrency = 10 }
) {
  const accountMap = new Map();

  const query = {
    ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(nrqlFragment)
  };

  const _getAccountDetails = function*() {
    for (const account of accounts) {
      const queryTmp = { ...query };

      _setGQLVariables(queryTmp, account);

      yield (async () => {
        const response = await gqlAPI(queryTmp);

        const accountTmp = createAccountFn({ response, account });
        accountTmp.cloudLinkedAccounts = cloudLinkedAccounts;
        accountTmp.deploymentAppList = await _getDeploymentList(
          accountTmp.id,
          accountTmp.throughputData,
          gqlAPI
        );

        accountMap.set(accountTmp.id, accountTmp);
        return Promise.resolve(response);
      })();
    }
  };

  const pool = new PromisePool(_getAccountDetails(), maxConcurrency);
  await pool.start();

  return accountMap;
}

function _setGQLVariables(query, account) {
  const subscriptions = account.subscriptions
    ? Object.keys(account.subscriptions)
    : null;

  query.variables = {
    ...query.variables,
    id: account.id,
    APM_SUBSCRIBED: subscriptions ? subscriptions.includes('apm') : true,
    BROWSER_SUBSCRIBED: subscriptions
      ? subscriptions.includes('browser')
      : true,
    MOBILE_SUBSCRIBED: subscriptions ? subscriptions.includes('mobile') : true,
    INFRA_SUBSCRIBED: subscriptions
      ? subscriptions.includes('infrastructure')
      : true,
    INSIGHTS_SUBSCRIBED: subscriptions
      ? subscriptions.includes('insights')
      : true,
    SYNTHETICS_SUBSCRIBED: subscriptions
      ? subscriptions.includes('synthetics')
      : true,
    LOGGING_SUBSCRIBED: subscriptions
      ? subscriptions.includes('logging')
      : true,
    WORKLOADS_SUBSCRIBED: subscriptions
      ? subscriptions.includes('workloads')
      : true,
    KUBERNETES_SUBSCRIBED: subscriptions
      ? subscriptions.includes('kubernetes')
      : true,
    SLM_SUBSCRIBED: subscriptions ? subscriptions.includes('slm') : true,
    PROGRAMMABILITY_SUBSCRIBED: subscriptions
      ? subscriptions.includes('programmability')
      : true
  };

  if (query.variables.withFragment) {
    setNrqlFragmentSubscription(query);
  }
}

export function setNrqlFragmentSubscription(query) {
  const queryTmp = query.query;
  const index = queryTmp.lastIndexOf('fragment NRQLFragment on Account {');
  let nrqlFragment = queryTmp.substring(index);
  const queryStart = queryTmp.substring(0, index);
  if (index === 0) {
    return;
  }
  nrqlFragment = nrqlFragment.replace(
    /\$APM_SUBSCRIBED/g,
    query.variables.APM_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$BROWSER_SUBSCRIBED/g,
    query.variables.BROWSER_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$MOBILE_SUBSCRIBED/g,
    query.variables.MOBILE_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$INFRA_SUBSCRIBED/g,
    query.variables.INFRA_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$INSIGHTS_SUBSCRIBED/g,
    query.variables.INSIGHTS_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$SYNTHETICS_SUBSCRIBED/g,
    query.variables.SYNTHETICS_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$LOGGING_SUBSCRIBED/g,
    query.variables.LOGGING_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$WORKLOADS_SUBSCRIBED/g,
    query.variables.WORKLOADS_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$KUBERNETES_SUBSCRIBED/g,
    query.variables.KUBERNETES_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$SLM_SUBSCRIBED/g,
    query.variables.SLM_SUBSCRIBED
  );
  nrqlFragment = nrqlFragment.replace(
    /\$PROGRAMMABILITY_SUBSCRIBED/g,
    query.variables.PROGRAMMABILITY_SUBSCRIBED
  );
  query.query = queryStart.concat(nrqlFragment);
}

// see FETCH_ACCOUNT_WITH_ID_GQL
export function createFetchAccountNRQLFragment({
  nrqlFragments = null,
  fragmentID = 'NRQLFragment'
}) {
  if (!nrqlFragments) {
    throw new Error(`nrqlFragments param cannot be null`);
  }

  return `fragment ${fragmentID} on Account {\n
              ${nrqlFragments}\n
          }\n`;
}
export function createAccount(event) {
  const { response, account } = event;

  const {
    id,
    name,
    eventType,
    dtData,
    pageActionData,
    throughputData,
    transactionKeyset,
    pageViewKeyset,
    systemSampleKeyset,
    containerSampleKeyset,
    infraDeployedVersions,
    infraHostCount,
    mobileDeployedVersions,
    apmDeployedVersions,
    awsBilling,
    logMessageCount,
    nrqlLoggingAlertCount,
    programDeployCount,
    programUniqUserDeployment,
    mobileBreadcrumbs,
    mobileHandledExceptions,
    mobileEvents,
    mobileAppLaunch,

    // kubernetes
    clustersUsingPixie,
    infraAgentsInstalled,
    infraK8sEvents,
    prometheusLabels,
    apmAgentsInsideK8sClusters,
    nrLogsEvents,
    pixieUniqueServices
  } = response ? response.data.actor.account : account;

  const accountDetail = {};
  accountDetail.id = id;
  accountDetail.name = name;
  accountDetail.reportingEventTypes = eventType
    ? eventType.results.map(({ eventType }) => eventType)
    : [];

  accountDetail.dtAppList = dtData ? dtData.results[0]['uniques.appName'] : [];
  accountDetail.throughputData = throughputData ? throughputData.results : [];
  accountDetail.pageActionList = pageActionData
    ? pageActionData.results[0]['uniques.appName']
    : [];
  accountDetail.transactionKeyset = transactionKeyset
    ? transactionKeyset.results
    : [];
  accountDetail.pageViewKeyset = pageViewKeyset ? pageViewKeyset.results : [];
  // [{ hostname:<servername> , allKeys:["attributes","attributes"]}, .... ]
  accountDetail.containerSampleKeyset = containerSampleKeyset
    ? containerSampleKeyset.results.map(({ entityName, allKeys }) => ({
        entityName,
        allKeys
      }))
    : [];
  accountDetail.contained = accountDetail.containerSampleKeyset
    ? accountDetail.containerSampleKeyset.length > 0
    : false;
  // [{ hostname:<servername> , allKeys:["attributes","attributes"]}, .... ]
  accountDetail.systemSampleKeyset = systemSampleKeyset
    ? systemSampleKeyset.results.map(({ entityName, allKeys }) => ({
        entityName,
        allKeys
      }))
    : [];

  //  [ { facet": "1.8.32", "count": 17,  "infrastructureAgentVersion": "1.8.32"}, ...]
  accountDetail.infraDeployedVersions = infraDeployedVersions
    ? infraDeployedVersions.results
    : [];

  accountDetail.infraHostCount = infraHostCount
    ? infraHostCount.results[0].count
    : 0;

  //   [{"facet":"5.19.1","appCount":1,"newRelicVersion":"5.19.1","osName":"Android"}]
  accountDetail.mobileDeployedVersions = mobileDeployedVersions
    ? mobileDeployedVersions.results
    : [];

  // [ { "facet": ["ruby", "6.5.0.357" ], "apmLanguageapmAgentVersion": [ "ruby","6.5.0.357" ],"count": 42}]
  accountDetail.apmDeployedVersions = apmDeployedVersions
    ? apmDeployedVersions.results
    : [];

  accountDetail.awsBilling = awsBilling
    ? awsBilling.results[0].count > 0
    : false;
  accountDetail.logMessageCount = logMessageCount
    ? logMessageCount.results[0].count
    : 0;
  accountDetail.nrqlLoggingAlertCount =
    nrqlLoggingAlertCount && nrqlLoggingAlertCount.nrqlConditionsSearch
      ? nrqlLoggingAlertCount.nrqlConditionsSearch.totalCount
      : 0;

  accountDetail.programDeployCount = programDeployCount
    ? programDeployCount.results[0].count
    : 0;

  accountDetail.programUniqUserDeployment = programUniqUserDeployment
    ? programUniqUserDeployment.results[0].uniqueCount
    : 0;

  //  [{ "facet": "Acme Telco -Android", "appName": "Acme Telco -Android", "count": 1809  },...]
  accountDetail.mobileBreadcrumbs = mobileBreadcrumbs
    ? mobileBreadcrumbs.results
    : [];

  //  [{ "facet": "Acme Telco -Android", "appName": "Acme Telco -Android", "count": 1809  },...]
  accountDetail.mobileHandledExceptions = mobileHandledExceptions
    ? mobileHandledExceptions.results
    : [];

  // [{"facet":"Acme Telco -Android","appName":"Acme Telco -Android","count":1911}]
  accountDetail.mobileEvents = mobileEvents ? mobileEvents.results : [];

  // [{"uniqueSessions": 495496}]
  // store the session count
  accountDetail.mobileAppLaunch =
    mobileAppLaunch &&
    mobileAppLaunch.results &&
    mobileAppLaunch.results.length > 0
      ? mobileAppLaunch.results[0].uniqueSessions
      : 0;

  // kubernetes data
  accountDetail.clustersUsingPixie =
    clustersUsingPixie && clustersUsingPixie.results
      ? clustersUsingPixie.results
      : [];

  accountDetail.infraAgentsInstalled =
    infraAgentsInstalled && infraAgentsInstalled.results
      ? infraAgentsInstalled.results
      : [];

  accountDetail.infraK8sEvents =
    infraK8sEvents && infraK8sEvents.results ? infraK8sEvents.results : [];

  accountDetail.prometheusLabels =
    prometheusLabels && prometheusLabels.results
      ? prometheusLabels.results
      : [];

  accountDetail.apmAgentsInsideK8sClusters =
    apmAgentsInsideK8sClusters && apmAgentsInsideK8sClusters.results
      ? apmAgentsInsideK8sClusters.results
      : [];

  accountDetail.nrLogsEvents =
    nrLogsEvents && nrLogsEvents.results ? nrLogsEvents.results : [];

  accountDetail.pixieUniqueServices =
    pixieUniqueServices && pixieUniqueServices.results
      ? pixieUniqueServices.results
      : [];

  return new Account(accountDetail);
}

function _getDeploymentList(accountId, throughputData, gqlAPI) {
  // creating guid strings and removing = buffer as graphql doesn't accept this ¯\_(ツ)_/¯
  const guid = `${accountId}|APM|APPLICATION|`;
  if (
    typeof throughputData === 'undefined' ||
    (throughputData && throughputData.length === 0)
  ) {
    return Promise.resolve([]);
  }

  const throughputList = throughputData.map(app =>
    btoa(guid + app.appId)
      .split('=')
      .join('')
  );
  return fetchDeployments(throughputList, gqlAPI);
}

async function fetchDeployments(throughputList, gqlAPI) {
  const lastMonth = new Date();
  lastMonth.setMonth(new Date().getMonth() - 1);
  const startTime = lastMonth.getTime();
  const endTime = Date.now();

  const query = {
    ...APM_DEPLOYMENTS_GQL,
    variables: { endTime, startTime, guids: throughputList }
  };
  const results = await gqlAPI(query);
  const deploymentList = [];

  if (!results.data.actor.entities) {
    return deploymentList;
  }

  // eslint-disable-next-line array-callback-return
  results.data.actor.entities.map(app => {
    if (app.deployments && app.deployments.length > 0) {
      deploymentList.push(app.applicationId);
    }
  });
  return deploymentList;
}

export async function getAgentReleases(gqlAPI) {
  const { data } = await gqlAPI(DOC_AGENT_RELEASES_GQL);
  let docAgentLatestVersion = {};
  try {
    // {"android":"5.24.3","browser":"1167","dotnet":"8.24.244.0","elixir":"0.0.0","go":"3.3.0","infrastructure":"1.10.26","ios":"3.53.1","java":"5.10.0","nodejs":"6.4.2","php":"9.7.0.258","python":"5.8.0.136","ruby":"V6.9.0","skd":"1.3.0"}
    docAgentLatestVersion = {
      android: _getAgentRelease(data.androidReleases),
      browser: _getAgentRelease(data.browserReleases),
      dotnet: _getAgentRelease(data.dotnetReleases),
      dotnet_legacy: _getAgentRelease(data.dotnetReleases, 'dotnet_legacy'),
      elixir: _getAgentRelease(data.elixirReleases),
      go: _getAgentRelease(data.goReleases),
      infrastructure: _getAgentRelease(data.infraReleases),
      ios: _getAgentRelease(data.iosReleases),
      java: _getAgentRelease(data.javaReleases),
      nodejs: _getAgentRelease(data.nodejsReleases),
      php: _getAgentRelease(data.phpReleases),
      python: _getAgentRelease(data.pythonReleases),
      ruby: _getAgentRelease(data.rubyReleases),
      c: _getAgentRelease(data.sdkReleases)
    };
  } catch (err) {
    console.error(err);
  }

  return docAgentLatestVersion;
}

export function getDocEventTypes() {
  const docEventTypes = {};
  if (EventTypes) {
    // docs > dataDictionary is not available for GQL customer schema
    // using static list see EventTypes.js
    // [{attributes:[{label:"", name: ""},{...}], name:"Transaction"}]
    const { eventTypes } = EventTypes.data.docs.dataDictionary;
    eventTypes.forEach(eventType => {
      const { name } = eventType;
      docEventTypes[name] = { ...eventType }; // { "Transaction" : {name:"Transaction", dataSources:["APM"], attributes:[{ name:< Attribute name>, label: "<Attribute label>"}, ... ]}}
    });
  }

  return docEventTypes;
}

export async function getCloudLinkedAccounts(gqlAPI, accountId = null) {
  const cloudQuery = accountId
    ? {
        ...CLOUD_LINKED_ACCTS_WITH_ID_GQL,
        variables: { id: accountId }
      }
    : CLOUD_LINKED_ACCTS_GQL;

  const { data, error } = await gqlAPI(cloudQuery);
  const cloudLinkedAccounts = {};

  if (error) {
    return cloudLinkedAccounts;
  }

  try {
    const { linkedAccounts } = accountId
      ? data.actor.account.cloud
      : data.actor.cloud;
    if (!linkedAccounts) {
      return cloudLinkedAccounts;
    }
    linkedAccounts.forEach(linkedAccount => {
      const { nrAccountId } = linkedAccount;
      if (!cloudLinkedAccounts[nrAccountId]) {
        cloudLinkedAccounts[nrAccountId] = [];
      }
      // generate this obj
      // cloudLinkedAccounts[nrAccountId]
      // cloudLinkedAccounts[10245]: [ {"disabled": false,"name": "MyTestNewRelicAccount", "nrAccountId": 1100964,"provider": {"id": 1, "name": "Amazon Web Services" }}]
      cloudLinkedAccounts[nrAccountId].push(linkedAccount);
    });
  } catch (err) {
    console.error(err);
  }

  return cloudLinkedAccounts;
}

function _getAgentRelease(agentReleaseNode, name = null) {
  if (!agentReleaseNode) {
    return '0.0.0';
  }

  // sort the versions by release date descending
  let releases = [];
  if (
    agentReleaseNode.agentReleases &&
    agentReleaseNode.agentReleases.length > 1
  ) {
    releases = agentReleaseNode.agentReleases
      .map(e => {
        return {
          version: e.version,
          date: new Date(e.date)
        };
      })
      .sort((a, b) => {
        return b.date > a.date ? 1 : -1;
      });
  }

  if (!name) {
    return releases.length > 0
      ? releases.filter(release => release.version !== '').shift().version
      : '0.0.0';
  }

  // this logic is specific to dotnet_legacy
  return releases.length > 0
    ? releases.filter(release => release.version.startsWith('6')).shift()
        .version
    : '0.0.0';
}

// see FETCH_ACCOUNT_WITH_ID_GQL_OBJ
const subscriptionGQLVarDict = {
  apm: 'APM_SUBSCRIBED',
  browser: 'BROWSER_SUBSCRIBED',
  mobile: 'MOBILE_SUBSCRIBED',
  infrastructure: 'INFRA_SUBSCRIBED',
  insights: 'INSIGHTS_SUBSCRIBED',
  synthetics: 'SYNTHETICS_SUBSCRIBED',
  logging: 'LOGGING_SUBSCRIBED',
  eventTypeInclude: 'EVENT_TYPES_INCLUDE',
  workloads: 'WORKLOADS_SUBSCRIBED',
  kubernetes: 'KUBERNETES_SUBSCRIBED',
  slm: 'SLM_SUBSCRIBED',
  programmability: 'PROGRAMMABILITY_SUBSCRIBED'
};

export function* getAccountDetails(
  accountMap,
  accounts,
  cloudLinkedAccounts,
  gqlAPI,
  nrqlFragment,
  createAccountFn
) {
  const query = {
    ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(nrqlFragment)
  };

  for (const account of accounts) {
    yield (async () => {
      const subscriptions = account.subscriptions
        ? Object.keys(account.subscriptions)
        : Object.keys(subscriptionGQLVarDict);

      if (account.subscriptions) {
        // includes not based on subscriptions
        // see FETCH_ACCOUNT_WITH_ID_GQL_OBJ
        // see subscriptionGQLVarDict
        subscriptions.push('eventTypeInclude');
        subscriptions.push('programmability');
        subscriptions.push('kubernetes');
        subscriptions.push('workloads');
        subscriptions.push('slm');
      }

      const promises = [];
      for (const productLine of subscriptions) {
        // group GQL requests by product to create smaller GQL payload and minimize timeouts
        promises.push(
          fetchAccountDetailsByProduct(account, productLine, query, gqlAPI)
        );
      }

      const results = await Promise.all(promises);
      const response = assembleResults(results);
      const accountTmp = createAccountFn({ response, account });

      accountTmp.cloudLinkedAccounts = cloudLinkedAccounts;
      accountTmp.deploymentAppList = await _getDeploymentList(
        accountTmp.id,
        accountTmp.throughputData,
        gqlAPI
      );

      accountMap.set(accountTmp.id, accountTmp);
      return Promise.resolve(accountMap);
    })();
  }
}

export function assembleResults(results) {
  // console.log(`assembleResults results=${JSON.stringify(results)}`);
  const response = {
    data: {
      actor: {
        account: null
      }
    }
  };

  let ctr = 0;
  for (const result of results) {
    if (result.error?.graphQLErrors) {
      console.log(
        `warning: assembleResults() Error found in results. Error=`,
        result.error.graphQLErrors,
        ` result=`,
        result
      );
    }

    // we need to continue/check if partial results were returned even if there were errors
    if (
      result.data &&
      result.data.actor &&
      result.data.actor.account !== null
    ) {
      ctr++;
      response.data.actor.account = {
        ...response.data.actor.account,
        ...result.data.actor.account
      };
    }
  }
  // return null if all nrql fragments for the account had errors
  return ctr > 0 ? response : null;
}

export function fetchAccountDetailsByProduct(
  account,
  productLine,
  query,
  gqlAPI
) {
  const queryTmp = _.cloneDeep(query);
  const gqlKey = subscriptionGQLVarDict[productLine];

  if (typeof queryTmp.variables[gqlKey] === 'undefined') {
    // ignore unsupported products
    return Promise.resolve(true);
  }

  queryTmp.variables.id = account.id;
  queryTmp.variables[gqlKey] = true;

  // workaround to enable use of 'if' in fragment
  // import this call must be made after setting queryTmp.variables[gqlKey]= true;
  setNrqlFragmentSubscription(queryTmp);

  return gqlAPI(queryTmp);
}
