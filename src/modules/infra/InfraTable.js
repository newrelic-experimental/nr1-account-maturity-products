/* eslint-disable react/prop-types */
import React from 'react';
import Popup from 'reactjs-popup';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';
import { InfraDrilldownPanel } from './InfraDrilldownPanel';

export function InfraTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const InfraSummaryCols = [
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
    Header: 'Infrastructure Maturity Criteria',
    columns: [
      {
        Header: 'Hosts',
        accessor: 'entityCount',
        filterable: false
      },
      {
        Header: 'Using Recent Agent %',
        accessor: 'infrastructureLatestAgentPercentage',
        Cell: row => cellRenderer(row, InfraListCols, renderFn),
        filterable: false
      },
      {
        Header: 'On-host Integration',
        accessor: 'infrastructureUsingOHIs',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Cloud Integration Enabled',
        accessor: 'infrastructureCloudIntegrationEnabled',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Custom Attributes',
        accessor: 'usingCustomAttributes',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'Custom Attributes %',
        accessor: 'infrastructureCustomAttributesHostPercentage',
        Cell: row => cellRenderer(row, InfraListCols, renderFn),
        filterable: false
      },
      {
        Header: 'Docker Labels %',
        accessor: 'infrastructureDockerLabelsPercentage',
        Cell: row => cellRenderer(row),
        filterable: false
      },
      {
        Header: 'AWS Billing Enabled',
        accessor: 'infrastructureAWSBillingEnabled',
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

const InfraListCols = [
  {
    Header: 'Recent Account Host Info',
    columns: [
      { Header: 'Host Name', accessor: 'name' },
      {
        Header: 'Agent Version',
        accessor: 'maxVersion',
        Cell: row =>
          cellRenderer(row, row.original.infrastructureLatestAgentValue)
      },
      // { Header: 'Health Status', accessor: 'healthStatus' },
      {
        Header: 'Custom Attributes',
        accessor: 'customAttributes',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];

function renderFn(row, columns, trigger) {
  const contentStyle = {
    maxWidth: '1500x',
    width: '90%'
  };
  return (
    <Popup
      trigger={trigger}
      position="right center"
      modal
      contentStyle={contentStyle}
    >
      <div>
        <InfraDrilldownPanel row={row} columns={columns} />
      </div>
    </Popup>
  );
}
