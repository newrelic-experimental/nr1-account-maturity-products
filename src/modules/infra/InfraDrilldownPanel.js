import React from 'react';
import PropTypes from 'prop-types';
import { fetchInfraDrilldownData } from './fetch-infra-drilldown-data';
import ReactTable from 'react-table-v6';
import { CreateCSVLink } from '../../utilities';

import { ApplicationCtxConsumer, CustomCircleLoader } from '../../contexts/';

// eslint-disable-next-line react/prop-types
export const InfraDrilldownPanel = ({ row, columns }) => (
  <ApplicationCtxConsumer>
    {appContext => {
      return (
        <InfraDrilldownPanelTag
          appContext={appContext}
          row={row}
          columns={columns}
        />
      );
    }}
  </ApplicationCtxConsumer>
);

export class InfraDrilldownPanelTag extends React.Component {
  static propTypes = {
    appContext: PropTypes.object,
    fetchData: PropTypes.func,
    row: PropTypes.object,
    columns: PropTypes.array
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
    this.docEventTypes = appContext.docEventTypes;
    this.infraAgentLatestVersion =
      appContext.docAgentLatestVersion.infrastructure;

    this.fetchData = this.props.fetchData || fetchInfraDrilldownData;

    this.row = this.props.row;
    this.accountId = this.row.original.accountID;

    this.InfraListCols = this.props.columns;
  }

  async componentDidMount() {
    await this.fetchData(this.ctxAcctMap, this.accountId, this.nerdGraphQuery, this.props.appContext.tag);

    const infraHostTable = this.processDrilldownHostList(
      this.accountId,
      this.ctxAcctMap,
      this.docEventTypes
    );

    this.setState({
      table: infraHostTable,
      loading: false
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.appContext.tag !== this.props.appContext.tag) {
      this.setState({loading: true});
      await this.fetchData(this.ctxAcctMap, this.accountId, this.nerdGraphQuery, this.props.appContext.tag);

      const infraHostTable = this.processDrilldownHostList(
        this.accountId,
        this.ctxAcctMap,
        this.docEventTypes
      );

      this.setState({
        table: infraHostTable,
        loading: false
      });
    }
  }

  processDrilldownHostList(accountId, ctxAcctMap, docEventTypes) {
    const hostMap = ctxAcctMap.get(accountId).infraHosts;

    const systemSampleKeyset = ctxAcctMap.get(accountId).systemSampleKeyset;

    const systemSampleDefaultList = docEventTypes.SystemSample
      ? docEventTypes.SystemSample.attributes.map(attribute => attribute.name)
      : 0;

    const infraHostTable = [];

    for (const host of hostMap.values()) {
      // Grab Keyset for current host
      const hostSystemSampleKeyset = systemSampleKeyset.find(keyset => {
        return keyset.entityName.toLowerCase() === host.name.toLowerCase();
      });

      // Checks if the keyset attributes exist in the default list and returns the ones that are not
      const customAttributes = hostSystemSampleKeyset
        ? hostSystemSampleKeyset.allKeys.filter(key => {
            if (key.startsWith('nr.')) {
              return false;
            }
            return !systemSampleDefaultList.includes(key);
          })
        : [];

      // using length for now may include array later for troubleshooting
      host.customAttributes = customAttributes.length > 0;
      host.infrastructureLatestAgentValue = this.infraAgentLatestVersion;
      infraHostTable.push(host);
    }

    return infraHostTable;
  }

  render() {
    if (this.state.loading) {
      return <CustomCircleLoader message="Loading Infra Host Data" />;
    }

    return (
      <div>
        <ReactTable style={{height: '600px'}} data={this.state.table} columns={this.InfraListCols} />
        {CreateCSVLink(this.InfraListCols, this.state.table)}
      </div>
    );
  }
}
