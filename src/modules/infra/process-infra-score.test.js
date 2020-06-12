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
    const host = [
      { allKeys: ['blah'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] }
    ];

    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 0);
    done();
  });

  it('should compute per instance value  == 8%', done => {
    const host = [
      { allKeys: ['label.1'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] }
    ];

    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 8);
    done();
  });
  it('should compute per instance value  == 25%', done => {
    const host = [
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['blah'] }
    ];

    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 25);
    done();
  });
  it('should compute per instance value  == 33%', done => {
    let host = [
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['label.1'] }
    ];

    let value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 33);

    host = [
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] }
    ];

    value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 33);
    host = [
      { allKeys: ['label.1', 'label.1', 'label.1', 'label.1', 'label.1'] },
      { allKeys: ['blah'] },
      { allKeys: ['blah'] }
    ];

    value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
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

    let value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 50);

    host = [
      { allKeys: ['label.1', 'label.1', 'label.1', 'label.1'] },
      { allKeys: ['blah'] }
    ];

    value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 50);

    host = [
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1'] },
      { allKeys: ['label.1'] },
      { allKeys: ['blah'] }
    ];
    // total pts: 15pts + 10pts + 5pts + 0pts = 30 pts
    // average pts: 30pts / 4 instances = 7.5 pts avg
    // overall percentage : 7.5 /15 * 100 = 50%

    value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 50);


    done();
  });
  it('should compute per instance value  == 100%', done => {
    const host = [
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1', 'label.1'] },
      { allKeys: ['label.1', 'label.1', 'label.1'] }
    ];

    const value = TEST_PROCESS_INFRA_SCORE.computeDockerLabelCount(host);
    assert.equal(value, 100);
    done();
  });
});
