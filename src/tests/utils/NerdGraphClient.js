/* eslint-disable no-console */
import fetch from 'node-fetch';

export default class NerdGraphClient {
  constructor(apiKey, debug = false) {
    this._apiKey = apiKey;
    this._cookie = null;
    this._gqlUrl = 'https://api.newrelic.com/graphql';

    this._headers = {
      'User-agent': 'NerdGraphClient_MochaUnitTest/0.0.1',
      'Content-type': 'application/json',
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'Cache-Control': 'no-cache'
    };

    this._options = {
      debug
    };

    this.setOptions = this.setOptions.bind(this);
    this.query = this.query.bind(this);
    this.setCookie = this.setCookie.bind(this);
    this.addHeader = this.addHeader.bind(this);
  }

  setOptions(options) {
    this._options = { ...this._options, ...options };
  }

  setAPIUrl(url) {
    this._gqlUrl = url;
  }

  setCookie(cookie) {
    this._cookie = cookie;
  }

  addHeader(header) {
    this._headers = { ...this._headers, ...header };
  }

  async query(gqlJSON) {
    const fetch_options = {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify(gqlJSON)
    };

    if (this._cookie) {
      fetch_options.headers.Cookie = this._cookie;
    }

    if (this._apiKey) {
      fetch_options.headers['API-Key'] = this._apiKey;
    }

    if (this._options.debug) {
      console.log(`NerdGraphClient url=${this._gqlUrl}`);
      console.log(
        `NerdGraphClient HEADERS=${JSON.stringify(
          fetch_options.headers,
          null,
          2
        )}`
      );
      // console.log(`NerdGraphClient gqlJSON=${JSON.stringify(gqlJSON)}`);
    }
    const response = await fetch(this._gqlUrl, fetch_options);
    const data = await response.json();

    if (response.status !== 200 && response.status !== 201) {
      console.log(`Error Response =${JSON.stringify(data)}`);
      console.error(`Error Response Status= ${response.status}.`);
      throw new Error('Fetch failed. ', data.error?.graphQLErrors[0].message);
    }

    let errors;

    if (this._options.debug) {
      console.log(`NerdGraphClient response=${JSON.stringify(response)}`);
      console.log(`NerdGraphClient data=${JSON.stringify(data)}`);
    }

    if (data.error?.graphQLErrors) {
      errors = [];
      errors.push(JSON.stringify(data.error?.graphQLErrors));

      console.log(
        `NerdGraphClient() ERROR errors:${JSON.stringify(
          data.error?.graphQLErrors
        )}`
      );
      console.log(
        `NerdGraphClient() ERROR errors stringified: ${JSON.stringify(
          data.error?.graphQLErrors
        )}`
      );
      console.log(`NerdGraphClient() ERROR gqlJSON=${JSON.stringify(gqlJSON)}`);
      console.log(
        `NerdGraphClient() ERROR gqlJSON variables=${JSON.stringify(
          gqlJSON.variables
        )}`
      );
    }

    return { ...data, errors };
  }
}
