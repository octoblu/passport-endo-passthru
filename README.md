# passport-endo-passthru
[Passport](http://passportjs.org/) strategy to pass meshblu credentials through to endos that don't want to implement auth.

## Install

    $ npm install passport-anonymous

## Usage

#### Configure Strategy

The endo-passthru authentication strategy passes authentication for a request,
with `req.user` remaining `undefined`.

    passport.use(new EndoPassthruStrategy());

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'endo-passthru'` strategy, to
pass authentication of a request.  This is typically used with Octoblu endos
for services that do not want to authenticate against a 3rd party service.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/hello',
      passport.authenticate(['endo-passthru'], { session: false }),
      function(req, res) {
        if (req.user) {
          res.json({ uuid: req.user.uuid });
        } else {
          res.json({ uuid: null });
        }
      });
