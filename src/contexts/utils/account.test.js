/* eslint-disable no-console */
import NerdGraphClient from '../../tests/utils/NerdGraphClient';

import { describe, it, before } from 'mocha';
import { assert } from 'chai';

import btoa from 'btoa';

import {
  createAccountMap as TEST_createAccountMap,
  createAccountMapBatch as TEST_createAccountMapBatch,
  createAccount as createAccountCore,
  getAccountDetails as TEST_getAccountDetails,
  fetchAccountDetailsByProduct as TEST_fetchAccountDetailsByProduct,
  assembleResults as TEST_assembleResults
} from './account';

import { fetchAccounts } from './fetch-account-data';

import { FETCH_ACCOUNT_WITH_ID_GQL_OBJ } from './account-gql';

/*
describe('template', function() {
  this.timeout(TIMEOUT);
  this._options = {
    debug: false
  };

  before(async () => {
    this.ng = new NerdGraphClient('<NG API-KEY>');
    this.accounts = [];
    this.mockAccounts = [
      {
        id: -1,
        subscriptions: {
          apm: {},
          browser: {},
          infrastructure: {},
          insights: {},
          synthetics: {},
          logging: {}
        }
      }
    ];
  });
  it.skip('skip async template', async () => {});
  it('async template', async () => {});
  it('sync template', done => {
    done();
  });
});
*/

const API_KEY = '<API_KEY>';
const TIMEOUT = 60000;

describe('Unit/Integration Tests for  createAccountMap', function() {
  this.timeout(TIMEOUT);
  this._options = {
    debug: false
  };

  before(async () => {
    global.btoa = btoa;

    this.NG = new NerdGraphClient(API_KEY);
    const response = await fetchAccounts(this.NG.query);
    this.accounts = response.accounts;

    this.mockAccounts = [
      {
        id: 1606862,
        subscriptions: {
          apm: {},
          browser: {},
          infrastructure: {},
          insights: {},
          synthetics: {},
          logging: {}
        }
      }
    ];
    console.log(
      `Setup:  total accounts=${this.accounts.length} total mockAccounts=${this.mockAccounts.length}`
    );
  });

  it('integration test createAccountMap()', async () => {
    const accountMap = await TEST_createAccountMap(
      this.accounts,
      [],
      json => this.NG.query(json),
      {}
    );

    assert.isNotNull(accountMap, 'account map is null');
    assert.isDefined(accountMap, 'no response');
    assert.isNotEmpty(accountMap, 'account map is empty');

    // DEBUG
    if (accountMap && this._options.debug) {
      console.log(
        'accountMap size=',
        accountMap ? accountMap.size : 'undefined'
      );

      console.log('accountMap accounts List');
      for (const acct of accountMap.values()) {
        console.log(`${JSON.stringify(acct)}\n`);
      }
    }
  });
});

describe('Unit/Integration Tests for  createAccountMapBatch', function() {
  this.timeout(TIMEOUT);
  this._options = {
    debug: false
  };

  before(async () => {
    global.btoa = btoa;

    this.NG = new NerdGraphClient(API_KEY);
    const response = await fetchAccounts(this.NG.query);
    this.accounts = response.accounts;

    this.mockAccounts = [
      {
        id: 1606862,
        subscriptions: {
          apm: {},
          browser: {},
          infrastructure: {},
          insights: {},
          synthetics: {},
          logging: {}
        }
      }
    ];
    console.log(
      `Setup:  total accounts=${this.accounts.length} total mockAccounts=${this.mockAccounts.length}`
    );
  });

  it('integration test createAccountMap()', async () => {
    const accountMap = await TEST_createAccountMapBatch(
      this.accounts,
      [],
      json => this.NG.query(json),
      {}
    );

    assert.isNotNull(accountMap, 'account map is null');
    assert.isDefined(accountMap, 'no response');
    assert.isNotEmpty(accountMap, 'account map is empty');

    // DEBUG
    if (accountMap && this._options.debug) {
      console.log(
        'accountMap size=',
        accountMap ? accountMap.size : 'undefined'
      );

      console.log('accountMap accounts List');
      for (const acct of accountMap.values()) {
        console.log(`${JSON.stringify(acct)}\n`);
      }
    }
  });
});
describe('Unit/Integration Tests for  getAccountDetails()', function() {
  this.timeout(TIMEOUT);
  this._options = {
    debug: false
  };

  before(async () => {
    this.NG = new NerdGraphClient(API_KEY);
    const response = await fetchAccounts(this.NG.query);
    // this.accounts = response.accounts.splice(0, 10);
    this.accounts = response.accounts;

    this.mockAccounts = [
      {
        id: 1606862,
        subscriptions: {
          apm: {},
          browser: {},
          infrastructure: {},
          insights: {},
          synthetics: {},
          logging: {}
        }
      }
    ];
  });

  it('test happy path', async () => {
    const account = this.accounts[0];

    const params = {
      accounts: this.accounts,
      cloudLinkedAccounts: [],
      gqlAPI: json => this.NG.query(json),
      accountMap: new Map(),
      nrqlFragment: null,
      createAccountFn: createAccountCore
    };

    const generator = TEST_getAccountDetails(
      params.accountMap,
      params.accounts,
      params.cloudLinkedAccounts,
      params.gqlAPI,
      params.nrqlFragment,
      params.createAccountFn
    );

    const result = generator.next(); // 1 sample
    const value = await result.value; // promise

    assert.isNotNull(result, 'result is null');
    assert.isNotNull(result.value, 'no value');
    assert.isNotNull(params.accountMap, 'accountMap is null');
    assert.isDefined(params.accountMap, 'accountMap not defined');
    assert.isNotEmpty(params.accountMap, 'accountMap is empty');

    const { id } = account;
    const entity = value.get(id);

    assert.isNotNull(value.get(id), `entity does not match accountid`);
    assert.isTrue(entity.id === id, `id do not match`);
  });
});

describe('Unit/Integration Tests for  fetchAccountDetailsByProduct()', function() {
  this.timeout(TIMEOUT);
  this._options = {
    debug: false
  };

  before(async () => {
    this.NG = new NerdGraphClient(API_KEY);

    const response = await fetchAccounts(this.NG.query);
    this.accounts = response.accounts.splice(0, 10);

    this.mockAccounts = [
      {
        id: 1606862,
        subscriptions: {
          apm: {},
          browser: {},
          infrastructure: {},
          insights: {},
          synthetics: {},
          logging: {}
        }
      }
    ];
    console.log(
      `Setup:  total accounts=${this.accounts.length} total mockAccounts=${this.mockAccounts.length}`
    );
  });

  it('returns Product specific data ', async () => {
    const params = {
      productLine: 'browser',
      expectedGQLKeys: ['pageActionData', 'pageViewKeyset'],
      otherKeys: ['id', 'name'],
      account: this.accounts[0],
      query: { ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery() },
      gqlAPI: json => this.NG.query(json)
    };
    const response = await TEST_fetchAccountDetailsByProduct(
      params.account,
      params.productLine,
      params.query,
      params.gqlAPI
    );
    assert.isNotNull(response, 'response is null');
    assert.isDefined(response, 'no response');

    if (this._options.debug) {
      console.log(response.data.actor.account);
    }

    assert.hasAllKeys(response, ['data', 'errors'], 'missing expected keys'); // response={ data , actor}
    assert.isDefined(response.data.actor, 'missing data.actor key not defined'); // response.data.actor
    assert.isDefined(
      response.data.actor.account,
      'data.actor.account key not defined'
    ); // response.data.actor.account

    assert.hasAllKeys(
      response.data.actor.account,
      params.expectedGQLKeys.concat(params.otherKeys),
      'missing expected BROWSER_Fragment keys'
    );
  });
});

describe('Unit/Integration Tests for  assembleResults()', function() {
  this.timeout(TIMEOUT);
  this._options = {
    debug: false
  };

  before(async () => {});

  it('test happy path', done => {
    const results = [
      {
        data: {
          actor: {
            account: {
              id: 111,
              name: 'test 111 account',
              pageActionData: { results: [] },
              pageViewKeyset: { results: [] }
            }
          }
        }
      },
      {
        data: {
          actor: {
            account: {
              id: 111,
              name: 'test 111 account',
              throughputData: { results: [] },
              transactionKeyset: { results: [] }
            }
          }
        }
      }
    ];

    const response = TEST_assembleResults(results);

    if (this._options.debug) {
      console.log(`response=${JSON.stringify(response)}`);
      console.log(response.data.actor.account);
    }

    assert.hasAllKeys(
      response.data.actor.account,
      [
        'id',
        'name',
        'pageActionData',
        'pageViewKeyset',
        'throughputData',
        'transactionKeyset'
      ],
      'missing expected keys'
    );

    done();
  });

  it('should handle response with error', done => {
    const results = [
      {
        data: {
          actor: {
            account: {
              id: 111,
              name: 'test 111 account',
              pageActionData: { results: [] },
              pageViewKeyset: { results: [] }
            }
          }
        }
      },
      {
        errors: [{}]
      }
    ];

    const response = TEST_assembleResults(results);

    if (this._options.debug) {
      console.log(`response=${JSON.stringify(response)}`);
      console.log(response.data.actor.account);
    }

    assert.hasAllKeys(
      response.data.actor.account,
      ['id', 'name', 'pageActionData', 'pageViewKeyset'],
      'missing expected keys'
    );

    done();
  });
});
