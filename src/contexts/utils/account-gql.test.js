/* eslint-disable no-console */

import NerdGraphClient from '../../tests/utils/NerdGraphClient';
import { describe, it, before, after } from 'mocha';
import { assert } from 'chai';

import {
  FETCH_ACCOUNTS_GQL,
  CLOUD_LINKED_ACCTS_GQL,
  FETCH_ACCOUNT_WITH_ID_GQL_OBJ
} from './account-gql';

const API_KEY = '<API_KEY>';
const TIMEOUT = 60000;
describe('test FETCH_ACCOUNTS_GQL', function() {
  this.timeout(TIMEOUT);

  before(async () => {
    this._options = {
      debug: false
    };

    this.NG = new NerdGraphClient(API_KEY);
    this.account = { id: 1606862, name: 'Demotron V2' };
  });

  after(async () => {});

  it('happy path', async () => {
    let response;
    try {
      response = await this.NG.query(FETCH_ACCOUNTS_GQL);
      const { accounts } = response.data.actor;
      if (this._options.debug) {
        console.log('total accounts=', accounts.length);
      }

      if (response.errors) {
        throw new Error(response.errors);
      }
      assert.isNotNull(response, 'No response');
      assert.isDefined(response, 'no response');
    } catch (err) {
      assert.fail(err);
    }
  });
});

describe('test CLOUD_LINKED_ACCTS_GQL', function() {
  this.timeout(TIMEOUT);

  before(async () => {
    this._options = {
      debug: false
    };
    this.NG = new NerdGraphClient(API_KEY);
    this.account = { id: 1606862, name: 'Demotron V2' };
  });

  after(async () => {});

  it('happy path', async () => {
    let response;
    try {
      response = await this.NG.query(CLOUD_LINKED_ACCTS_GQL);
      const { linkedAccounts } = response.data.actor.cloud;
      if (this._options.debug) {
        console.log('total linked accounts=', linkedAccounts.length);
      }
      assert.isNotNull(response, 'No response');
      assert.isDefined(response, 'no response');
    } catch (err) {
      console.log('error=r', err);
      assert.fail(err);
    }
  });
});

describe('test FETCH_ACCOUNT_WITH_ID_GQL_OBJ', function() {
  this.timeout(TIMEOUT);

  before(async () => {
    this._options = {
      debug: false
    };

    this.NG = new NerdGraphClient(API_KEY);
    this.account = { id: 1606862, name: 'Demotron V2' };
  });

  after(async () => {});

  it('should only include enabled productline', async () => {
    const query = { ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(null) };

    assert.isFalse(
      query.variables.withFragment,
      'withFragment should be false'
    );

    query.variables = {
      ...query.variables,
      id: this.account.id,
      EVENT_TYPES_INCLUDE: false,
      PROGRAMMABILITY_SUBSCRIBED: false,
      APM_SUBSCRIBED: true,
      BROWSER_SUBSCRIBED: false,
      MOBILE_SUBSCRIBED: false,
      INFRA_SUBSCRIBED: false,
      LOGGING_SUBSCRIBED: false,
      SYNTHETICS_SUBSCRIBED: false,
      INSIGHTS_SUBSCRIBED: false
    };

    try {
      const response = await this.NG.query(query);

      const acct = response.data.actor.account;

      if (this._options.debug) {
        console.log(`account=\n`, JSON.stringify(acct));
        console.log('fetch response:\n', JSON.stringify(response));
      }

      assert.isNotNull(response, 'No response');
      assert.isDefined(response, 'no response');
      assert.hasAllKeys(
        response.data.actor.account,
        [
          'apmDeployedVersions',
          'dtData',
          'id',
          'name',
          'throughputData',
          'transactionKeyset'
        ],
        'missing expected APM keys'
      );
    } catch (err) {
      console.log('error=r', err);
      assert.fail(err);
    }
  });

  it('should allow  all productlines', async () => {
    const query = { ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(null) };
    assert.isFalse(
      query.variables.withFragment,
      'withFragment should be false'
    );
    query.variables = {
      ...query.variables,
      id: this.account.id,
      EVENT_TYPES_INCLUDE: true,
      PROGRAMMABILITY_SUBSCRIBED: true,
      APM_SUBSCRIBED: true,
      BROWSER_SUBSCRIBED: true,
      MOBILE_SUBSCRIBED: true,
      INFRA_SUBSCRIBED: true,
      LOGGING_SUBSCRIBED: true,
      SYNTHETICS_SUBSCRIBED: true,
      INSIGHTS_SUBSCRIBED: true
    };

    try {
      const response = await this.NG.query(query);

      const acct = response.data.actor.account;

      if (this._options.debug) {
        console.log(`account=\n`, JSON.stringify(acct));
        console.log('fetch response:\n', JSON.stringify(response));
      }

      assert.isNotNull(response, 'No response');
      assert.isDefined(response, 'no response');
    } catch (err) {
      console.log('error=r', err);
      assert.fail(err);
    }
  });

  it('should allow NRQL fragment', async () => {
    const fragment = `
      fragmentNRQL: nrql(query: "SELECT count(*) from Transaction since 1 hour ago", timeout: 120) {
        results
      }`;
    const query = { ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(fragment) };

    assert.isTrue(query.variables.withFragment, 'withFragment should be true');

    query.variables = {
      ...query.variables,
      id: this.account.id,
      EVENT_TYPES_INCLUDE: false,
      PROGRAMMABILITY_SUBSCRIBED: false,
      APM_SUBSCRIBED: true,
      BROWSER_SUBSCRIBED: false,
      MOBILE_SUBSCRIBED: false,
      INFRA_SUBSCRIBED: false,
      LOGGING_SUBSCRIBED: false,
      SYNTHETICS_SUBSCRIBED: false,
      INSIGHTS_SUBSCRIBED: false
    };

    try {
      const response = await this.NG.query(query);

      assert.isNotNull(response, 'No response');
      assert.isDefined(response, 'no response');

      const acct = response.data.actor.account;
      assert.hasAnyKeys(acct, ['fragmentNRQL'], 'missing fragmentNRQL');

      if (this._options.debug) {
        console.log(`account=\n`, JSON.stringify(acct));
        console.log('fetch response:\n', JSON.stringify(response));
      }
    } catch (err) {
      console.log('error=r', err);
      assert.fail(err);
    }
  });

  it('should not include NRQL fragment', async () => {
    const fragment = `
      fragmentNRQL: nrql(query: "SELECT count(*) from Transaction since 1 hour ago", timeout: 120)  @include(if: $APM_SUBSCRIBED) {
        results
      }`;
    const query = { ...FETCH_ACCOUNT_WITH_ID_GQL_OBJ.createQuery(fragment) };

    assert.isTrue(query.variables.withFragment, 'withFragment should be true');

    query.variables = {
      ...query.variables,
      id: this.account.id,
      EVENT_TYPES_INCLUDE: false,
      PROGRAMMABILITY_SUBSCRIBED: false,
      APM_SUBSCRIBED: false,
      BROWSER_SUBSCRIBED: false,
      MOBILE_SUBSCRIBED: false,
      INFRA_SUBSCRIBED: false,
      LOGGING_SUBSCRIBED: false,
      SYNTHETICS_SUBSCRIBED: false,
      INSIGHTS_SUBSCRIBED: false
    };

    try {
      const response = await this.NG.query(query);

      assert.isNotNull(response, 'No response');
      assert.isDefined(response, 'no response');

      const acct = response.data.actor.account;
      assert.doesNotHaveAnyKeys(acct, ['fragmentNRQL'], 'missing fragmentNRQL');

      if (this._options.debug) {
        console.log(`account=\n`, JSON.stringify(acct));
        console.log('fetch response:\n', JSON.stringify(response));
      }
    } catch (err) {
      console.log('error=r', err);
      assert.fail(err);
    }
  });
});
