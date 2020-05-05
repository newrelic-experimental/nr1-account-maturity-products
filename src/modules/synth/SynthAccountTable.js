/* eslint-disable react/prop-types */

import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function SynthAccountTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const SynthSummaryCols = [
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
        Header: 'Monitors',
        accessor: 'entityCount',
        filterable: false
      },
      {
        Header: 'Reporting Monitors %',
        accessor: 'reportingMonitorPercentage',
        Cell: row => cellRenderer(row, SynthListCols),
        filterable: false
      },
      {
        Header: 'Alerts %',
        accessor: 'monitorsWithAlertsPercentage',
        Cell: row => cellRenderer(row, SynthListCols),
        filterable: false
      },
      {
        Header: 'Labels %',
        accessor: 'usingLabelsPercentage',
        Cell: row => cellRenderer(row, SynthListCols),
        filterable: false
      },
      {
        Header: 'Monitor Types Used %',
        accessor: 'syntheticsMonitorTypesPercentage',
        Cell: row => cellRenderer(row, SynthListCols),
        filterable: false
      },
      {
        Header: 'Monitors with >1 Location %',
        accessor: 'syntheticsMonitorWithMultipleLocationsPercentage',
        Cell: row => cellRenderer(row, SynthListCols),
        filterable: false
      },
      {
        Header: 'Using Private Locations',
        accessor: 'syntheticsUsingPrivateLocationsPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, SynthListCols),
        filterable: false
      }
    ]
  }
];

export const SynthListCols = [
  {
    Header: 'Account Applications Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Health Status', accessor: 'healthStatus' },
      { Header: 'Monitor Type', accessor: 'monitorType' },
      { Header: 'Period', accessor: 'period' },
      { Header: 'Locations Running', accessor: 'locationsRunning' },
      { Header: 'Locations Failing', accessor: 'locationsFailing' },
      { Header: 'Success Rate', accessor: 'successRate' },
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
        Header: 'Custom Labels',
        accessor: 'hasLabels',
        Cell: row => cellRenderer(row)
      },
      {
        Header: '> 1 Locations',
        accessor: 'has1plusLocations',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Using Private Locations',
        accessor: 'usingPrivateLocations',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];
