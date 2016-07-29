/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , util = require('util');


/**
 * `Strategy` constructor.
 *
 * The endo-passthru authentication strategy passes thru the meshblu uuid and token.
 *
 * Applications must supply a `verify` callback which accepts `uuid` and
 * `token` credentials, and then calls the `done` callback supplying a
 * `user`, which should be set to `false` if the credentials are not valid.
 * If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new EndoPassthruStrategy(
 *       function(uuid, token, done) {
 *         meshbluHttp.whoami({ uuid: uuid, token: token }, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) { throw new TypeError('EndoPassthruStrategy requires a verify callback'); }

  passport.Strategy.call(this);
  this.name = 'endo-passthru';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on req.meshbluAuth.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  options = options || {};

  if (req && req.query && !req.query.code) {
    return this.redirect('/auth/api/callback?code=ok');
  }

  var uuid, token;
  if (req && req.meshbluAuth) {
    uuid = req.meshbluAuth.uuid;
    token = req.meshbluAuth.token;
  }

  if (!uuid || !token) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  try {
    if (self._passReqToCallback) {
      this._verify(req, uuid, token, verified);
    } else {
      this._verify(uuid, token, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
