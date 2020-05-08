import semver from 'semver';

export function createInfraTableData(
  accountMap,
  { docEventTypes = [], docInfraLatestVersion = '0.0.0', enricherFn = null }
) {
  const table = [];
  for (const account of accountMap.values()) {
    const row = _processInfraAccountData(account, {
      docInfraLatestVersion,
      docEventTypes
    });

    if (enricherFn && typeof enricherFn === 'function') {
      try {
        enricherFn(row, account);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Enricher failed with error=${JSON.stringify(err)}`);
        throw err;
      }
    }

    table.push(row);
  }
  return table;
}

export function computeInfraMaturityScore({ rowData, scoreWeights }) {
  let score = 0;
  let overallPercentage = 0;

  for (const key of Object.keys(scoreWeights)) {
    let value = rowData[key];
    const weight = scoreWeights[key];

    // console.log(`computeInfraMaturityScore, ${rowData.accountID}, ${key}, ${value}, ${weight}`);

    if (typeof value === 'undefined') {
      throw new Error(`computeMaturityScore() key not found. key =${key}`);
    }

    if (typeof value === 'boolean') {
      value = value ? 100 : 0;
    }

    overallPercentage += weight * 100;
    score += value * weight;
  }

  overallPercentage = overallPercentage <= 100 ? overallPercentage : 100;

  return {
    score: Math.round((score / overallPercentage) * 100),
    overallPercentage
  };
}

function _processInfraAccountData(
  account,
  { docInfraLatestVersion, docEventTypes }
) {
  const row = {};
  const { id, name } = account;

  row.accountName = name;
  row.accountID = id;

  const hostPercentage = _computeVersionPercent(account, docInfraLatestVersion);

  row.entityCount = hostPercentage.total;

  row.infrastructureLatestAgentPercentage = hostPercentage.value;

  const systemSampleDefaultList = docEventTypes.SystemSample
    ? docEventTypes.SystemSample.attributes.map(attribute => attribute.name)
    : 0;

  const hostsWithCustomAttr = account.systemSampleKeyset.filter(
    ({ allKeys }) => {
      return allKeys.filter(key => {
        if (key.startsWith('nr.')){
          return false
        }
        return !systemSampleDefaultList.includes(key)
      }).length > 0
    }
  );

  row.usingCustomAttributes =
    hostsWithCustomAttr && hostsWithCustomAttr.length > 0;

  row.infrastructureCustomAttributesHostPercentage = row.usingCustomAttributes
    ? Math.round(
        (hostsWithCustomAttr.length / account.systemSampleKeyset.length) * 100
      )
    : 0;

  row.infrastructureUsingDocker = account.contained;
  row.infrastructureDockerLabels = false;
  row.infrastructureDockerLabelsPercentage = 0;

  const hostWithDockerLabels = account.processSampleKeyset
    .filter(({ allKeys }) => allKeys.includes('contained'))
    .filter(
      ({ allKeys }) =>
        allKeys.filter(key => key.startsWith('containerLabel')).length > 0
    );

  row.infrastructureDockerLabels =
    hostWithDockerLabels && hostWithDockerLabels.length > 0;

  /*
    If using Docker,
    If no labels 0 points
    if using 1 label 5 points
    if using 2 labels 10 points
    if using 3+ labels 15 points
    */
  row.infrastructureDockerLabelsPercentage = (hosts => {
    if (!hosts || hosts.length === 0) {
      return 0;
    }
    const labelCount = hostWithDockerLabels.reduce((acc, curr) => {
      return (
        acc +
        curr.allKeys.reduce(
          (total, key) => total + key.startsWith('containerLabel'),
          0
        )
      );
    }, 0);
    return labelCount > 3 ? 1 : labelCount / 3;
  })(hostWithDockerLabels);

  row.infrastructureCloudIntegrationEnabled =
    account.cloudLinkedAccounts &&
    typeof account.cloudLinkedAccounts[id] !== 'undefined';

  row.infrastructureAWSBillingEnabled = account.awsbillingEnabled;

  row.infrastructureUsingOHIs = _getIntegrations(account).length > 0;

  return row;
}
function _computeVersionPercent(account, latestVersion) {
  const { infraDeployedVersions } = account;
  if (
    !infraDeployedVersions ||
    (infraDeployedVersions && infraDeployedVersions.length === 0)
  ) {
    return { value: 0, total: 0 };
  }
  const latestVerDeployed = infraDeployedVersions.filter(deployed => {
    const agentVer = semver.clean(deployed.infrastructureAgentVersion);
    if (!semver.valid(agentVer)) {
      return false;
    }
    // check if agent version  agent major and minor ver
    return semver.satisfies(
      agentVer,
      `${semver.major(latestVersion)}.${semver.minor(latestVersion)}.x`
    );
  });
  const hasLatest = latestVerDeployed.length > 0;
  const totalAgents = infraDeployedVersions.reduce(
    (total, { count }) => total + count,
    0
  );

  if (!hasLatest) {
    return { value: 0, total: totalAgents };
  }

  const totalLatestVerDeployed = latestVerDeployed.reduce(
    (total, { count }) => total + count,
    0
  );

  const value = Math.round((totalLatestVerDeployed / totalAgents) * 100);
  return { value, total: totalAgents };
}

function _getIntegrations(account) {
  const { reportingEventTypes } = account;

  // https://docs.newrelic.com/docs/integrations/host-integrations/host-integrations-list/jmx-monitoring-integration
  // None or uses custom event:
  // - JMX integration
  // - GO Infra monitoring integration
  // - Prometheus OpenMetrics, Docker and Kubernetes events as of  3/9/20

  const integrations = [
    'Apache',
    'Cassandra',
    'Consul',
    'Couchbase',
    'Collectd',
    'Docker',
    'Elasticsearch',
    'F5',
    'HAProxy',
    'JMX',
    'Kafka',
    'Kubernetes',
    'K8s',
    'Memcache',
    'Mssql',
    'Mongo',
    'Nagios',
    'Nginx',
    'NFS',
    'Oracle',
    'Perfmon',
    'NetworkPort', // perfmon network
    'Postgres',
    'Rabbit',
    'Redis',
    'StatsD',
    'SNMP',
    'unixMonitor',
    'Varnish',
    'ESX', // vmware esx
    'Application', // windowsAppEventLog
    'System' // windowsSysEventLog
  ];

  const ohis = reportingEventTypes.filter(event => {
    let match = false;

    for (const integration of integrations) {
      match = event.startsWith(integration);
      if (match) {
        break;
      }
    }
    return match;
  });

  return Array.from(new Set(ohis));
}
