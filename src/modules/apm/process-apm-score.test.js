/* eslint-disable no-console */
import { describe, it, before } from 'mocha';
import { assert } from 'chai';

import { _computeLatestAgentPercent as TEST_computeLatestAgentPercent } from './index';

describe('Unit Tests for  _computeLatestAgentPercent()', function() {
  this._options = {
    debug: false
  };

  before(() => {
    this.docAgentLatestVersion = {
      android: '2.14.0',
      browser: '1184',
      dotnet: '8.35.0.0',
      dotnet_legacy: '6.25.0.0',
      elixir: '0.0.0',
      go: '3.9.0',
      infrastructure: '1.13.1',
      ios: '3.65.0',
      java: '6.2.0',
      nodejs: '7.0.0',
      php: '9.14.0.290',
      python: '5.22.1.152',
      ruby: 'V6.13.1',
      c: '1.3.0'
    };
  });

  it('should handle apm with dotnet only', () => {
    const apmDeployedVersions = {
      dotnet: {
        versions: [
          { count: 1, version: '8.24.244.0' },
          { count: 1, version: '8.35.0.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 100, 'It should be 100%');
  });

  it('should handle apm with outdated dotnet', () => {
    const apmDeployedVersions = {
      dotnet: {
        versions: [
          { count: 1, version: '8.24.244.0' },
          { count: 1, version: '7.1.229.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 50, 'It should be 50%');
  });

  it('should handle apm with dotnet legacy', () => {
    const apmDeployedVersions = {
      dotnet: {
        versions: [
          { count: 1, version: '8.24.244.0' },
          { count: 1, version: '6.25.0.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 100, 'It should be 100%');
  });

  it('should handle apm with dotnet legacy only', () => {
    const apmDeployedVersions = {
      dotnet: {
        versions: [
          { count: 1, version: '6.23.0.0' },
          { count: 1, version: '6.26.0.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 100, 'It should be 100%');
  });

  it('should handle apm with outdated dotnet legacy', () => {
    const apmDeployedVersions = {
      dotnet: {
        versions: [
          { count: 1, version: '6.23.0.0' },
          { count: 1, version: '5.22.6.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 50, 'It should be 50%');
  });

  it('should handle apm without dotnet', () => {
    const apmDeployedVersions = {
      java: {
        versions: [
          { count: 1, version: '5.4.0' },
          { count: 1, version: '6.1.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 50, 'It should be 50%');
  });

  it('should handle apm with mixed agents', () => {
    const apmDeployedVersions = {
      java: {
        versions: [
          { count: 1, version: '5.4.0' },
          { count: 1, version: '6.1.0' }
        ]
      },
      dotnet: {
        versions: [
          { count: 1, version: '6.23.0.0' },
          { count: 1, version: '5.22.6.0' },
          { count: 1, version: '8.24.244.0' }
        ]
      }
    };

    const percent = TEST_computeLatestAgentPercent(
      apmDeployedVersions,
      this.docAgentLatestVersion
    );

    if (this._options.debug) {
      console.log(`apmDeployedVersions=${JSON.stringify(apmDeployedVersions)}`);
    }

    assert.strictEqual(percent, 60, 'It should be 60%');
  });
});
