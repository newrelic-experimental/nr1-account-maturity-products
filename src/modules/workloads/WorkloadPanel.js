import React from 'react';
import PropTypes from 'prop-types';

import {
  createWorkloadTableData,
  computeWorkloadMaturityScore
} from './process-workload-score';
import { WorkloadTable, WorkloadSummaryCols } from './WorkloadTable';
import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts';
import { FilterTableData } from '../../utils/FilterTableData';
import { WorkloadModel } from './fetch-workload-data';
import { fetchWorkloadData } from './fetch-workload-data'

import _ from 'lodash';

export const WorkloadPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching Workloads..." />;
      }
      // console.log('### SK >>> acct-maturity-products:WorkloadTag:appContext: ', appContext);
      return (
        <MaturityScoreCtxConsumer>
          {scoreContext => {
            // console.log('### SK >>> acct-maturity-products:WorkloadTag:scoreContext.updateScore: ', scoreContext.updateScore);
            return (
              <WorkloadTag
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

export class WorkloadTag extends React.Component {
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

    // console.log('### SK >>> WorkloadTag:props: ', props)
    this.nerdGraphQuery = appContext.nerdGraphQuery;
    this.ctxAcctMap = new Map(appContext.accountMap);
    this.docEventTypes = appContext.docEventTypes;
    this.maturityCtxUpdateScore = this.props.maturityCtxUpdateScore;

    this.addMaturityScoreToTable = this.addMaturityScoreToTable.bind(this);

    this.fetchData = this.props.fetchData || fetchWorkloadData

    this.createTableData = this.props.createTableData || createWorkloadTableData;
    this.computeMaturityScore = this.props.computeMaturityScore || computeWorkloadMaturityScore;

    this.scoreWeights = this.props.scoreWeights || WorkloadModel.scoreWeights;
    this.tableColHeader = this.props.tableColHeader || WorkloadSummaryCols;
  }

  async componentDidMount() {
    // console.log('### SK >>> WorkloadTag:componentDidMount():>> @@@');
    await this.fetchData(this.ctxAcctMap, this.nerdGraphQuery);
// console.log('### SK >>> WorkloadTag:componentDidMount::', this.ctxAcctMap, this.nerdGraphQuery);
// ###
    const tableData = this.createTableData(this.ctxAcctMap);
// ###
    const scores = this.addMaturityScoreToTable(tableData);
// ###
    // console.log('### SK >>> WorkloadTag:componentDidMount:>> (scores, tableData): ', scores, tableData);
    // console.log('### SK >>> WorkloadTag:componentDidMount:>> before this.setState: ', this.state);
// ###
// debugger; // WorkloadTag.componentDidMount()  ##################
// ###
// console.log('### SK >>> WorkloadTag:componentDidMount:tbefore _.cloneDeep()');
// ###
// ### 1 before this.setState()
// ###
    this.setState({
      loading: false,
      table: tableData
    });
// ###
// ### 2 after this.setState()
// ###
    console.log('### SK >>> WorkloadTag:componentDidMount:>> after this.setState: ', this.state);
    console.log('### SK >>> WorkloadTag:componentDidMount:tableData: ', tableData);
// ###
// // WorkloadTag..componentDidMount() ##################
// ###
    this.maturityCtxUpdateScore('WORKLOADS', scores, tableData);
// ###
    console.log('### SK >>> WorkloadTag:componentDidMount:##### after maturityCtxUpdateScore');
// ###
  }

  addMaturityScoreToTable(tableData) {
    const maturityScores = {};

    console.log('### SK >>> addMaturityScoreToTable', tableData)

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
    // console.log('### SK >>> WorkloadTag:render():>> @@@');
    if (this.state.loading) {
      return <CustomCircleLoader message="Loading Workloads..." />;
    }
    console.log('### SK >>> WorkloadTag:render():>> done -- this.state.loading+table: ', this.state);
    console.log('### SK >>> WorkloadTag:render():>> workload tableColHeader: ', this.tableColHeader);
    // ### 
    // ### WorkloadTag..render() ##################
    // ### 
    // debugger; // WorkloadTag..render() ##################
    
    // return (
    //   <><br/><br/><br/><br/><br/><br/><br/><h1><center>### FAKE WORKLOAD TABLE ###</center></h1></>
    // );

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
