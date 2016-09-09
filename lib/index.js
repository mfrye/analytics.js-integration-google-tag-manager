
/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var push = require('global-queue')('dataLayer', { wrap: false });

/**
 * Expose `GTM`.
 */

var GTM = module.exports = integration('Google Tag Manager')
  //.assumesPageview()
  .global('dataLayer')
  .global('google_tag_manager')
  .option('containerId', '')
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="//www.googletagmanager.com/gtm.js?id={{ containerId }}&l=dataLayer">');

/**
 * Initialize.
 *
 * https://developers.google.com/tag-manager
 *
 * @api public
 */

GTM.prototype.initialize = function() {
  push({ 'gtm.start': Number(new Date()), event: 'gtm.js' });
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

GTM.prototype.loaded = function() {
  return !!(window.dataLayer && Array.prototype.push !== window.dataLayer.push);
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

GTM.prototype.page = function(page) {
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // all
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Track.
 *
 * https://developers.google.com/tag-manager/devguide#events
 *
 * @api public
 * @param {Track} track
 */

GTM.prototype.track = function(track) {
  var payload, dataConfig;
  var contextOpts = track.options(this.name);
  var props = track.properties();

  // Override properties from mappings
  dataConfig = contextOpts.dataConfig;
  payload = buildPayload(track.event(), props, dataConfig);

  push(payload);
};

/**
 * Build event data from config
 *
 * @api private
 * @param {Object} payload
 * @param {Object} dataConfig
 * @return {Object}
 */

function buildPayload(actionName, properties, dataConfig) {
  properties.name = actionName;

  // If there is a custom mapping set for the event, use that property
  if (dataConfig && dataConfig.event) {
    properties.event = properties[dataConfig.event];
  }
  // Otherwise use the action name
  else {
    properties.event = properties.name;
    delete properties.name;
  }

  return properties;
}
