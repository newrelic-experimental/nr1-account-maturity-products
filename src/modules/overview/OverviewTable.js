/* eslint-disable react/prop-types */
import React from 'react';
import ReactTable from 'react-table-v6';
import { cellRenderer, CreateCSVLink } from '../../utilities';
import matchSorter from 'match-sorter';

export function OverviewTable(props) {
  const { data, keys } = props;
  const summaryHeader = props.summaryHeader || OVERVIEW_ACCOUNT_HEADER;
  const columnHeaders = getColumnHeaders(keys, [...summaryHeader]);
  return (
    <div>
      <ReactTable data={data} columns={columnHeaders} filterable />
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

function getColumnHeaders(productKeys, summaryHeader) {
  const headers = summaryHeader;

  const productHeader = {
    Header: 'Account Maturity Scores',
    columns: []
  };

  const productHeaderDef = {
    APM_SCORE: {
      Header: 'APM',
      accessor: 'APM_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    BROWSER_SCORE: {
      Header: 'Browser',
      accessor: 'BROWSER_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    SYNTHETICS_SCORE: {
      Header: 'Synthetics',
      accessor: 'SYNTHETICS_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    INFRASTRUCTURE_SCORE: {
      Header: 'Infrastructure',
      accessor: 'INFRASTRUCTURE_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    INSIGHTS_SCORE: {
      Header: 'Insights',
      accessor: 'INSIGHTS_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    LOG_SCORE: {
      Header: 'Log',
      accessor: 'LOG_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    PROGRAMMABILITY_SCORE: {
      Header: 'Programmability',
      accessor: 'PROGRAMMABILITY_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    },
    MOBILE_SCORE: {
      Header: 'Mobile',
      accessor: 'MOBILE_SCORE',
      Cell: row => cellRenderer(row),
      filterable: false
    }
  };

  productKeys.forEach(prodKey => {
    if (!productHeaderDef[prodKey]) {
      throw new Error(`OverviewPanel : Unknown key ${prodKey}.`);
    }
    productHeader.columns.push(productHeaderDef[prodKey]);
  });

  headers.push(productHeader);

  return headers;
}
