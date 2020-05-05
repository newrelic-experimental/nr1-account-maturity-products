import React from 'react';
import PropTypes from 'prop-types';
import { OverviewTable } from './OverviewTable';
import { FilterTableData } from '../../utils/FilterTableData';
import { createTableData } from './process-overview-score';

import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
  MaturityScoreCtxConsumer
} from '../../contexts/';

export const OverviewPanel = () => (
  <ApplicationCtxConsumer>
    {appContext => {
      if (appContext.loading) {
        return <CustomCircleLoader message="Fetching accounts" />;
      }

      return (
        <MaturityScoreCtxConsumer>
          {({ maturityScores }) => (
            <OverviewPanelTag
              appContext={appContext}
              maturityScores={maturityScores}
            />
          )}
        </MaturityScoreCtxConsumer>
      );
    }}
  </ApplicationCtxConsumer>
);

export class OverviewPanelTag extends React.Component {
  static propTypes = {
    appContext: PropTypes.object,
    maturityScores: PropTypes.object,
    summaryHeader: PropTypes.array,
    createTableData: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.createTableData = this.props.createTableData || createTableData;
    this.summaryHeader = this.props.summaryHeader || null;
  }

  render() {
    const { appContext, maturityScores } = this.props;
    const { accountMap } = appContext;

    if (Object.keys(maturityScores).length === 0) {
      return <CustomCircleLoader message="Loading Overview" />;
    }
    const { tableData, scoreKeys } = this.createTableData(
      accountMap,
      maturityScores
    );
    return (
      <div id="overviewTable">
        <FilterTableData tableData={tableData} filterKeys={scoreKeys}>
          {({ filteredData, filterKeys }) => (
            <OverviewTable
              data={filteredData}
              keys={filterKeys}
              summaryHeader={this.summaryHeader}
            />
          )}
        </FilterTableData>
      </div>
    );
  }
}
