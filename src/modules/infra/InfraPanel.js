import React from 'react';
import PropTypes from 'prop-types';

import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';
import {
  createInfraTableData,
  computeInfraMaturityScore
} from './process-infra-score';
import { InfraTable, InfraSummaryCols } from './InfraTable';
import { InfraModel } from './fetch-infra-data';

import { FilterTableData } from '../../utils/FilterTableData';

export const InfraPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => (
            <InfraPanelTag
              appContext={appContext}
              maturityCtxUpdateScore={scoreContext.updateScore}
            />
          )}
        </MaturityScoreCtxConsumer>
      );
    }}
  </ApplicationCtxConsumer>
);

export class InfraPanelTag extends React.Component {
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
    this.docInfraLatestVersion =
      appContext.docAgentLatestVersion.infrastructure;
    this.docEventTypes = appContext.docEventTypes;
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;
    this.hasNrqlErrors = appContext.hasErrors;

    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData =
      this.props.fetchData ||
      function() {
        return Promise.resolve(false);
      };

    this.createTableData = this.props.createTableData || createInfraTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeInfraMaturityScore;

    this.scoreWeights = this.props.scoreWeights || InfraModel.scoreWeights;

    this.tableColHeader = this.props.tableColHeader || InfraSummaryCols;
  }

  async componentDidMount() {
    const hasErrors = await this.fetchData(
      this.ctxAcctMap,
      this.nerdGraphQuery
    );

    const tableData = this.createTableData(this.ctxAcctMap, {
      docEventTypes: this.docEventTypes,
      docInfraLatestVersion: this.docInfraLatestVersion
    });
    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData,
      hasErrors: this.hasNrqlErrors || hasErrors
    });
    this.maturityCtxUpdateScore('INFRASTRUCTURE', scores, tableData);
  }

  addMaturityScoreToTable(tableData) {
    const maturityScores = {};

    tableData.forEach(row => {
      const weights = { ...this.scoreWeights };

      if (!row.infrastructureUsingDocker) {
        delete weights.infrastructureUsingDocker;
      }

      if (!row.infrastructureAWSBillingEnabled) {
        delete weights.infrastructureAWSBillingEnabled;
      }

      const { score } = this.computeMaturityScore({
        rowData: row,
        scoreWeights: weights
      });
      const { accountID, accountName } = row;
      row.overallScore = score;

      maturityScores[accountID] = { accountID, accountName, SCORE: score };
    });

    return maturityScores;
  }

  render() {
    if (this.state.loading) {
      return <CustomCircleLoader message="Loading Infrastructure Data" />;
    }
    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
        hasErrors={this.state.hasErrors}
      >
        {({ filteredData }) => (
          <InfraTable data={filteredData} columns={this.tableColHeader} />
        )}
      </FilterTableData>
    );
  }
}
