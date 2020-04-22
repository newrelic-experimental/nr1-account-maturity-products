import React from 'react';
import PropTypes from 'prop-types';
import { fetchAPMData, ApmModel } from './fetch-apm-data';

import {
  createAPMTableData,
  computeAPMMaturityScore
} from './process-apm-score';
import { APMAccountTable, APMSummaryCols } from './APMAccountTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';

import { FilterTableData } from '../../utilities';

export const APMPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            return (
              <APMPanelTag
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

export class APMPanelTag extends React.Component {
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
    this.docAgentLatestVersion = appContext.docAgentLatestVersion;
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;
    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);
    this.hasNrqlErrors = appContext.hasErrors;

    this.fetchData = this.props.fetchData || fetchAPMData;
    this.createTableData = this.props.createTableData || createAPMTableData;

    this.computeMaturityScore =
      this.props.computeMaturityScore || computeAPMMaturityScore;
    this.scoreWeights = this.props.scoreWeights || ApmModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || APMSummaryCols;
  }

  async componentDidMount() {
    console.time('fetchAPMData');
    const hasErrors = await this.fetchData(
      this.ctxAcctMap,
      this.nerdGraphQuery
    );
    console.timeEnd('fetchAPMData');
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
    this.maturityCtxUpdateScore('APM', scores, tableData);
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
      return <CustomCircleLoader message="Loading APM Application Data" />;
    }
    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
        hasErrors={this.state.hasErrors}
      >
        {({ filteredData }) => (
          <APMAccountTable data={filteredData} columns={this.tableColHeader} />
        )}
      </FilterTableData>
    );
  }
}
