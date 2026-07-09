const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Personal Apple developer accounts cannot use Push Notifications.
 * Live Activities and local notifications work without aps-environment.
 */
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
