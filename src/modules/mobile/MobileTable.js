/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import matchSorter from 'match-sorter';
import { cellRenderer, CreateCSVLink } from '../../utilities';

export function MobileTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const MobileSummaryCols = [
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
      { Header: 'ID', accessor: 'accountID' }
    ]
  },
  {
    Header: 'Mobile Maturity Criteria',
    columns: [
      {
        Header: 'Total Apps',
        accessor: 'entityCount',
        filterable: false
      },
      {
        Header: 'Launch Count',
        accessor: 'mobileAppLaunchCount',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      },
      {
        Header: 'Latest Version %',
        accessor: 'mobileLatestAgentPercentage',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      },
      {
        Header: 'Breadcrumbs %',
        accessor: 'mobileUsingBreadcrumbsPercentage',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      },
      {
        Header: 'Handled Exceptions %',
        accessor: 'mobileUsingHandledExceptionsPercentage',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      },
      {
        Header: 'App Activity %',
        accessor: 'mobileAppsActivePercentage',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      },
      {
        Header: 'Alert Configured %',
        accessor: 'appsWithAlertsPercentage',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, MobileListCols),
        filterable: false
      }
    ]
  }
];

export const MobileListCols = [
  {
    Header: 'Account Applications Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Health Status', accessor: 'healthStatus' },
      {
        Header: 'Reporting',
        accessor: 'reporting',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Alerting Enabled',
        accessor: 'isAlerting',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Breadcrumbs',
        accessor: 'breadcrumbs',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Handled Exceptions',
        accessor: 'handledExceptions',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Mobile Events',
        accessor: 'mobileEvents',
        Cell: row => cellRenderer(row)
      },
      /* {
        Header: 'Custom Labels',
        accessor: 'hasLabels',
        Cell: row => cellRenderer(row)
      }, */
    ]
  }
];