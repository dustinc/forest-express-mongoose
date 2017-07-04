'use strict';
var P = require('bluebird');
var Interface = require('forest-express');
var utils = require('./utils/schema');
var mongooseUtils = require('./services/mongoose-utils');
var REGEX_VERSION = /(\d+\.)?(\d+\.)?(\*|\d+)/;

exports.collection = Interface.collection;
exports.ensureAuthenticated = Interface.ensureAuthenticated;
exports.StatSerializer = Interface.StatSerializer;
exports.ResourceSerializer = Interface.ResourceSerializer;

exports.init = function(opts) {
  exports.opts = opts;

  exports.getLianaName = function () {
    return 'forest-express-mongoose';
  };

  exports.getLianaVersion = function () {
    var lianaVersion = require('./package.json').version.match(REGEX_VERSION);
    if (lianaVersion && lianaVersion[0]) {
      return lianaVersion[0];
    }
  };

  exports.getOrmVersion = function () {
    var ormVersion = opts.mongoose.version.match(REGEX_VERSION);
    if (ormVersion && ormVersion[0]) {
      return ormVersion[0];
    }
  };

  exports.getDatabaseType = function () {
    return 'MongoDB';
  };

  exports.SchemaAdapter = require('./adapters/mongoose');

  exports.getModels = function () {
    return mongooseUtils.getModels(opts);
  };

  exports.getModelName = utils.getModelName;

  exports.ResourcesGetter = require('./services/resources-getter');
  exports.ResourceGetter = require('./services/resource-getter');
  exports.ResourceCreator = require('./services/resource-creator');
  exports.ResourceUpdater = require('./services/resource-updater');
  exports.ResourceRemover = require('./services/resource-remover');

  exports.HasManyGetter = require('./services/has-many-getter');
  exports.HasManyAssociator = require('./services/has-many-associator');
  exports.HasManyDissociator = require('./services/has-many-dissociator');
  exports.BelongsToUpdater = require('./services/belongs-to-updater');

  exports.ValueStatGetter = require('./services/value-stat-getter');
  exports.PieStatGetter = require('./services/pie-stat-getter');
  exports.LineStatGetter = require('./services/line-stat-getter');

  exports.Stripe = {
    getCustomer: function (customerModel, customerField, customerId) {
      return new P(function (resolve, reject) {
        if (customerId) {
          return customerModel
            .findById(customerId)
            .lean()
            .exec(function (err, customer) {
              if (err) { return reject(err); }
              if (!customer || !customer[customerField]) { return reject(); }

              resolve(customer);
            });
        } else {
          resolve();
        }
      });
    },
    getCustomerByUserField: function (customerModel, customerField, userField) {
      return new P(function (resolve, reject) {
        if (!customerModel) { return resolve(null); }

        var query = {};
        query[customerField] = userField;

        customerModel
          .findOne(query)
          .lean()
          .exec(function (err, customer) {
            if (err) { return reject(err); }
            resolve(customer);
          });
      });
    }
  };

  exports.Intercom = {
    getCustomer: function (userModel, customerId) {
      return new P(function (resolve, reject) {
        if (customerId) {
          return userModel
          .findById(customerId)
          .lean()
          .exec(function (err, customer) {
            if (err) { return reject(err); }
            if (!customer) { return reject(); }
            resolve(customer);
          });
        } else {
          resolve();
        }
      });
    }
  };

  return Interface.init(exports);
};
