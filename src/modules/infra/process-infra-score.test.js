import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as TEST_PROCESS_INFRA_SCORE from './process-infra-score';
import { InfraModel } from './fetch-infra-data';

describe('Unit Tests for _getIntegrations', function() {
  it('should include events that are prefixed with prefixes in the include list', async () => {
    assert.deepEqual(
      TEST_PROCESS_INFRA_SCORE._getIntegrations({
        reportingEventTypes: [
          'Control',
          'RedisEventType',
          'VarnishEventType',
          'ApplicationEvenType'
        ]
      }),
      ['RedisEventType', 'VarnishEventType', 'ApplicationEvenType']
    );

    assert.deepEqual(
      TEST_PROCESS_INFRA_SCORE._getIntegrations({
        reportingEventTypes: ['Control', 'VarnishEventType']
      }),
      ['VarnishEventType']
    );
  });

  it('should exclude events in the exclude event list', async () => {
    assert.deepEqual(
      TEST_PROCESS_INFRA_SCORE._getIntegrations({
        reportingEventTypes: [
          'ApplicationAgentContext',
          'RedisEventType',
          'VarnishEventType',
          'ApplicationEvenType'
        ]
      }),
      ['RedisEventType', 'VarnishEventType', 'ApplicationEvenType']
    );
  });

  it('should exclude events not in the include list', async () => {
    assert.deepEqual(
      TEST_PROCESS_INFRA_SCORE._getIntegrations({
        reportingEventTypes: ['Control', 'RedisEventType', 'VarnishEventType']
      }),
      ['RedisEventType', 'VarnishEventType']
    );

    assert.deepEqual(
      TEST_PROCESS_INFRA_SCORE._getIntegrations({
        reportingEventTypes: ['Control', 'VarnishEventType']
      }),
      ['VarnishEventType']
    );
  });
});

describe('Unit Tests for computeInfraMaturityScore', function() {
  it('should not include infrastructureDockerLabelsPercentage weight if value ==0', done => {
    const { scoreWeights } = InfraModel;
    const rowData = {
      infrastructureLatestAgentPercentage: 100,
      infrastructureCustomAttributesHostPercentage: 100,
      infrastructureDockerLabelsPercentage: 100,
      infrastructureCloudIntegrationEnabled: 100,
      infrastructureAWSBillingEnabled: 100,
      infrastructureUsingOHIs: 100
    };

    let overallPercentage = 0;
    // eslint-disable-next-line guard-for-in
    for (const key in scoreWeights) {
      overallPercentage += scoreWeights[key] * 100;
    }

    let result = TEST_PROCESS_INFRA_SCORE.computeInfraMaturityScore({
      rowData,
      scoreWeights
    });
    assert.equal(result.overallPercentage, overallPercentage);

    // should not include infrastructureDockerLabelsPercentage score weight
    rowData.infrastructureDockerLabelsPercentage = 0;
    result = TEST_PROCESS_INFRA_SCORE.computeInfraMaturityScore({
      rowData,
      scoreWeights
    });
    assert.equal(
      result.overallPercentage,
      overallPercentage -
        scoreWeights.infrastructureDockerLabelsPercentage * 100
    );

    done();
  });
});

describe('Unit Tests for computeDockerLabelCount', function() {
  /*
    Test Docker instances for labels
    If using Docker,
    If no labels 0 points
    if using 1 label 5 points
    if using 2 labels 10 points
    if using 3+ labels 15 points
  */
  it('should compute per instance value  == 0%', done => {
    let host = [
      { allKeys: ['blah'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] }
    ];
    host = host.filter(
      ({ allKeys }) =>
        allKeys.filter(key => key.startsWith('label.')).length > 0
    );
    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 0);
    done();
  });

  it('should compute per instance value  == 33%', done => {
    let host = [
      { allKeys: ['label.1'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] }
    ];
    host = host.filter(
      ({ allKeys }) =>
        allKeys.filter(key => key.startsWith('label.')).length > 0
    );
    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 33);
    done();
  });

  it('should compute per instance value  == 50%', done => {
    let host = [
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] }
    ];
    host = host.filter(
      ({ allKeys }) =>
        allKeys.filter(key => key.startsWith('label.')).length > 0
    );
    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 50);
    done();
  });
  it('should compute per instance value  == 100%', done => {
    let host = [
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1', 'label.1'] }
    ];
    host = host.filter(
      ({ allKeys }) =>
        allKeys.filter(key => key.startsWith('label.')).length > 0
    );
    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 100);
    done();
  });
});
