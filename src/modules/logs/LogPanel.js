import React from 'react';
import PropTypes from 'prop-types';

import {
  createLogsTableData,
  computeLogsMaturityScore
} from './process-logs-score';
import { LogTable, LogSummaryCols } from './LogTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';
import { FilterTableData } from '../../utils/FilterTableData';
import { LogsModel } from './fetch-logs-data';

export const LogPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            return (
              <LogPanelTag
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

export class LogPanelTag extends React.Component {
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

    this.fetchData =
      this.props.fetchData ||
      function() {
        return Promise.resolve(false);
      };

    this.createTableData = this.props.createTableData || createLogsTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeLogsMaturityScore;

    this.scoreWeights = this.props.scoreWeights || LogsModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || LogSummaryCols;
  }

  async componentDidMount() {
    const hasErrors = await this.fetchData(
      this.ctxAcctMap,
      this.nerdGraphQuery
    );
    const tableData = this.createTableData(this.ctxAcctMap);
    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData,
      hasErrors: this.hasNrqlErrors || hasErrors
    });

    this.maturityCtxUpdateScore('LOG', scores, tableData);
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
      return <CustomCircleLoader message="Loading Log Event Data" />;
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
          <LogTable data={filteredData} columns={this.tableColHeader} />
        )}
      </FilterTableData>
    );
  }
}
