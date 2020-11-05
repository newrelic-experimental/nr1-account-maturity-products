import React from 'react';
import PropTypes from 'prop-types';
import { fetchMobileData, MobileModel } from './fetch-mobile-data';
import {
  createMobileTableData,
  computeMobileMaturityScore
} from './process-mobile-score';
import { MobileTable, MobileSummaryCols } from './MobileTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';

import { FilterTableData } from '../../utilities';

export const MobilePanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => (
            <MobilePanelTag
              appContext={appContext}
              maturityCtxUpdateScore={scoreContext.updateScore}
            />
          )}
        </MaturityScoreCtxConsumer>
      );
    }}
  </ApplicationCtxConsumer>
);

export class MobilePanelTag extends React.Component {
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
    this.docMobileLatestVersionHash = {
      android: appContext.docAgentLatestVersion.android,
      ios: appContext.docAgentLatestVersion.ios
    };

    this.docEventTypes = appContext.docEventTypes;
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;
    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData = this.props.fetchData || fetchMobileData;
    this.createTableData = this.props.createTableData || createMobileTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeMobileMaturityScore;

    this.scoreWeights = this.props.scoreWeights || MobileModel.scoreWeights;

    this.tableColHeader = this.props.tableColHeader || MobileSummaryCols;
  }

  async componentDidMount() {
    await this.fetchData(
      this.ctxAcctMap,
      this.nerdGraphQuery,
      this.props.appContext.tag
    );

    const tableData = this.createTableData(this.ctxAcctMap, {
      docMobileLatestVersionHash: this.docMobileLatestVersionHash
    });

    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData
    });
    this.maturityCtxUpdateScore('MOBILE', scores, tableData);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.appContext.tag !== this.props.appContext.tag) {
      this.setState({ loading: true }); // eslint-disable-line react/no-did-update-set-state
      await this.fetchData(
        this.ctxAcctMap,
        this.nerdGraphQuery,
        this.props.appContext.tag
      );

      const tableData = this.createTableData(this.ctxAcctMap, {
        docMobileLatestVersionHash: this.docMobileLatestVersionHash
      });

      const scores = this.addMaturityScoreToTable(tableData);

      /* eslint-disable react/no-did-update-set-state */
      this.setState({
        loading: false,
        table: tableData
      });
      /* eslint-enable react/no-did-update-set-state */
      this.maturityCtxUpdateScore('MOBILE', scores, tableData);
    }
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
      return <CustomCircleLoader message="Loading Mobile Data" />;
    }

    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
      >
        {({ filteredData }) => (
          <MobileTable data={filteredData} columns={this.tableColHeader} />
        )}
      </FilterTableData>
    );
  }
}
