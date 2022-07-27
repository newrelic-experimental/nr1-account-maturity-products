/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function KubernetesTable(props) {
  return (
    <div>
      <ReactTable data={props.data} columns={props.columns} filterable />
      {CreateCSVLink(props.columns, props.data)}
    </div>
  );
}

export const KubernetesSummaryCols = [
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
    Header: 'Reporting Kubernetes Calculation',
    columns: [
      {
        Header: 'K8s Clusters',
        accessor: 'entityCount',
        filterable: false
      },
      {
        Header: 'Infra Agents Installed %',
        accessor: 'infraAgentsInstalledPercentage',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      },
      {
        Header: 'K8s Events %',
        accessor: 'infraK8sEventsPercentage',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      },
      {
        Header: 'Using Prometheus %',
        accessor: 'prometheusLabelsPercentage',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      },
      {
        Header: 'Apm Agents Installed %',
        accessor: 'apmAgentsInsideK8sClustersPercentage',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      },
      {
        Header: 'Using Log %',
        accessor: 'nrLogsEventsPercentage',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      },
      {
        Header: 'Using Pixie %',
        accessor: 'clustersUsingPixiePercentage',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      },
      {
        Header: 'Overall Score %',
        accessor: 'overallScore',
        Cell: row => cellRenderer(row, KubernetesListCols),
        filterable: false
      }
    ]
  }
];

export const KubernetesListCols = [
  {
    Header: 'Kubernetes Cluster Info',
    columns: [
      { Header: 'Name', accessor: 'name' },
      {
        Header: 'Infra Agents Installed',
        accessor: 'isInfraAgentsInstalled',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Infra K8s Event Generated',
        accessor: 'isInfraK8sEventGenerated',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Using Prometheus',
        accessor: 'isPrometheusLabelUsed',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Apm Agents Installed',
        accessor: 'isApmAgentsInstalledInsideK8sCluster',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Log Enabled',
        accessor: 'isNrLogEnabled',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Using Pixie',
        accessor: 'isClusterUsingPixie',
        Cell: row => cellRenderer(row)
      },
      {
        Header: 'Pixie Services',
        accessor: 'existPixieUniqueServices',
        Cell: row => cellRenderer(row)
      }
    ]
  }
];
