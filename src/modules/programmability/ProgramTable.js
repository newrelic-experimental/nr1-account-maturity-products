/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function ProgramTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const ProgramSummaryCols = [
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
    Header: 'Programmability Maturity Criteria',
    columns: [
      {
        Header: 'Using Programmability',
        accessor: 'programmabilityUsed',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Are Users Deploying Nerdpacks (Last 7 days)',
        accessor: 'programmabilityDeploymentsAttemptedPercentage',
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
