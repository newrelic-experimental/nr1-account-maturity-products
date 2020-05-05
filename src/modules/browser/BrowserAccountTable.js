/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function BrowserAccountTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const BrowserSummaryCols = [
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
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'DT Capable Apps %',
        accessor: 'browserDTEnabledPercentage',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'Alerts %',
        accessor: 'appsWithAlertsPercentage',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: ' Custom Apdex %',
        accessor: 'customApdexPercentage',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'Page Action %',
        accessor: 'browserUsingPageActionsPercentage',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'Auto Instrumentation %',
        accessor: 'browserAutoInstrumentationUsedPercentage',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'SPA Agent Enabled %',
        accessor: 'browserSpaAgentEnabledPercentage',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'Custom Attributes',
        accessor: 'usingCustomAttributes',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, BrowserListCols),
        filterable: false
      }
    ]
  }
];

export const BrowserListCols = [
  {
    Header: 'Account Applications Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Apdex T', accessor: 'apdexT' },
      { Header: 'Health Status', accessor: 'healthStatus' },
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
        Header: 'DT Capable',
        accessor: 'isDTCapable',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Page Actions',
        accessor: 'pageAction',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Auto Instrumented',
        accessor: 'autoInstrumentation',
        Cell: row => cellRenderer(row)
      },
      {
        Header: ' Alerting Enabled',
        accessor: 'isAlerting',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];
