import React from 'react';
import PropTypes from 'prop-types';

import {
  createErrorsInboxTableData,
  computeErrorsInboxMaturityScore
} from './process-errors-inbox-score';
import { ErrorsInboxTable, ErrorsInboxSummaryCols } from './ErrorsInboxTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts';
import { FilterTableData } from '../../utils/FilterTableData';
import {
  ErrorsInboxModel,
  fetchErrorsInboxData
} from './fetch-errors-inbox-data';

export const ErrorsInboxPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching Errors Inbox..." />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            return (
              <ErrorsInboxTag
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

export class ErrorsInboxTag extends React.Component {
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

    this.fetchData = this.props.fetchData || fetchErrorsInboxData;

    this.createTableData =
      this.props.createTableData || createErrorsInboxTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeErrorsInboxMaturityScore;

    this.scoreWeights =
      this.props.scoreWeights || ErrorsInboxModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || ErrorsInboxSummaryCols;
  }

  async componentDidMount() {
    await this.fetchData(this.ctxAcctMap, this.nerdGraphQuery);

    const tableData = this.createTableData(this.ctxAcctMap, {});
    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData
    });

    this.maturityCtxUpdateScore('ERRORS_INBOX', scores, tableData);
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
      return <CustomCircleLoader message="Loading Errors Inbox..." />;
    }

    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
      >
        {({ filteredData }) => {
          return (
            <ErrorsInboxTable
              data={filteredData}
              columns={this.tableColHeader}
            />
          );
        }}
      </FilterTableData>
    );
  }
}
