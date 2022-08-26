/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function OverviewTable(props) {
  const { data, keys } = props;
  const columnHeaders = [...OVERVIEW_ACCOUNT_HEADER, ProductColumns];
  const isLoading = keys && keys.length < ProductColumns.columns.length;
  return (
    <div>
      <ReactTable
        data={data}
        columns={columnHeaders}
        filterable
        loading={isLoading}
      />
      {CreateCSVLink(columnHeaders, data)}
    </div>
  );
}

export const OVERVIEW_ACCOUNT_HEADER = [
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
  }
];

export const ProductColumns = {
  Header: 'Account Maturity Scores',
  columns: [
    {
      Header: 'APM',
      accessor: 'APM_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Browser',
      accessor: 'BROWSER_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Synthetics',
      accessor: 'SYNTHETICS_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Infrastructure',
      accessor: 'INFRASTRUCTURE_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Kubernetes',
      accessor: 'KUBERNETES_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Insights',
      accessor: 'INSIGHTS_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Log',
      accessor: 'LOG_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Programmability',
      accessor: 'PROGRAMMABILITY_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Mobile',
      accessor: 'MOBILE_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    {
      Header: 'Workloads',
      accessor: 'WORKLOADS_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    }
  ]
};
