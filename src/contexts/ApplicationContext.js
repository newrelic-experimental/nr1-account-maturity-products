/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/core';
import { CircleLoader } from 'react-spinners';
import { fetchAccounts, createAccountMap } from './utils';
import { handleGqlError } from '../utils';

const ApplicationContext = React.createContext();

export class ApplicationCtxProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    nr1graph: PropTypes.object,
    fetchAccounts: PropTypes.func,
    createAccountMap: PropTypes.func,
    name: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      accountMap: null,
      docEventTypes: null, // { "Transaction" : { attributes:[{ name:< Attribute name>, label: "<Attribute label>"}, ... ]},name:"Transaction", dataSources:["APM"] }
      docAgentLatestVersion: {} // {java:"0.0.0", ios:"0.0.0", infrastructure:"0.0.0",...}
    };

    this.nerdGraphQuery = this.nerdGraphQuery.bind(this);
    this.handleGqlError = handleGqlError;
    this._gqlJsonToString = this._gqlJsonToString.bind(this);
    this.fetchAccounts = this.props.fetchAccounts || fetchAccounts;
    this.createAccountMap = this.props.createAccountMap || createAccountMap;
    this.name = this.props.name || '';
    this.isEUDatacenter = DataCenterUtils.isEUDatacenter();
  }

  async componentDidMount() {
    const {
      accounts,
      cloudLinkedAccounts,
      docEventTypes,
      docAgentLatestVersion
    } = await this.fetchAccounts(this.nerdGraphQuery);

    // console.log('Context accounts', accounts);
    // console.log('cloudLinkedAccounts', cloudLinkedAccounts);
    // console.log(`docEventTypes=${JSON.stringify(docEventTypes)}`);
    // console.log(
    //   `docAgentLatestVersion= ${JSON.stringify(docAgentLatestVersion)}`
    // );

    const accountMap = await this.createAccountMap(
      accounts,
      cloudLinkedAccounts,
      this.nerdGraphQuery,
      {}
    );

    this.setState({
      loading: false,
      accountMap,
      docEventTypes,
      docAgentLatestVersion
    });
  }

  async nerdGraphQuery(query) {
    const fn = this.props.nr1graph;
    let response = {};
    try {
      response = await fn.query(query);

      if (response.errors && response.errors.length > 0) {
        response = this.handleGqlError({ response }, query);
      }
    } catch (error) {
      console.error(error);
      response = this.handleGqlError({ response, error }, query);
    }
    return response;
  }

  // DEPRECATED
  _gqlJsonToString(gqlJSON) {
    if (!this.nr1) {
      return gqlJSON;
    }

    try {
      if (typeof gqlJSON !== 'object') {
        throw Error('Not a JSON object');
      }
      let { query, variables } = gqlJSON;

      if (!query) {
        throw Error('Not standard GQL');
      }

      query = query.substring(query.indexOf('{'));
      for (const variable in variables) {
        const value = variables[variable];
        query = query.replace(`$${variable}`, `${JSON.stringify(value)}`);
      }
      return query;
    } catch (err) {
      console.error('Error in converting GQL JSON', err);
      return gqlJSON;
    }
  }

  render() {
    return (
      <ApplicationContext.Provider
        value={{
          name: this.name,
          isEUDatacenter: this.isEUDatacenter,
          nerdGraphQuery: this.nerdGraphQuery,
          loading: this.state.loading,
          accountMap: this.state.accountMap,
          docEventTypes: this.state.docEventTypes,
          docAgentLatestVersion: this.state.docAgentLatestVersion
        }}
      >
        {this.props.children}
      </ApplicationContext.Provider>
    );
  }
}

export const ApplicationCtxConsumer = ApplicationContext.Consumer;

export function CustomCircleLoader(props) {
  const message = props ? props.message || '' : '';

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;
  return (
    <div>
      <CircleLoader
        css={override}
        sizeUnit="px"
        size={300}
        color="#123abc"
        loading
      />
      <h1 align="center">{message}</h1>
    </div>
  );
}

CustomCircleLoader.propTypes = {
  message: PropTypes.string
};

const DataCenterUtils = {
  EUDataCenterDomainStr: '.eu.',

  isEUDatacenter(host) {
    if (!host) {
      host = window ? window.location.host : '';
    }
    return host.toLowerCase().includes(this.EUDataCenterDomainStr);
  }
};
