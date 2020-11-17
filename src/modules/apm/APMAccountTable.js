/* eslint-disable react/prop-types */

import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function APMAccountTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const APMSummaryCols = [
  {
    Header: 'Acccount Info',
    columns: [
      {
        Header: 'Account Name',
        accessor: 'accountName',
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ['accountName'] }),
        filterAll: true
      },
      {
        Header: 'ID',
        accessor: 'accountID'
      }
    ]
  },
  {
    Header: 'Reporting Application Calculation',
    columns: [
      {
        Header: 'Apps',
        accessor: 'entityCount',
        filterable: false
      },
      {
        Header: 'Reporting Apps %',
        accessor: 'reportingAppPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'Alerts %',
        accessor: 'appsWithAlertsPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'Custom Apdex %',
        accessor: 'customApdexPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'Labels %',
        accessor: 'usingLabelsPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'Using Recent Agent %',
        accessor: 'apmLatestAgentPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'DT Enabled %',
        accessor: 'apmDistributedTracingEnabledPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'Deployment Markers %',
        accessor: 'apmDeploymentMarkersPercentage',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      },
      {
        Header: 'Custom Attributes',
        accessor: 'usingCustomAttributes',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, APMListCols),
        filterable: false
      }
    ]
  }
];

export const APMListCols = [
  {
    Header: 'Account Applications Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Throughput', accessor: 'throughput' },
      { Header: 'Apdex T', accessor: 'apdexT' },
      { Header: 'Health Status', accessor: 'healthStatus' },
      { Header: 'Language', accessor: 'language' },
      { Header: 'Max Version', accessor: 'maxVersion' },
      {
        Header: 'Reporting',
        accessor: 'reporting',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Custom Apdex',
        accessor: 'isCustomApdex',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Recent Agent',
        accessor: 'isRecentAgent',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Deployment Marker',
        accessor: 'deployMarker',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'DT Enabled',
        accessor: 'isDTEnabled',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Alerting Enabled',
        accessor: 'isAlerting',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Custom Labels',
        accessor: 'hasLabels',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];
