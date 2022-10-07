import React from 'react';
import PropTypes from 'prop-types';

export class FilterTableData extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    tableData: PropTypes.array,
    filterKeys: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      hideNoData: true
    };

    this._handleCheckboxChange = this._handleCheckboxChange.bind(this);
  }

  _handleCheckboxChange(event) {
    this.setState({
      hideNoData: event.target.checked
    });
  }

  _filterNoData(tableData, filterKeys) {
    if (!this.state.hideNoData) {
      return tableData;
    }
    const filteredTable = tableData.filter(cols => {
      let isReporting = false;
      filterKeys.forEach(scoreKey => {
        isReporting = cols[scoreKey] > 0 || isReporting;
      });
      return isReporting;
    });
    return filteredTable;
  }

  render() {
    const { tableData, filterKeys } = this.props;
    const filteredData = this._filterNoData(tableData, filterKeys);
    return (
      <div>
        <div>
          {this.props.children({ filteredData, tableData, filterKeys })}
        </div>

        <div>
          Hide No Data
          <input
            name="hideNoData"
            type="checkbox"
            checked={this.state.hideNoData}
            onChange={this._handleCheckboxChange}
          />
        </div>
      </div>
    );
  }
}
