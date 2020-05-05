/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import matchSorter from 'match-sorter';
import { CreateCSVLink } from '../../utilities';

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
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Latest Version %',
        accessor: 'mobileLatestAgentPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Breadcrumbs %',
        accessor: 'mobileUsingBreadcrumbsPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Handled Exceptions %',
        accessor: 'mobileUsingHandledExceptionsPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'App Activity %',
        accessor: 'mobileAppsActivePercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Alert Configured %',
        accessor: 'appsWithAlertsPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row),
        filterable: false
      }
    ]
  }
];

function cellRenderer(row) {
  const { value } = row;
  let fn;
  switch (typeof value) {
    case 'boolean':
      fn = BooleanCellRender;
      break;
    case 'number':
      fn = NumberCellRender;
      break;
    case 'string':
      fn = StringCellRender;
      break;
  }

  return fn ? fn(row) : null;
}

function StringCellRender(row) {
  const { value } = row;
  return String(value.length);
}

function BooleanCellRender(row) {
  const { value } = row;

  return (
    <div
      style={{
        backgroundColor: value === true ? '#85cc00' : '#ff7878'
      }}
    >
      {String(value)}
    </div>
  );
}

function NumberCellRender(row) {
  const { value } = row;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#cccccc',
        borderRadius: '2px'
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          backgroundColor:
            value >= 70 ? '#85cc00' : value >= 30 ? '#ffbf00' : '#ff7878',
          borderRadius: '2px',
          transition: 'all .2s ease-out'
        }}
      >
        {value}
      </div>
    </div>
  );
}
