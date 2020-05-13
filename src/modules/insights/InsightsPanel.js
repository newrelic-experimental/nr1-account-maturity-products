import React from 'react';
import PropTypes from 'prop-types';
import { fetchInsightsData, InsightsModel } from './fetch-insights-data';

import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';
import {
  createInsightsTableData,
  computeInsightsMaturityScore
} from './process-insights-score';

import { InsightsTable, InsightsSummaryCols } from './InsightsTable';
import { FilterTableData } from '../../utils/FilterTableData';

export const InsightsPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => (
            <InsightsPanelTag
              appContext={appContext}
              maturityCtxUpdateScore={scoreContext.updateScore}
            />
          )}
        </MaturityScoreCtxConsumer>
      );
    }}
  </ApplicationCtxConsumer>
);

export class InsightsPanelTag extends React.Component {
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
      table: []
    };
    const { appContext } = this.props;
    this.nerdGraphQuery = appContext.nerdGraphQuery;
    this.ctxAcctMap = new Map(appContext.accountMap);
    this.docEventTypes = appContext.docEventTypes;
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;
    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData = this.props.fetchData || fetchInsightsData;
    this.createTableData =
      this.props.createTableData || createInsightsTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeInsightsMaturityScore;

    this.scoreWeights = this.props.scoreWeights || InsightsModel.scoreWeights;

    this.tableColHeader = this.props.tableColHeader || InsightsSummaryCols;
  }

  async componentDidMount() {
    // eslint-disable-next-line no-console
    console.time('fetchInsightsData');
    await this.fetchData(this.ctxAcctMap, this.nerdGraphQuery);
    // eslint-disable-next-line no-console
    console.timeEnd('fetchInsightsData');

    const tableData = this.createTableData(this.ctxAcctMap, {
      docEventTypes: this.docEventTypes,
      docAgentLatestVersion: this.docAgentLatestVersion
    });
    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData
    });
    this.maturityCtxUpdateScore('INSIGHTS', scores, tableData);
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
      return <CustomCircleLoader message="Loading Insights Data" />;
    }

    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
      >
        {({ filteredData }) => (
          <InsightsTable data={filteredData} columns={this.tableColHeader} />
        )}
      </FilterTableData>
    );
  }
}
