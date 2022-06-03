/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function WorkloadsTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const WorkloadSummaryCols = [
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
    Header: 'Reporting Workloads Calculation',
    columns: [
      {
        Header: 'Workloads',
        accessor: 'entityCount',
        filterable: false
      },

      // ### SK - DEBUG - use only "entityCount" for now
      {
        Header: 'Reporting Workloads %',
        accessor: 'reportingWorkloadsPercentage',
        Cell: row => cellRenderer(row, WorkloadListCols),
        filterable: false
      },
      {
        Header: 'Alerts %',
        accessor: 'alertingWorkloadsPercentage',
        Cell: row => cellRenderer(row, WorkloadListCols),
        filterable: false
      },
      {
        Header: 'Labels %',
        accessor: 'usingLabelsPercentage',
        Cell: row => cellRenderer(row, WorkloadListCols),
        filterable: false
      },
      {
        Header: 'With Related Dashboards %',
        accessor: 'workloadsWithRelatedDashboardsPercentage',
        Cell: row => cellRenderer(row, WorkloadListCols),
        filterable: false
      },
      {
        Header: 'With Owner %',
        accessor: 'workloadsWithOwnerPercentage',
        Cell: row => cellRenderer(row, WorkloadListCols),
        filterable: false
      },

      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, WorkloadListCols),
        filterable: false
      }
    ]
  }
];

export const WorkloadListCols = [
  {
    Header: 'Workloads Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Related Dashboards', accessor: 'relatedDashboards' },
      {
        Header: 'Reporting',
        accessor: 'reporting',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Has Related Dashboards',
        accessor: 'hasRelatedDashboards',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Has Owner Details',
        accessor: 'hasOwner',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Labels',
        accessor: 'hasLabels',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];
