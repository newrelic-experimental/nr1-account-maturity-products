/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function SLMTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const SLMSummaryCols = [
  {
    Header: 'Account Info',
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
    Header: 'Reporting SLM Calculation',
    columns: [
      {
        Header: 'SLI Count',
        accessor: 'entityCount',
        filterable: false
      },
      {
        Header: `# Alerts Using SLI's`,
        accessor: 'sliUsedInAlertsCount',
        filterable: false
      },
      {
        Header: `SLI's Used`,
        accessor: 'isUsingSLI',
        Cell: row => cellRenderer(row, SLMListCols),
        filterable: false
      },
      {
        Header: `Alerts Using SLI's`,
        accessor: 'hasSLIAlerting',
        Cell: row => cellRenderer(row, SLMListCols),
        filterable: false
      },
      {
        Header: 'Has Owner %',
        accessor: 'getOwnerPercentage',
        Cell: row => cellRenderer(row, SLMListCols),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, SLMListCols),
        filterable: false
      }
    ]
  }
];

export const SLMListCols = [
  {
    Header: 'SLM Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      {
        Header: 'Has SLI Query Alerts',
        accessor: 'hasSLIQueryAlerts',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Has Owner',
        accessor: 'hasOwner',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];
