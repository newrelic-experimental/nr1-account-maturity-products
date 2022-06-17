import React from 'react';
import PropTypes from 'prop-types';
import { fetchWorkloadData, WorkloadModel } from './fetch-workload-data';
import { getWorkloadRelatedDashboardsCount } from './fetch-workload-dashboards';

import {
  createWorkloadTableData,
  computeWorkloadMaturityScore
} from './process-workload-score';
import { WorkloadTable, WorkloadSummaryCols } from './WorkloadTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';
import { FilterTableData } from '../../utilities';

export const WorkloadPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            return (
              <WorkloadPanelTag
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

export class WorkloadPanelTag extends React.Component {
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
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;

    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData = this.props.fetchData || fetchWorkloadData;
    this.createTableData =
      this.props.createTableData || createWorkloadTableData;
    this.computeMaturityScore =
      this.props.computeMaturityScore || computeWorkloadMaturityScore;

    this.scoreWeights = this.props.scoreWeights || WorkloadModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || WorkloadSummaryCols;
  }

  async componentDidMount() {
    await this.fetchData(this.ctxAcctMap, this.nerdGraphQuery);

    for (const accountId of Array.from(this.ctxAcctMap.keys())) {
      await getWorkloadRelatedDashboardsCount(
        this.ctxAcctMap,
        accountId,
        this.nerdGraphQuery
      );
    }

    const tableData = this.createTableData(this.ctxAcctMap, {});

    const scores = this.addMaturityScoreToTable(tableData);

    this.setState({
      loading: false,
      table: tableData
    });
    this.maturityCtxUpdateScore('WORKLOADS', scores, tableData);
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
      return <CustomCircleLoader message="Loading Workload Data" />;
    }

    return (
      <FilterTableData
        tableData={this.state.table}
        filterKeys={['overallScore']}
      >
        {({ filteredData }) => (
          <WorkloadTable data={filteredData} columns={this.tableColHeader} />
        )}
      </FilterTableData>
    );
  }
}
