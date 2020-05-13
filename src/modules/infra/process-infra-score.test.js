import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as TEST_PROCESS_INFRA_SCORE from './process-infra-score';

describe('Unit Tests for process-infra-score', function() {
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
