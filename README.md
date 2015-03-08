# Created: February 2015
# Author: Martijn van der Veen

Playground for reactivity experiments using Meteor javascript
framework.

    * A live copy should be running at hellomartijn.meteor.com
    * Source code is available at https://github.com/turiphro/playground\_reactivity
    * Author: Martijn van der Veen (http://turiphro.nl)

Meteor commands
===============

# create new app
meteor create <appname> && cd <appname>

# start local meteor webserver
meteor [--port <port>]

# look inside mongodb
meteor mongo

# clear mongodb, reset project (careful!)
meteor reset

# turn off autopublish (turn on right management)
meteor remove autopublish

# deploy to meteor subdomain
meteor deploy SUBDOMAIN.meteor.com

# deploy to heroku
heroku create --buildpack https://github.com/jordansissel/heroku-buildpack-meteor.git
heroku addons:add mongolab:sandbox
heroku config:add MONGO_URL=<insert_value_of_MONGOLAB_URI_here>
heroku config:add ROOT_URL=<insert_url_created_above_here>
git push heroku


Structure
=========
All js files are concatenated, location doesn't matter.
Also all html not in <template> tags is merged.

Suggested structure:
client/         special: code only added for client side;
                include all client-side views and code here,
                like:
                client/stylesheets/
                client/views/<subdirs>/
server/         special: code only added for server side
collections/    mongodb-based code (on server, this is a
                mongodb connection; on client, this is a
                locally synced minimal MiniMongo version)
public/         static assets


Packages
========
name          default   usage
------------- --------- -----------------------------------
autopublish   yes       auto read access: auto publish and
                        subscribe everything
insecure      yes       auto write access for everything
iron:router   no        routing + filtering Router.route()
multiply:iron-router-progress
              no        nice thin loading bar on top
accounts-{password,google,facebook,twitter} and
twbs:bootstrap
              no        bootstrap
ian:accounts-ui-bootstrap-3
              no        accounts dropdown {{loginButtons}}
mrt:publish-with-relations
              no        publish linked collections together


Notes
=====

Sync:
Automagic syncing happens for `published` tables (service
from the server) for which one or multiple apps `subcribe`.
(Package `autopublish` publishes and subcribes everything
automatically.) -> only published stuff is cached and thus
available on the client. This replaces the need for any
API's.
One can also subscribe for particular templates only with
optional filter parameters, introducing an unavoidable
initial page load syncing delay.
Multiple publish-subscription channels for the same table
are allowed: they will simply get merged on the client.

Hot Code Reload (HCR):
Some data is `reactive`: functions will be re-evaluated
and the interface is being updated automatically after
reactive data changes, without any explicit reload functions.
This only works for the right (reactive) data - e.g.
published/subscribed or Session data - inside reactive
contexts - e.g., `template helpers` or code inside an `autorun`
block (Deps.autorun(fn)). In these cases, Meteor will wire up
observe() callbacks for cursor changes (added, changed,
removed; imperative): dependent `computations` (function)
are re-evaluated, possibly triggering an interface update;
meanwhile, we can write intuitive declarative templates.
Due to these redrawings, it's wise to keep templates small.

Sessions persist for a page only until manual refresh (but
HCR preserves Session). Use Session.get/set for variables
that should persist on hot code reloads; store sharable
state info in the url.

API-like calls (client executing server function) can be
implemented using Meteor.methods({foo: fn}) on server and
Meteor.call('foo', args) on client. Note: this circumvents
any security settings for publish-subscribe channels, but
allows for trusted server-side security checks.
**Methods** are executed on both server and client though, for
`latency compensation`: the client simulates the expected
server change to update the interface instantaneously, and
compares with the server's return for final updates.
For simple queries the **local** {collection}.[insert/update/
remove] plus rights work fine: they will run locally and
sync with server; for complex queries (e.g., security
sensitive, time-stamping, heavy aggregation -> server has
access to _all_ data) it's better to use custom Methods.


Resources
---------
https://www.discovermeteor.com
https://www.discovermeteor.com/blog/meteor-and-security/
http://thechangelog.com/why-meteor/
http://blog.modulus.io/top-10-reasons-to-use-node/
http://www.sitepoint.com/7-reasons-develop-next-web-app-meteor/


Qs
==

- publishing: what about large datasets with heavily filtered
  views (e.g. design view which can show any design)? How does
  the trade-off between fast response and large client storage
  work? When to do parametrised publishing (initial load-delay)?
  Also related to denormalisation and database structure (e.g.,
  separate tables are / no embedding is more efficient in Meteor).
- Methods (server-side, explicit security checks, manual
  definition) vs local collection calls (client-side, simple
  security setup, no manual functions) trade-off.

