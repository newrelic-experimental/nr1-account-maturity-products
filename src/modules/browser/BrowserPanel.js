import React from 'react';
import PropTypes from 'prop-types';
import { fetchBrowserData, BrowserModel } from './fetch-browser-data';

import {
  createBrowserTableData,
  computeBrowserMaturityScore
} from './process-browser-score';
import { BrowserAccountTable, BrowserSummaryCols } from './BrowserAccountTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';
import { FilterTableData } from '../../utilities';

export const BrowserPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            return (
              <BrowserPanelTag
                appContext={appContext}
                maturityCtxUpdateScore={scoreContext.updateScore}
              />
            );
          }}
        </MaturityScoreCtxConsumer>
      );
    }}
  </ApplicationCtxConsumer>
);

export class BrowserPanelTag extends React.Component {
  static propTypes = {
    appContext: PropTypes.object,
    maturityCtxUpdateScore: PropTypes.func,
    fetchData: PropTypes.func,
    scoreWeights: PropTypes.object,
    tableColHeader: PropTypes.array,
    createTableData: PropTypes.func,
    computeMaturityScore: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      table: [],
      hasErrors: false
    };

    const { appContext } = this.props;
    this.nerdGraphQuery = appContext.nerdGraphQuery;
    this.ctxAcctMap = new Map(appContext.accountMap);
    this.docEventTypes = appContext.docEventTypes;
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;
    this.hasNrqlErrors = appContext.hasErrors;

    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData = this.props.fetchData || fetchBrowserData;
    this.createTableData = this.props.createTableData || createBrowserTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeBrowserMaturityScore;

    this.scoreWeights = this.props.scoreWeights || BrowserModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || BrowserSummaryCols;
  }

  async componentDidMount() {
    // eslint-disable-next-line no-console
    console.time('fetchBrowserData');
    const hasErrors = await this.fetchData(
      this.ctxAcctMap,
      this.nerdGraphQuery
    );
    // eslint-disable-next-line no-console
    console.timeEnd('fetchBrowserData');

    const tableData = this.createTableData(this.ctxAcctMap, {
      docEventTypes: this.docEventTypes,
      docAgentLatestVersion: this.docAgentLatestVersion
    });

    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData,
      hasErrors: this.hasNrqlErrors || hasErrors
    });
    this.maturityCtxUpdateScore('BROWSER', scores, tableData);
  }

  addMaturityScoreToTable(tableData) {
    const maturityScores = {};

    tableData.forEach(row => {
      const { score } = this.computeMaturityScore({
        rowData: row,
        scoreWeights: this.scoreWeights
      });

      const { accountID, accountName } = row;
      row.overallScore = score;

      maturityScores[accountID] = { accountID, accountName, SCORE: score };
    });

    return maturityScores;
  }

  render() {
    if (this.state.loading) {
      return <CustomCircleLoader message="Loading Browser Application Data" />;
    }

    const { appContext } = this.props;
    const { contactInfo } = appContext;
    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
        hasErrors={this.state.hasErrors}
        contactInfo={contactInfo}
      >
        {({ filteredData }) => (
          <BrowserAccountTable
            data={filteredData}
            columns={this.tableColHeader}
          />
        )}
      </FilterTableData>
    );
  }
}
