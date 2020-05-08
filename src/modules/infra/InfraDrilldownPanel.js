import React from 'react';
import PropTypes from 'prop-types';
import {fetchInfraDrilldownData} from './fetch-infra-drilldown-data'
import ReactTable from 'react-table-v6';
import semver from 'semver';
import { cellRenderer, CreateCSVLink } from '../../utilities';

import {
  ApplicationCtxConsumer,
  CustomCircleLoader,
} from '../../contexts/';

export const InfraDrilldownPanel = (row) => (
  <ApplicationCtxConsumer>
    {appContext => {
      return (
              <InfraDrilldownPanelTag
                appContext={appContext} fetchData = {fetchInfraDrilldownData} row = {row}
              />

      );
    }}
  </ApplicationCtxConsumer>
);

export class InfraDrilldownPanelTag extends React.Component {
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
    this.docEventTypes = appContext.docEventTypes;
    this.infraAgentLatestVersion = appContext.docAgentLatestVersion.infrastructure;

    this.fetchData = this.props.fetchData;

    this.tableColHeader = this.props.tableColHeader;
    this.row = this.props.row.row
    this.accountId = this.row.original.accountID

    this.InfraListCols = [
      {
        Header: 'Recent Account Host Info',
        columns: [
          { Header: 'Host Name', accessor: 'name' },
          { Header: 'Agent Version', accessor: 'maxVersion',Cell: row => versionCellRender(row,this.infraAgentLatestVersion) },
          //{ Header: 'Health Status', accessor: 'healthStatus' },
          { Header: 'Custom Attributes', accessor: 'customAttributes', Cell: row => cellRenderer(row) },
        ]
      }
    ];
  }

  async componentDidMount() {
    console.time('fetchInfraDrilldownData');
    await this.fetchData(this.ctxAcctMap, this.accountId, this.nerdGraphQuery);
    console.timeEnd('fetchInfraDrilldownData');
    this.setState({
      loading: false,
    });
  }

  render() {
    const systemSampleDefaultList = this.docEventTypes.SystemSample
    ? this.docEventTypes.SystemSample.attributes.map(attribute => attribute.name)
    : 0;

    const hostMap = this.ctxAcctMap.get(this.accountId)["infraHosts"]
    const systemSampleKeyset = this.ctxAcctMap.get(this.accountId)["systemSampleKeyset"]
    
    
    if (this.state.loading) {
      return <CustomCircleLoader message="Loading Infra Host Data" />;
    }

    let infraHostTable = []
    for (const host of hostMap.values()) {
      //Grab Keyset for current host
      const hostSystemSampleKeyset = systemSampleKeyset.find(
        (keyset) => {
          return keyset.entityName.toLowerCase() ==  host.name.toLowerCase()
        })
      
      //Checks if the keyset attributes exist in the default list and returns the ones that are not
      const customAttributes = 
        hostSystemSampleKeyset ? 
        hostSystemSampleKeyset['allKeys'].filter(key => {
          if (key.startsWith('nr.')){
            return false
          }
          return !systemSampleDefaultList.includes(key)
        }) 
        : []

      //using length for now may include array later for troubleshooting
      host.customAttributes = customAttributes.length > 0
      
      infraHostTable.push(host)
    }

    return (
        <div>
          <ReactTable data={infraHostTable} columns={this.InfraListCols} />
          {CreateCSVLink(this.InfraListCols, infraHostTable)}
        </div>
    );
  }
}

function versionCellRender(row, latestVersion) {
  const { value } = row;
  const agentVer = semver.clean(value);
  const isLatestVersion = semver.satisfies(
    agentVer,
    `${semver.major(latestVersion)}.${semver.minor(latestVersion)}.x`
  );
  return (
    <div
      style={{
        backgroundColor: isLatestVersion === true ? '#85cc00' : '#ff7878'
      }}
    >
      {String(value)}
    </div>
  );
}