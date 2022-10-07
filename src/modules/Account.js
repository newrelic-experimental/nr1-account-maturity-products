/* eslint-disable react/jsx-key */
/* eslint-disable prefer-template */
/* eslint-disable prettier/prettier */
import React from 'react';

class Account {
  constructor(props) {
    this.name = props.name;
    this.id = props.id;

    // Products
    this.apmApps = new Map();
    this.browserApps = new Map();
    this.synthMonitors = new Map();
    this.mobileApps = new Map();
    this.infraHosts = new Map();

    this.oTelApps = new Map();
    this.errorsInbox = new Map();
    this.k8s = [];

    this.insightsDashboards = [];
    // this.InfraApps = new Map();
    this.workloadMap = new Map();

    this.apiData = false;
    this.dtAppList = props.dtAppList;
    this.throughputData = props.throughputData;

    this.deploymentAppList = props.deploymentAppList;
    this.pageActionList = props.pageActionList;

    // [{key:"Attribute", type: "string"},{...}]
    this.txnKeyset = props.transactionKeyset;
    // [{key:"Attribute", type: "string"},{...}]
    this.pgViewKeyset = props.pageViewKeyset;
    // [{ hostname:<servername> , allKeys:["attributes","attributes"]}, .... ]
    this.systemSampleKeyset = props.systemSampleKeyset;
    // [{ hostname:<servername> , allKeys:["attributes","attributes"]}, .... ]
    this.containerSampleKeyset = props.containerSampleKeyset;
    this.accountDT = props.reportingEventTypes
      ? props.reportingEventTypes.includes('Span')
      : false;
    // [ "ACSMessageProcessed","AETEvent", "Transaction", "Span",...]
    this.reportingEventTypes = props.reportingEventTypes;

    this.error = props.errors;
    // [ { facet": "1.8.32", "count": 17,  "infrastructureAgentVersion": "1.8.32"}, ...]
    this.infraDeployedVersions = props.infraDeployedVersions;
    this.infraHostCount = props.infraHostCount;
    //  [{"facet":"5.19.1","appCount":1,"newRelicVersion":"5.19.1","osName":"Android"}]
    this.mobileDeployedVersions = props.mobileDeployedVersions;

    // {java: { versions: [  { version: "1.1.0",  count: 4} ] }
    this.apmDeployedVersions = (data => {
      const agentsDeployedVersion = {};

      for (const result of data) {
        const [language, version] = result.facet;
        const count = result.count;

        if (!agentsDeployedVersion[language]) {
          agentsDeployedVersion[language] = {};
          agentsDeployedVersion[language].versions = [];
        }

        agentsDeployedVersion[language].versions.push({ version, count });
      }

      // agentsDeployedVersion, {java: { versions: [  { version: "1.1.0",  count: 4} ] }
      return agentsDeployedVersion;
    })(props.apmDeployedVersions);

    this.contained = props.contained;
    this.awsbillingEnabled = props.awsBilling;
    this.cloudLinkedAccounts = null;

    // number of Log events in Insights
    this.logMessageCount = props.logMessageCount;
    // number of NRQL conditions on  Log event type
    this.nrqlLoggingAlertCount = props.nrqlLoggingAlertCount;

    // number of Programmability events in Insights
    this.programDeployCount = props.programDeployCount;
    // number of Programability uniq users deploying Nerdlets
    this.programUniqUserDeployment = props.programUniqUserDeployment;
    //  [{ "facet": "Acme Telco -Android", "appName": "Acme Telco -Android", "count": 1809  },...]
    this.mobileBreadcrumbs = props.mobileBreadcrumbs;
    //  [{ "facet": "Acme Telco -Android", "appName": "Acme Telco -Android", "count": 1809  },...]
    this.mobileHandledExceptions = props.mobileHandledExceptions;
    // [{"facet":"Acme Telco -Android","appName":"Acme Telco -Android","count":1911}]
    this.mobileEvents = props.mobileEvents;
    // unique session count
    this.mobileAppLaunch = props.mobileAppLaunch;

    this.errorGroupCount = props.errorGroupCount;
    this.errorGroupAssignedPercentage = props.errorGroupAssignedPercentage;
    this.errorGroupUnresolvedPercentage = props.errorGroupUnresolvedPercentage;
    this.errorGroupIgnoredPercentage = props.errorGroupIgnoredPercentage;
    this.errorGroupCommentsPercentage = props.errorGroupCommentsPercentage;
  }

  getName() {
    if (this.name) {
      return this.name;
    }
    return 0;
  }

  // ALERT POLICY METHODS
  getTotalPolicies() {
    if (this.alertPolicies) {
      return this.alertPolicies.size;
    }
    return 0;
  }

  getOpenIncidents() {
    let total = 0;
    if (!this.alertPolicies) {
      return total;
    }

    for (const policy of this.alertPolicies.values()) {
      total += policy.getOpenIncidents();
    }
    return total;
  }

  getTotalIncidentsMoreThanADay() {
    let total = 0;
    if (!this.alertPolicies) {
      return total;
    }

    for (const policy of this.alertPolicies.values()) {
      total += policy.getTotalIncidentsMoreThanADay();
    }
    return total;
  }

  getTotalIncidentsMoreThanADayPercent() {
    return (
      Math.round(
        (this.getTotalIncidentsMoreThanADay() / this.getOpenIncidents()) * 100
      ) || 0
    );
  }

  getPolicyChannelsNotEmail() {
    let total = 0;
    if (!this.alertPolicies) {
      return total;
    }

    for (const policy of this.alertPolicies.values()) {
      if (policy.isChannelNotEmail()) {
        total++;
      }
    }

    return total;
  }

  getPolicyChannelsNotEmailPercent() {
    return (
      Math.round(
        (this.getPolicyChannelsNotEmail() / this.getTotalPolicies()) * 100
      ) || 0
    );
  }

  getActiveChannelPercent() {
    let percentValue = 0;
    if (this.activeChannels) {
      switch (this.activeChannels.size) {
        case 0:
          percentValue = 0;
          break;
        case 1:
          percentValue = 25;
          break;
        case 2:
          percentValue = 50;
          break;
        case 3:
          percentValue = 75;
          break;
        default:
          percentValue = 100;
          break;
      }
    }
    return percentValue;
  }

  getPoliciesWithNrql() {
    let total = 0;
    if (!this.alertPolicies) {
      return total;
    }

    for (const policy of this.alertPolicies.values()) {
      if (policy.getTotalNrql() > 0) {
        total++;
      }
    }

    return total;
  }

  getPoliciesWithNrqlPercent() {
    return (
      Math.round(
        (this.getPoliciesWithNrql() / this.getTotalPolicies()) * 100
      ) || 0
    );
  }

  getPoliciesWithConditions() {
    let total = 0;
    if (!this.alertPolicies) {
      return total;
    }

    const quotient = 100 / this.getTotalPolicies() / 100;
    for (const policy of this.alertPolicies.values()) {
      total += policy.getTotalConditionScore();
    }

    return Math.round(total * quotient) || 0;
  }

  getAlertScore() {
    let score = 0;

    if (this.apiData) {
      score =
        this.getAlertingAppsPercent() * 0.3 +
        this.getPolicyChannelsNotEmailPercent() * 0.15 +
        (100 - this.getTotalIncidentsMoreThanADayPercent()) * 0.15 +
        this.getAlertingKeyTxnsPercent() * 0.1 +
        this.getActiveChannelPercent() * 0.1 +
        this.getPoliciesWithNrqlPercent() * 0.1 +
        this.getPoliciesWithConditions() * 0.1;
    } else {
      score = this.getAlertingAppsPercent() * 0.3;
    }

    return Math.round(score);
  }

  // APM METHODS
  getTotalApps() {
    if (this.apmApps) {
      return this.apmApps.size;
    }
    return 0;
  }

  getReportingApps() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.reporting) {
        total++;
      }
    }
    return total;
  }

  getReportingAppsPercent() {
    return (
      Math.round((this.getReportingApps() / this.getTotalApps()) * 100) || 0
    );
  }

  getDeploymentApps() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.deployMarker) {
        total++;
      }
    }
    return total;
  }

  getDeploymentAppsPercent() {
    let totalReportingApps = this.getReportingApps();
    totalReportingApps = totalReportingApps < 10 ? totalReportingApps : 10;
    return (
      Math.round((this.getDeploymentApps() / totalReportingApps) * 100) || 0
    );
  }

  getCustomApdexApps() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.isCustomApdex()) {
        total++;
      }
    }
    return total;
  }

  getCustomApdexAppsPercent() {
    return (
      Math.round((this.getCustomApdexApps() / this.getReportingApps()) * 100) ||
      0
    );
  }

  getDTEnabledApps() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.isDTEnabled()) {
        total++;
      }
    }
    return total;
  }

  getDTEnabledAppsPercent() {
    return (
      Math.round((this.getDTEnabledApps() / this.getReportingApps()) * 100) || 0
    );
  }

  getAlertingApps() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.isAlerting()) {
        total++;
      }
    }
    return total;
  }

  getAlertingAppsPercent() {
    return (
      Math.round((this.getAlertingApps() / this.getReportingApps()) * 100) || 0
    );
  }

  getAppsWithLabels() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.hasLabels()) {
        total++;
      }
    }
    return total;
  }

  getAppsWithLabelsPercent() {
    return (
      Math.round((this.getAppsWithLabels() / this.getReportingApps()) * 100) ||
      0
    );
  }

  getAppsWithKeyTxns() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      if (app.hasReportingKeyTxns()) {
        total++;
      }
    }
    return total;
  }

  getAppsWithKeyTxnsPercent() {
    return (
      Math.round((this.getAppsWithKeyTxns() / this.getReportingApps()) * 100) ||
      0
    );
  }

  getAlertingKeyTxns() {
    let total = 0;
    if (!this.apmApps) {
      return total;
    }

    for (const app of this.apmApps.values()) {
      total += app.getAlertingKeyTxns();
    }
    return total;
  }

  getAlertingKeyTxnsPercent() {
    let totalReportingKTs = 0;
    if (!this.apmApps) {
      return 0;
    }

    for (const app of this.apmApps.values()) {
      totalReportingKTs += app.getReportingKeyTxns();
    }

    return (
      Math.round((this.getAlertingKeyTxns() / totalReportingKTs) * 100) || 0
    );
  }

  getReportingAppsArray() {
    const reportingArray = [];
    const nonReportingArray = [];
    if (!this.apmApps) {
      return [reportingArray, nonReportingArray];
    }

    for (const app of this.apmApps.values()) {
      if (app.reporting) {
        reportingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/applications/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonReportingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/applications/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [reportingArray, nonReportingArray, 'Reporting Apps'];
  }

  getCustomApdexAppsArray() {
    const customApdexArray = [];
    const noncustomApdexArray = [];

    if (!this.apmApps) {
      return [customApdexArray, noncustomApdexArray];
    }

    for (const app of this.apmApps.values()) {
      if (app.reporting) {
        if (app.isCustomApdex()) {
          customApdexArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        } else {
          noncustomApdexArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        }
      }
    }
    return [
      customApdexArray,
      noncustomApdexArray,
      'Custom Apdex Reporting Apps'
    ];
  }

  getAlertingAppsArray() {
    const alertingArray = [];
    const nonalertingArray = [];

    if (!this.apmApps) {
      return [alertingArray, nonalertingArray];
    }

    for (const app of this.apmApps.values()) {
      if (app.reporting) {
        if (app.isAlerting()) {
          alertingArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        } else {
          nonalertingArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        }
      }
    }
    return [alertingArray, nonalertingArray, 'Alert Enabled Reporting Apps'];
  }

  getLabelAppsArray() {
    const labelArray = [];
    const nonlabelArray = [];

    if (!this.apmApps) {
      return [labelArray, nonlabelArray, 'Labelled Reporting Apps'];
    }

    for (const app of this.apmApps.values()) {
      if (app.reporting) {
        if (app.hasLabels()) {
          labelArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        } else {
          nonlabelArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        }
      }
    }
    return [labelArray, nonlabelArray, 'Labelled Reporting Apps'];
  }

  getDTAppsArray() {
    const dtEnabledArray = [];
    const nonDtEnabledArray = [];
    if (!this.apmApps) {
      return [
        dtEnabledArray,
        nonDtEnabledArray,
        'Distributed Tracing Enabled Reporting Apps'
      ];
    }

    for (const app of this.apmApps.values()) {
      if (app.isDTEnabled()) {
        dtEnabledArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/applications/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonDtEnabledArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/applications/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [
      dtEnabledArray,
      nonDtEnabledArray,
      'Distributed Tracing Enabled Reporting Apps'
    ];
  }

  getAppsWithKeyTxnsArray() {
    const keyTxnsArray = [];
    const nonkeyTxnsArray = [];
    if (!this.apmApps) {
      return [keyTxnsArray, nonkeyTxnsArray, 'Key Transaction Targeted Apps'];
    }

    for (const app of this.apmApps.values()) {
      if (this.apiData && app.reporting) {
        if (app.hasReportingKeyTxns()) {
          keyTxnsArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        } else {
          nonkeyTxnsArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        }
      }
    }
    return [keyTxnsArray, nonkeyTxnsArray, 'Key Transaction Targeted Apps'];
  }

  getAlertingKeyTxnsArray() {
    const alertingKeyTxnsArray = [];
    const nonalertingKeyTxnsArray = [];
    if (!this.apmApps) {
      return [
        alertingKeyTxnsArray,
        nonalertingKeyTxnsArray,
        'Alerting Key Transactions'
      ];
    }

    for (const app of this.apmApps.values()) {
      if (this.apiData) {
        if (app.hasReportingKeyTxns()) {
          for (const kt of app.keyTxns) {
            if (kt.isAlerting()) {
              alertingKeyTxnsArray.push(
                <a
                  href={
                    'https://rpm.newrelic.com/accounts/' +
                    this.id +
                    '/key_transactions/' +
                    kt.id
                  }
                >
                  {' '}
                  {kt.name}{' '}
                </a>
              );
            } else {
              nonalertingKeyTxnsArray.push(
                <a
                  href={
                    'https://rpm.newrelic.com/accounts/' +
                    this.id +
                    '/key_transactions/' +
                    kt.id
                  }
                >
                  {' '}
                  {kt.name}{' '}
                </a>
              );
            }
          }
        }
      }
    }
    return [
      alertingKeyTxnsArray,
      nonalertingKeyTxnsArray,
      'Alerting Key Transactions'
    ];
  }

  getDeploymentAppsArray() {
    const deploymentsAppsArray = [];
    const nondeploymentsAppsArray = [];
    if (!this.apmApps) {
      return [
        deploymentsAppsArray,
        nondeploymentsAppsArray,
        'Distributed Tracing Capable Reporting Agent Versions'
      ];
    }

    for (const app of this.apmApps.values()) {
      if (app.reporting) {
        if (app.deployMarker) {
          deploymentsAppsArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        } else {
          nondeploymentsAppsArray.push(
            <a
              href={
                'https://rpm.newrelic.com/accounts/' +
                this.id +
                '/applications/' +
                app.id
              }
            >
              {' '}
              {app.name}{' '}
            </a>
          );
        }
      }
    }
    return [
      deploymentsAppsArray,
      nondeploymentsAppsArray,
      'Distributed Tracing Capable Reporting Agent Versions'
    ];
  }

  // ALERT SUBSYSTEM METHODS -- continued
  getPolicyChannelsNotEmailArray() {
    const policyNotEmailArray = [];
    const nonPolicyNotEmailArray = [];

    if (!this.alertPolicies) {
      return [
        policyNotEmailArray,
        nonPolicyNotEmailArray,
        'Policies With Channels != Email',
        'Policies With Channels = Email or None'
      ];
    }

    for (const policy of this.alertPolicies.values()) {
      if (policy.isChannelNotEmail()) {
        policyNotEmailArray.push(
          <a
            href={
              'https://alerts.newrelic.com/accounts/' +
              this.id +
              '/policies/' +
              policy.id +
              '/channels'
            }
          >
            {' '}
            {policy.name}{' '}
          </a>
        );
      } else {
        nonPolicyNotEmailArray.push(
          <a
            href={
              'https://alerts.newrelic.com/accounts/' +
              this.id +
              '/policies/' +
              policy.id +
              '/channels'
            }
          >
            {' '}
            {policy.name}{' '}
          </a>
        );
      }
    }

    return [
      policyNotEmailArray,
      nonPolicyNotEmailArray,
      'Policies With Channels != Email',
      'Policies With Channels = Email or None'
    ];
  }

  getIncidentsMoreThanADayArray() {
    const incidentsNotMoreThanADayArray = [];
    const incidentsMoreThanADayArray = [];

    if (!this.alertPolicies) {
      return [
        incidentsNotMoreThanADayArray,
        incidentsMoreThanADayArray,
        'Open Incidents Less Than A Day',
        'Open Incidents Older Than A Day'
      ];
    }

    for (const policy of this.alertPolicies.values()) {
      if (policy.hasIncidentsMoreThanADay()) {
        const incidents = policy.getIncidentsMoreThanADay();
        for (const incident of incidents) {
          incidentsMoreThanADayArray.push(
            <a
              href={
                'https://alerts.newrelic.com/accounts/' +
                this.id +
                '/incidents/' +
                incident.id +
                '/violations'
              }
            >
              {' '}
              {incident.id}{' '}
            </a>
          );
        }
      } else {
        const incidents = policy.getIncidentsNotMoreThanADay();
        for (const incident of incidents) {
          incidentsNotMoreThanADayArray.push(
            <a
              href={
                'https://alerts.newrelic.com/accounts/' +
                this.id +
                '/incidents/' +
                incident.id +
                '/violations'
              }
            >
              {' '}
              {incident.id}{' '}
            </a>
          );
        }
      }
    }
    return [
      incidentsNotMoreThanADayArray,
      incidentsMoreThanADayArray,
      'Open Incidents Less Than A Day',
      'Open Incidents Older Than A Day'
    ];
  }

  getActiveChannelsArray() {
    const activeChannelsArray = [];
    let inactiveChannelsArray = [];
    const allChannels = [
      'campfire',
      'email',
      'hipchat',
      'opsgenie',
      'pagerduty',
      'slack',
      'victorops',
      'webhook'
    ];

    if (!this.activeChannels) {
      inactiveChannelsArray = allChannels.map(channel => (
        <a
          href={
            'https://alerts.newrelic.com/accounts/' + this.id + '/channels/new'
          }
        >
          {' '}
          {channel}{' '}
        </a>
      ));
      return [activeChannelsArray, inactiveChannelsArray, 'Active Channels'];
    }

    inactiveChannelsArray = allChannels
      .filter(x => !this.activeChannels.has(x))
      .map(channel => (
        <a
          href={
            'https://alerts.newrelic.com/accounts/' + this.id + '/channels/new'
          }
        >
          {' '}
          {channel}{' '}
        </a>
      ));

    for (const channel of this.activeChannels.values()) {
      activeChannelsArray.push(
        <a
          href={
            'https://alerts.newrelic.com/accounts/' +
            this.id +
            '/channels?offset=0&text=' +
            channel
          }
        >
          {' '}
          {channel}{' '}
        </a>
      );
    }
    return [activeChannelsArray, inactiveChannelsArray, 'Active Channels'];
  }

  getPoliciesWithNrqlArray() {
    const policyWithNrqlArray = [];
    const policyWithoutNrqlArray = [];

    if (!this.alertPolicies) {
      return [policyWithNrqlArray, policyWithoutNrqlArray, 'NRQL Policies'];
    }

    for (const policy of this.alertPolicies.values()) {
      if (policy.hasNrqlConditions()) {
        policyWithNrqlArray.push(
          <a
            href={
              'https://alerts.newrelic.com/accounts/' +
              this.id +
              '/policies/' +
              policy.id
            }
          >
            {' '}
            {policy.name}{' '}
          </a>
        );
      } else {
        policyWithoutNrqlArray.push(
          <a
            href={
              'https://alerts.newrelic.com/accounts/' +
              this.id +
              '/policies/' +
              policy.id
            }
          >
            {' '}
            {policy.name}{' '}
          </a>
        );
      }
    }

    return [policyWithNrqlArray, policyWithoutNrqlArray, 'NRQL Policies'];
  }

  getPoliciesWithConditionsArray() {
    const policyWithCondArray = [];
    const policyWithLessCondArray = [];

    if (!this.alertPolicies) {
      return [
        policyWithCondArray,
        policyWithLessCondArray,
        'Policies With At Least 4 Conditions',
        'Policies With Less Than 4 Conditions'
      ];
    }

    for (const policy of this.alertPolicies.values()) {
      if (policy.getTotalConditionScore() >= 80) {
        policyWithCondArray.push(
          <a
            href={
              'https://alerts.newrelic.com/accounts/' +
              this.id +
              '/policies/' +
              policy.id
            }
          >
            {' '}
            {policy.name}{' '}
          </a>
        );
      } else {
        policyWithLessCondArray.push(
          <a
            href={
              'https://alerts.newrelic.com/accounts/' +
              this.id +
              '/policies/' +
              policy.id
            }
          >
            {' '}
            {policy.name}{' '}
          </a>
        );
      }
    }

    return [
      policyWithCondArray,
      policyWithLessCondArray,
      'Policies With At Least 4 Conditions',
      'Policies With Less Than 4 Conditions'
    ];
  }

  // BROWSER METHODS
  getBrowserTotalApps() {
    if (this.browserApps) {
      return this.browserApps.size;
    }
    return 0;
  }

  getBrowserReportingApps() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.reporting) {
        total++;
      }
    }
    return total;
  }

  getBrowserReportingAppsPercent() {
    return (
      Math.round(
        (this.getBrowserReportingApps() / this.getBrowserTotalApps()) * 100
      ) || 0
    );
  }

  getBrowserReportingAppsArray() {
    const reportingArray = [];
    const nonreportingArray = [];

    if (!this.browserApps) {
      return [reportingArray, nonreportingArray, 'Reporting Browser Apps'];
    }

    for (const app of this.browserApps.values()) {
      if (app.reporting) {
        reportingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonreportingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [reportingArray, nonreportingArray, 'Reporting Browser Apps'];
  }

  getBrowserAlertingApps() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.isAlerting()) {
        total++;
      }
    }
    return total;
  }

  getBrowserAlertingAppsPercent() {
    return (
      Math.round(
        (this.getBrowserAlertingApps() / this.getBrowserReportingApps()) * 100
      ) || 0
    );
  }

  getBrowserAlertingAppsArray() {
    const alertingArray = [];
    const nonalertingArray = [];

    if (!this.browserApps) {
      return [alertingArray, nonalertingArray, 'Alerting Browser Apps'];
    }

    for (const app of this.browserApps.values()) {
      if (app.isAlerting()) {
        alertingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonalertingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [alertingArray, nonalertingArray, 'Alerting Browser Apps'];
  }

  getBrowserAppsWithLabels() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.hasLabels()) {
        total++;
      }
    }
    return total;
  }

  getBrowserAppsWithLabelsPercent() {
    return (
      Math.round(
        (this.getBrowserAppsWithLabels() / this.getBrowserReportingApps()) * 100
      ) || 0
    );
  }

  getBrowserAppsWithLabelsArray() {
    const labelArray = [];
    const nonlabelArray = [];
    if (!this.browserApps) {
      return [labelArray, nonlabelArray, 'Labelled Apps'];
    }

    for (const app of this.browserApps.values()) {
      if (app.hasLabels()) {
        labelArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonlabelArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [labelArray, nonlabelArray, 'Labelled Apps'];
  }

  getBrowserCustomApdexApps() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.isCustomApdex()) {
        total++;
      }
    }
    return total;
  }

  getBrowserCustomApdexAppsPercent() {
    return (
      Math.round(
        (this.getBrowserCustomApdexApps() / this.getBrowserReportingApps()) *
          100
      ) || 0
    );
  }

  getBrowserCustomApdexAppsArray() {
    const customapdexArray = [];
    const noncustomapdexArray = [];
    if (!this.browserApps) {
      return [
        customapdexArray,
        noncustomapdexArray,
        'Custom Apdex Browser Apps'
      ];
    }

    for (const app of this.browserApps.values()) {
      if (app.isCustomApdex()) {
        customapdexArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        noncustomapdexArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [customapdexArray, noncustomapdexArray, 'Custom Apdex Browser Apps'];
  }

  getPageActionEnabledApps() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.reporting && app.pageAction) {
        total++;
      }
    }
    return total;
  }

  getPageActionEnabledAppsPercent() {
    return (
      Math.round(
        (this.getPageActionEnabledApps() / this.getBrowserReportingApps()) * 100
      ) || 0
    );
  }

  getPageActionEnabledAppsArray() {
    const pageActionArray = [];
    const nonPageActionArray = [];
    if (!this.browserApps) {
      return [pageActionArray, nonPageActionArray, 'Page Action Apps'];
    }

    for (const app of this.browserApps.values()) {
      if (app.pageAction) {
        pageActionArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonPageActionArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [pageActionArray, nonPageActionArray, 'Page Action Apps'];
  }

  getAutoInstrumentationApps() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.reporting && app.autoInstrumentation) {
        total++;
      }
    }
    return total;
  }

  getAutoInstrumentationAppsPercent() {
    return (
      Math.round(
        (this.getAutoInstrumentationApps() / this.getBrowserReportingApps()) *
          100
      ) || 0
    );
  }

  getAutoInstrumentationAppsArray() {
    const autoinstrumentationArray = [];
    const nonautoinstrumentationArray = [];
    if (!this.browserApps) {
      return [
        autoinstrumentationArray,
        nonautoinstrumentationArray,
        'Auto Instrumentation Apps'
      ];
    }

    for (const app of this.browserApps.values()) {
      if (app.autoInstrumentation) {
        autoinstrumentationArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      } else {
        nonautoinstrumentationArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              app.id
            }
          >
            {' '}
            {app.name}{' '}
          </a>
        );
      }
    }
    return [
      autoinstrumentationArray,
      nonautoinstrumentationArray,
      'Auto Instrumentation Apps'
    ];
  }

  getSpaAgentEnabledApps() {
    let total = 0;
    if (!this.browserApps) {
      return total;
    }

    for (const app of this.browserApps.values()) {
      if (app.reporting && app.spaAgentEnabled) {
        total++;
      }
    }
    return total;
  }

  getSpaAgentEnabledAppsPercent() {
    return (
      Math.round(
        (this.getSpaAgentEnabledApps() / this.getBrowserReportingApps()) * 100
      ) || 0
    );
  }

  // SYNTHETICS MONOTROS
  getTotalMonitors() {
    return this.synthMonitors ? this.synthMonitors.size : 0;
  }

  getReportingMonitors() {
    let total = 0;
    if (!this.synthMonitors) {
      return total;
    }

    for (const monitor of this.synthMonitors.values()) {
      total += monitor.reporting ? 1 : 0;
    }
    return total;
  }

  getReportingMonitorsPercent() {
    return (
      Math.round(
        (this.getReportingMonitors() / this.getTotalMonitors()) * 100
      ) || 0
    );
  }

  getAlertingMonitors() {
    let total = 0;
    if (!this.synthMonitors) {
      return total;
    }

    for (const app of this.synthMonitors.values()) {
      total += app.isAlerting() ? 1 : 0;
    }
    return total;
  }

  getAlertingMonitorsPercent() {
    return (
      Math.round(
        (this.getAlertingMonitors() / this.getReportingMonitors()) * 100
      ) || 0
    );
  }

  getAlertingMonitorsArray() {
    const alertingArray = [];
    const nonalertingArray = [];

    if (!this.synthMonitors) {
      return [alertingArray, nonalertingArray, 'Alerting Synth Monitors'];
    }

    for (const monitor of this.synthMonitors.values()) {
      if (monitor.isAlerting()) {
        alertingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              monitor.id
            }
          >
            {' '}
            {monitor.name}{' '}
          </a>
        );
      } else {
        nonalertingArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              monitor.id
            }
          >
            {' '}
            {monitor.name}{' '}
          </a>
        );
      }
    }
    return [alertingArray, nonalertingArray, 'Alerting Synth Monitors'];
  }

  getMonitorsWithLabels() {
    let total = 0;
    if (!this.synthMonitors) {
      return total;
    }

    for (const monitor of this.synthMonitors.values()) {
      if (monitor.hasLabels()) {
        total++;
      }
    }
    return total;
  }

  getMonitorsWithLabelsPercent() {
    return (
      Math.round(
        (this.getMonitorsWithLabels() / this.getReportingMonitors()) * 100
      ) || 0
    );
  }

  getMonitorsWithLabelsArray() {
    const labelArray = [];
    const nonlabelArray = [];
    if (!this.synthMonitors) {
      return [labelArray, nonlabelArray, 'Labelled Monitors'];
    }

    for (const monitor of this.synthMonitors.values()) {
      if (monitor.hasLabels()) {
        labelArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              monitor.id
            }
          >
            {' '}
            {monitor.name}{' '}
          </a>
        );
      } else {
        nonlabelArray.push(
          <a
            href={
              'https://rpm.newrelic.com/accounts/' +
              this.id +
              '/browser/' +
              monitor.id
            }
          >
            {' '}
            {monitor.name}{' '}
          </a>
        );
      }
    }
    return [labelArray, nonlabelArray, 'Labelled Monitors'];
  }

  getMonitorTypesPercent() {
    const monitorTypeSet = new Set();
    for (const monitor of this.synthMonitors.values()) {
      monitorTypeSet.add(monitor.monitorType);
    }
    // capping at 100
    return (Math.min(monitorTypeSet.size, 4) / 4) * 100;
  }

  getMonitorsWith1plusLocations() {
    let total = 0;
    if (!this.synthMonitors) {
      return total;
    }

    for (const monitor of this.synthMonitors.values()) {
      if (monitor.has1plusLocations()) {
        total++;
      }
    }
    return total;
  }

  getMonitorsWith1plusLocationsPercent() {
    return (
      Math.round(
        (this.getMonitorsWith1plusLocations() / this.getReportingMonitors()) *
          100
      ) || 0
    );
  }

  getUsingPrivateLocations() {
    const total = 0;
    if (!this.synthMonitors) {
      return total;
    }

    for (const monitor of this.synthMonitors.values()) {
      if (monitor.privateLocation) {
        return 100;
      }
    }
    return 0;
  }

  // WORKLOADS METHODS
  getTotalWorkloads() {
    return this.workloadMap ? this.workloadMap.size : 0;
  }

  getReportingWorkloads() {
    let total = 0;
    if (!this.workloadMap) {
      return total;
    }

    for (const workload of this.workloadMap.values()) {
      if (workload.reporting) {
        total++;
      }
    }
    return total;
  }

  getReportingWorkloadsPercent() {
    return (
      Math.round((this.getReportingWorkloads() / this.getTotalWorkloads()) * 100) || 0
    );
  }

  getAlertingWorkloads() {
    let total = 0;
    if (!this.workloadMap) {
      return total;
    }

    for (const workload of this.workloadMap.values()) {
      if (workload.isAlerting()) {
        total++;
      }
    }
    return total;
  }

  getAlertingWorkloadsPercent() {
    return (
      Math.round((this.getAlertingWorkloads() / this.getReportingWorkloads()) * 100) || 0
    );
  }

  getWorkloadsWithLabels() {
    let total = 0;
    if (!this.workloadMap) {
      return total;
    }

    for (const workload of this.workloadMap.values()) {
      if (workload.hasLabels()) {
        total++;
      }
    }
    return total;
  }

  getWorkloadsWithLabelsPercent() {
    return (
      Math.round((this.getWorkloadsWithLabels() / this.getReportingWorkloads()) * 100) ||
      0
    );
  }

  getWorkloadsWithOwner() {
    let total = 0;
    if (!this.workloadMap) {
      return total;
    }

    for (const workload of this.workloadMap.values()) {
      if (workload.hasOwner()) {
        total++;
      }
    }
    return total;
  }

  getWorkloadsWithOwnerPercent() {
    return (
      Math.round((this.getWorkloadsWithOwner() / this.getReportingWorkloads()) * 100) ||
      0
    );
  }

  getWorkloadsWithRelatedDashboards() {
    let total = 0;
    if (!this.workloadMap) {
      return total;
    }

    for (const workload of this.workloadMap.values()) {
      if (workload.hasRelatedDashboards()) {
        total++;
      }
    }
    return total;
  }

  getWorkloadsWithRelatedDashboardsPercent() {
    return (
      Math.round((this.getWorkloadsWithRelatedDashboards() / this.getReportingWorkloads()) * 100) ||
      0
    );
  }
}

export { Account };
