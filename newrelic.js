'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'My Application'],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  /**
   * This setting controls whether the agent reports data to New Relic.
   */
  agent_enabled: true,
  logging: {
    /**
     * Level at which to log. 'info' is recommended.
     */
    level: 'info'
  },
  /**
   * Distributed tracing is enabled by default in recent versions of the agent,
   * but we explicitly enable it here as requested.
   */
  distributed_tracing: {
    /**
     * Enables/disables distributed tracing.
     *
     * @env NEW_RELIC_DISTRIBUTED_TRACING_ENABLED
     */
    enabled: true
  },
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in lowercase.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxy-authorization',
      'request.headers.set-cookie',
      'request.headers.x-api-key',
      'request.headers.jwt',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxy-authorization',
      'response.headers.set-cookie'
    ]
  }
}
