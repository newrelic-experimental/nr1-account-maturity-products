/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function NPMTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const NPMSummaryCols = [
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
    Header: 'Reporting NPM Calculation',
    columns: [
      {
        Header: '# SNMP Devices',
        accessor: 'snmpDeviceCount',
        filterable: false
      },
      {
        Header: 'Devices w. Generic Profile %',
        accessor: 'noKentikProviderPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Devices Missing Entity Definition %',
        accessor: 'devicesWithNoEntityDefinitionPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'SNMP Polling Failures',
        accessor: 'snmpPollingFailurePercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Network Flow Devices Used',
        accessor: 'isKentikFlowDeviceUsed',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'VPC Flow Devices Used',
        accessor: 'isKentikVpcDeviceUsed',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Network Syslog Devices Used',
        accessor: 'isKtranslateSyslogDeviceUsed',
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
