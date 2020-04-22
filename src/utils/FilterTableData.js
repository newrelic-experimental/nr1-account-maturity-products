import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';

export class FilterTableData extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    tableData: PropTypes.array,
    filterKeys: PropTypes.array,
    hasErrors: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      hideNoData: true,
      openPopup: false
    };

    this._handleCheckboxChange = this._handleCheckboxChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderModal = this.renderModal.bind(this);
  }

  componentDidMount() {
    this.setState({ openPopup: this.props.hasErrors });
  }

  closeModal() {
    this.setState({ openPopup: false });
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

  renderModal(openPopup) {
    if (openPopup) {
      return (
        <Popup open={openPopup} closeOnDocumentClick onClose={this.closeModal}>
          <div style={{ fontSize: '14px' }}>
            <a
              style={{
                position: 'absolute',
                display: 'block',
                padding: '2px 5px',
                right: '-10px',
                top: '-10px',
                opacity: '0.5',
                fontSize: '24px',
                borderRadius: '18px',
                border: '1px solid #cfcece',
                background: '#fff',
                lineHeight: '20px'
              }}
              onClick={this.closeModal}
            >
              &times;
            </a>
            <b>Warning:</b> Some errors happened while retrieving your metrics. Scores may be inaccurate. Please try again.
          </div>
        </Popup>
      );
    }
  }

  render() {
    const { tableData, filterKeys } = this.props;
    const filteredData = this._filterNoData(tableData, filterKeys);

    return (
      <div>
        <div>
          {this.renderModal(this.state.openPopup)}
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
