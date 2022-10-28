export const FETCH_ACCOUNTS_GQL = {
  query: `
    {
      actor {
        accounts {
          id
          name
        }
      }
    }
  `
};

export const FETCH_ACCOUNT_WITH_ID_GQL_OBJ = {
  query: `query ($id: Int!, $withFragment: Boolean!,$EVENT_TYPES_INCLUDE: Boolean!, $PROGRAMMABILITY_SUBSCRIBED: Boolean!, $APM_SUBSCRIBED: Boolean!, $BROWSER_SUBSCRIBED: Boolean!, $MOBILE_SUBSCRIBED: Boolean!, $INFRA_SUBSCRIBED: Boolean!, $LOGGING_SUBSCRIBED: Boolean!, $SYNTHETICS_SUBSCRIBED: Boolean!, $INSIGHTS_SUBSCRIBED: Boolean!, $WORKLOADS_SUBSCRIBED: Boolean!, $KUBERNETES_SUBSCRIBED: Boolean!, $SLM_SUBSCRIBED: Boolean!, $NPM_SUBSCRIBED: Boolean!) {
    actor {
      account(id: $id) {
        id
        name

        ...EVENT_TYPES @include(if: $EVENT_TYPES_INCLUDE)

        ...PROGRAM_Fragments @include(if: $PROGRAMMABILITY_SUBSCRIBED)

        ...APM_Fragments @include(if: $APM_SUBSCRIBED)
        ...BROWSER_Fragments @include(if: $BROWSER_SUBSCRIBED)
        ...MOBILE_Fragments @include(if: $MOBILE_SUBSCRIBED)
        ...LOGGING_Fragments @include(if: $LOGGING_SUBSCRIBED)
        ...INFRA_Fragments @include(if: $INFRA_SUBSCRIBED)
        ...SYNTHETICS_Fragments @include(if: $SYNTHETICS_SUBSCRIBED)
        ...INSIGHTS_Fragments @include(if: $INSIGHTS_SUBSCRIBED)
        ...WORKLOADS_Fragments @include(if: $WORKLOADS_SUBSCRIBED)
        ...KUBERNETES_Fragments @include(if: $KUBERNETES_SUBSCRIBED)
        ...SLM_Fragments @include(if: $SLM_SUBSCRIBED)
        ...NPM_Fragments @include(if: $NPM_SUBSCRIBED)

        ...NRQLFragment @include(if: $withFragment)

      }
    }
  }

  fragment EVENT_TYPES on Account{
    eventType: nrql(query: "SHOW EVENT TYPES since 1 hour ago", timeout: 120) {
      results
    }
  }
  fragment PROGRAM_Fragments on Account{
    programDeployCount: nrql(query: "SELECT count(*) as 'count' FROM NrAuditEvent  WHERE targetType = 'nerdpack' and actionIdentifier ='nerdpack.subscribe' SINCE 7 days ago", timeout: 120) {
      results
    }
    programUniqUserDeployment: nrql(query: "SELECT uniquecount(actorEmail) as 'uniqueCount' FROM NrAuditEvent WHERE actorEmail != 'New Relic Employee' SINCE 7 days ago WHERE targetType = 'nerdpack'  ", timeout: 120) {
      results
    }
  }
  fragment INSIGHTS_Fragments on Account {
		INSIGHTS_PLACEHOLDER:id
  }
  fragment SYNTHETICS_Fragments on Account {
		SYNTHETICS_PLACEHOLDER:id
  }

  fragment BROWSER_Fragments on Account {
    pageActionData: nrql(query: "SELECT uniques(appName) FROM PageAction SINCE 1 week ago", timeout: 120) {
      results
    }
    pageViewKeyset: nrql(query: "SELECT keyset() FROM PageView since 7 days ago", timeout: 120) {
      results
    }
  }

  fragment INFRA_Fragments on Account {
    systemSampleKeyset: nrql(query: "SELECT keyset() FROM SystemSample since 7 days ago facet entityName LIMIT MAX", timeout: 120) {
      results
    }
    containerSampleKeyset: nrql(query: "SELECT keyset() FROM ContainerSample facet entityName since 6 hours ago LIMIT MAX", timeout: 120) {
      results
    }
    infraDeployedVersions: nrql(query: "SELECT uniqueCount(agentHostname ) as 'count'   from NrDailyUsage facet  infrastructureAgentVersion since 7 days ago where productLine ='Infrastructure' ", timeout: 120) {
      results
    }
    infraHostCount: nrql(query: "SELECT uniqueCount(agentHostname) as 'count' FROM NrDailyUsage  where productLine='Infrastructure' since 7 days ago", timeout: 120) {
      results
    }
    awsBilling: nrql(query: "SELECT count(*) as 'count' FROM FinanceSample ", timeout: 120) {
      results
    }
  }

  fragment LOGGING_Fragments on Account {
    logMessageCount: nrql(query: "SELECT count(*) as 'count' FROM Log since 12 hours ago ", timeout: 120) {
      results
    }
    nrqlLoggingAlertCount:alerts {
      nrqlConditionsSearch(searchCriteria: {queryLike: "FROM log"}) {
        totalCount
      }
    }
  }

  fragment APM_Fragments on Account {
    dtData: nrql(query: "SELECT uniques(appName) from Span", timeout: 120) {
      results
    }
    throughputData: nrql(query: "SELECT count(*) from Transaction facet appId", timeout: 120) {
      results
    }
    transactionKeyset: nrql(query: "SELECT keyset() FROM Transaction since 7 days ago", timeout: 120) {
      results
    }
    apmDeployedVersions: nrql(query: "SELECT uniqueCount(apmAppId) as 'count' FROM NrDailyUsage  SINCE 1 DAY AGO  where productLine='APM' facet apmLanguage, apmAgentVersion", timeout: 120) {
      results
    }
  }

  fragment MOBILE_Fragments on Account {
    mobileBreadcrumbs: nrql(query: "SELECT  count(*) FROM MobileBreadcrumb SINCE 1 day ago facet appName ", timeout: 120) {
      results
    }
    mobileHandledExceptions: nrql(query: "SELECT count(*) FROM MobileHandledException SINCE 1 day ago facet appName ", timeout: 120) {
      results
    }
    mobileEvents: nrql(query: "SELECT count(*) FROM Mobile SINCE 30 minutes ago facet appName", timeout: 120) {
      results
    }
    mobileAppLaunch: nrql(query: "SELECT uniqueCount(sessionId) as 'uniqueSessions' from Mobile SINCE 7 days ago  ", timeout: 120) {
      results
    }
    mobileDeployedVersions: nrql(query: "SELECT uniqueCount(appId) as 'appCount', latest(osName) as 'osName' FROM Mobile SINCE 7 days ago FACET  newRelicVersion", timeout: 120) {
      results
    }
  }

  fragment WORKLOADS_Fragments on Account {
    WORKLOADS_PLACEHOLDER:id
  }

  fragment KUBERNETES_Fragments on Account {
    clustersUsingPixie: nrql(query: "FROM Span SELECT count(*) as pixieProviders where instrumentation.provider = 'pixie' AND service.name is not null FACET k8s.cluster.name as clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
    infraAgentsInstalled: nrql(query: "FROM K8sClusterSample SELECT uniqueCount(clusterName) as clusters WHERE agentName = 'Infrastructure' FACET clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
    infraK8sEvents: nrql(query: "FROM InfrastructureEvent SELECT sum(event.count) as k8sEvents WHERE category = 'kubernetes' FACET clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
    prometheusLabels: nrql(query: "SELECT uniqueCount(clusterName) FROM Metric WHERE integrationName ='nri-prometheus' OR instrumentation.provider = 'prometheus' FACET clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
    apmAgentsInsideK8sClusters: nrql(query: "FROM Transaction SELECT uniqueCount(appName) as apmAgents WHERE clusterName IS NOT NULL FACET clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
    nrLogsEvents: nrql(query: "FROM Log SELECT count(*) as logEvents where plugin.source = 'kubernetes' FACET cluster_name as clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
    pixieUniqueServices: nrql(query: "FROM Metric SELECT uniqueCount(service.name)  as pixieServices WHERE instrumentation.provider='pixie' FACET k8s.cluster.name as clusterName since 7 days ago LIMIT MAX", timeout: 120) {
      results
    }
  }

  fragment SLM_Fragments on Account {
    SLM_PLACEHOLDER:id
  }

  fragment NPM_Fragments on Account {
    # How many devices are sending SNMP data
    npmKentikProviders: nrql(query: "SELECT uniqueCount(device_name) FROM Metric where  instrumentation.provider='kentik' AND provider != 'kentik-agent' FACET device_name since 1 day ago limit max", timeout: 120) {
      results
    }

    # How many devices don't have profiles -- using generic profile
    npmNoKentikProvider: nrql(query: "SELECT uniqueCount(device_name) as npmNoKentikProviderProfileCount FROM Metric where provider = 'kentik-default' since 1 day ago", timeout: 120) {
      results
    }

    # How many devices don't have entity definitions
    npmNoEntityDefinitionDevices: nrql(query: "SELECT uniqueCount(device_name) as npmNoEntityDefinitionCount from Metric where entity.name is null and instrumentation.provider = 'kentik' and instrumentation.name != 'heartbeat'", timeout: 120) {
      results
    }

    # SNMP polling failures
    npmSnmpPollingFailures: nrql(query: "SELECT uniqueCount(device_name) as npmSnmpPollingFailureCount From Metric where PollingHealth = 'BAD' SINCE 1 day ago", timeout: 120) {
      results
    }

    # How many devices are sending Network Flow data
    npmKentikFlowDevices: nrql(query: "SELECT uniqueCount(device_name) as flowDeviceCount from KFlow where provider='kentik-flow-device' since 1 day ago", timeout: 120) {
      results
    }

    # How many devices are sending VPC Flow Log data
    npmKentikVpcDevices: nrql(query: "SELECT uniqueCount(vpc_id) as vpcDeviceCount FROM Log_VPC_Flows, Log_VPC_Flows_AWS, Log_VPC_Flows_GCP WHERE instrumentation.name = 'vpc-flow-logs' SINCE 1 day ago", timeout: 120) {
      results
    }

    # How many devices are sending Network Syslog data
    npmKtranslateSyslogDevices: nrql(query: "SELECT uniqueCount(device_name) as syslogDeviceCount from Log where plugin.type = 'ktranslate-syslog' since 1 day ago", timeout: 120) {
      results
    }
  }
    
  # Dynamically generated by createQuery()
  # fragment NRQLFragment on Account {
  #	 NRQL_PLACEHOLDER:id
  # }
  `,
  variables: {
    id: 0,
    withFragment: false,
    EVENT_TYPES_INCLUDE: false,
    PROGRAMMABILITY_SUBSCRIBED: false,
    APM_SUBSCRIBED: false,
    BROWSER_SUBSCRIBED: false,
    MOBILE_SUBSCRIBED: false,
    INFRA_SUBSCRIBED: false,
    LOGGING_SUBSCRIBED: false,
    SYNTHETICS_SUBSCRIBED: false,
    WORKLOADS_SUBSCRIBED: false,
    KUBERNETES_SUBSCRIBED: false,
    SLM_SUBSCRIBED: false,
    NPM_SUBSCRIBED: false,
    INSIGHTS_SUBSCRIBED: false
  },
  createQuery: function(fragment = null) {
    const withFragment = fragment !== null && fragment.length > 0;
    const placeholder = 'transaction:nrql(query:""){results}';
    fragment = fragment || placeholder;
    return {
      query: `
              ${this.query}
              fragment NRQLFragment on Account {
                  ${fragment}
              }`,
      variables: {
        ...this.variables,
        withFragment
      }
    };
  }
};

export const DOC_AGENT_RELEASES_GQL = {
  query: `
    {
      androidReleases: docs {
        agentReleases(agentName: ANDROID) {
          version
          date
        }
      }
      browserReleases: docs {
        agentReleases(agentName: BROWSER) {
          version
          date
        }
      }
      dotnetReleases: docs {
        agentReleases(agentName: DOTNET) {
          version
          date
        }
      }
      elixirReleases: docs {
        agentReleases(agentName: ELIXIR) {
          version
          date
        }
      }
      goReleases: docs {
        agentReleases(agentName: GO) {
          version
          date
        }
      }
      infraReleases: docs {
        agentReleases(agentName: INFRASTRUCTURE) {
          version
          date
        }
      }
      iosReleases: docs {
        agentReleases(agentName: IOS) {
          version
          date
        }
      }
      javaReleases: docs {
        agentReleases(agentName: JAVA) {
          version
          date
        }
      }
      nodejsReleases: docs {
        agentReleases(agentName: NODEJS) {
          version
          date
        }
      }
      phpReleases: docs {
        agentReleases(agentName: PHP) {
          version
          date
        }
      }
      pythonReleases: docs {
        agentReleases(agentName: PYTHON) {
          version
          date
        }
      }
      rubyReleases: docs {
        agentReleases(agentName: RUBY) {
          version
          date
        }
      }
      sdkReleases: docs {
        agentReleases(agentName: SDK) {
          version
          date
        }
      }
    }
  `
};

export const CLOUD_LINKED_ACCTS_GQL = {
  query: `
    query {
      actor {
        cloud {
          linkedAccounts {
            disabled
            name
            id
            nrAccountId
            provider {
              id
              name
            }
          }
        }
      }
    }`
};

export const CLOUD_LINKED_ACCTS_WITH_ID_GQL = {
  query: `
    query ($id: Int!) {
      actor {
        account(id: $id) {
          cloud {
            linkedAccounts {
              disabled
              name
              id
              nrAccountId
              provider {
                id
                name
              }
            }
          }
        }
      }
    }`,
  variables: {
    // id
  }
};

export const APM_DEPLOYMENTS_GQL = {
  query: `
            query($guids:[EntityGuid]!, $endTime:EpochMilliseconds!, $startTime:EpochMilliseconds!){
              actor {
                  entities(guids: $guids) {
                      ... on ApmApplicationEntity {
                          deployments(timeWindow: {endTime: $endTime, startTime: $startTime}) {
                              timestamp
                          }
                          accountId
                          applicationId
                          name
                      }
                  }
              }
          }`,
  variables: {
    // endTime,
    // startTime,
    // guids
  }
};
