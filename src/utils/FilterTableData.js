import React from 'react';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';

export class FilterTableData extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    tableData: PropTypes.array,
    filterKeys: PropTypes.array,
    hasErrors: PropTypes.bool,
    contactInfo: PropTypes.string
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

  renderModal(openPopup, contactInfo) {
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
            <b>Warning:</b> Some API errors happened while retrieving your
            metrics. It may have been due to server timeouts, and so scores may
            be inaccurate. Please try refreshing your browser to gather data
            again, hopefully without issue this time.
            <br />
            <br />
            If issues persist, please reach out to {contactInfo}.
          </div>
        </Popup>
      );
    }
  }

  render() {
    const { tableData, filterKeys, contactInfo } = this.props;
    const filteredData = this._filterNoData(tableData, filterKeys);

    return (
      <div>
        <div>
          {this.renderModal(this.state.openPopup, contactInfo)}
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
