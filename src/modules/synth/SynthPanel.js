import React from 'react';
import PropTypes from 'prop-types';
import { fetchSynthData, SynthModel } from './fetch-synth-data';

import {
  createSynthTableData,
  computeSynthMaturityScore
} from './process-synth-score';
import { SynthAccountTable, SynthSummaryCols } from './SynthAccountTable';

import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';
import { FilterTableData } from '../../utilities';

export const SynthPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            return (
              <SynthPanelTag
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

export class SynthPanelTag extends React.Component {
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
    this.hasNrqlErrors = appContext.hasErrors;

    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData = this.props.fetchData || fetchSynthData;
    this.createTableData = this.props.createTableData || createSynthTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeSynthMaturityScore;

    this.scoreWeights = this.props.scoreWeights || SynthModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || SynthSummaryCols;
  }

  async componentDidMount() {
    console.time('fetchSynthData');
    const hasErrors = await this.fetchData(
      this.ctxAcctMap,
      this.nerdGraphQuery
    );
    console.timeEnd('fetchSynthData');
    const tableData = this.createTableData(this.ctxAcctMap);
    const scores = this.addMaturityScoreToTable(tableData, this.ctxAcctMap);
    this.setState({
      loading: false,
      table: tableData,
      hasErrors: this.hasNrqlErrors || hasErrors
    });

    this.maturityCtxUpdateScore('SYNTHETICS', scores, tableData);
  }

  addMaturityScoreToTable(tableData, ctxAcctMap) {
    const maturityScores = {};

    tableData.forEach(row => {
      const account = ctxAcctMap.get(row.accountID);
      const apiSet = account.apiData ? 'api' : 'nonApi';
      const weight = this.scoreWeights[apiSet];

      const { score } = this.computeMaturityScore({
        rowData: row,
        scoreWeights: weight
      });

      const { accountID, accountName } = row;
      row.overallScore = score;

      maturityScores[accountID] = { accountID, accountName, SCORE: score };
    });

    return maturityScores;
  }

  render() {
    if (this.state.loading) {
      return <CustomCircleLoader message="Loading Synthetics Monitor Data" />;
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
          <SynthAccountTable
            data={filteredData}
            columns={this.tableColHeader}
          />
        )}
      </FilterTableData>
    );
  }
}
