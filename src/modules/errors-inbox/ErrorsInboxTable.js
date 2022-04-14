/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function ErrorsInboxTable(props) {
  console.log('ErrorsInboxTable', props)
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const ErrorsInboxSummaryCols = [
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
    Header: 'Errors Inbox Maturity',
    columns: [
      {
        Header: 'Total # of Error Groups',
        accessor: 'errorGroupCount',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: '% of Assigned',
        accessor: 'errorGroupAssignedPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: '% of Unresolved',
        accessor: 'errorGroupUnresolvedPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: '% of Ignored',
        accessor: 'errorGroupIgnoredPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: '% with Comments',
        accessor: 'errorGroupCommentsPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      // {
      //   Header: '% of Resolved',
      //   accessor: 'loggingReporting',
      //   Cell: row => cellRenderer(row),
      //   filterable: false
      // },
      // {
      //   Header: 'Comment is not null',
      //   accessor: 'loggingReporting',
      //   Cell: row => cellRenderer(row),
      //   filterable: false
      // },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row),
        filterable: false
      }
    ]
  }
];
