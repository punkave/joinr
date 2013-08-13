var joinr = require('../index.js');
var assert = require("assert");
var extend = require('extend');
var _ = require('underscore');

// Test data. We don't need actual Mongo to thoroughly test this, we
// just need Mongo-like data and getters for it
var places = [
  {
    _id: 'south-street'
  },
  {
    _id: 'two-street'
  },
  {
    _id: 'punk-avenue'
  },
  {
    _id: 'broad-street'
  }
];

var events = [
  {
    _id: 'mummers-strut',
    placeId: 'broad-street'
  },
  {
    _id: 'mummers-afterparty',
    placeId: 'two-street'
  },
  {
    _id: 'broad-street-run',
    placeId: 'broad-street'
  },
  {
    _id: 'junto',
    placeId: 'punk-avenue'
  }
];

var groups = [
  {
    _id: 'admins'
  },
  {
    _id: 'marketing'
  },
  {
    _id: 'editors'
  }
];

var users = [
  {
    _id: 'jane',
    groupIds: [ 'admins' ]
  },
  {
    _id: 'joe',
    groupIds: [ 'marketing', 'editors' ]
  },
  {
    _id: 'jack',
    groupIds: [ 'editors' ]
  },
  {
    _id: 'jherek'
  }
];

var dotNotationUsers = [
  {
    _id: 'jane',
    settings: {
      groupIds: [ 'admins' ]
    }
  },
  {
    _id: 'joe',
    settings: {
      groupIds: [ 'marketing', 'editors' ]
    }
  },
  {
    _id: 'jack',
    settings: {
      groupIds: [ 'editors' ]
    }
  },
  {
    _id: 'jherek',
    settings: {
    }
  }
];

describe('joinr', function() {
  describe('byOne()', function() {
    var testEvents = [];
    // Copy the test data so we don't permanently modify it
    extend(true, testEvents, events);
    it('replies without error', function(callback) {
      return joinr.byOne(testEvents, 'placeId', '_place', function(ids, callback) {
        return setImmediate(function() {
          return callback(null, _.filter(places, function(place) {
            return _.contains(ids, place._id);
          }));
        });
      }, function(err) {
        assert(!err);
        return callback(null);
      });
    });
    it('returns the correct places for events', function() {
      var mummersStrut = _.find(testEvents, function(event) {
        return event._id === 'mummers-strut';
      });
      assert(mummersStrut);
      assert(mummersStrut._place._id === 'broad-street');
    });
  });
  describe('byOneReverse()', function() {
    var testPlaces = [];
    // Copy the test data so we don't permanently modify it
    extend(true, testPlaces, places);
    it('replies without error', function(callback) {
      return joinr.byOneReverse(testPlaces, 'placeId', '_events', function(ids, callback) {
        return setImmediate(function() {
          return callback(null, _.filter(events, function(event) {
            return _.contains(ids, event.placeId);
          }));
        });
      }, function(err) {
        assert(!err);
        return callback(null);
      });
    });
    it('returns the correct events for places', function() {
      var broadStreet = _.find(testPlaces, function(place) {
        return place._id === 'broad-street';
      });
      assert(broadStreet);
      assert(broadStreet._events);
      assert(broadStreet._events.length === 2);
      assert(_.find(broadStreet._events, function(event) {
        return event._id === 'broad-street-run';
      }));
      assert(_.find(broadStreet._events, function(event) {
        return event._id === 'mummers-strut';
      }));
    });
  });
  describe('byArray()', function() {
    var testUsers = [];
    // Copy the test data so we don't permanently modify it
    extend(true, testUsers, users);
    it('replies without error', function(callback) {
      return joinr.byArray(testUsers, 'groupIds', '_groups', function(ids, callback) {
        return setImmediate(function() {
          return callback(null, _.filter(groups, function(group) {
            return _.contains(ids, group._id);
          }));
        });
      }, function(err) {
        assert(!err);
        return callback(null);
      });
    });
    it('returns the correct groups for users', function() {
      var joe = _.find(testUsers, function(user) {
        return user._id === 'joe';
      });
      assert(joe);
      assert(joe._groups);
      assert(joe._groups.length === 2);
      assert(_.find(joe._groups, function(group) {
        return group._id === 'marketing';
      }));
      assert(_.find(joe._groups, function(group) {
        return group._id === 'editors';
      }));
    });
  });
  describe('byArrayReverse()', function() {
    var testGroups = [];
    // Copy the test data so we don't permanently modify it
    extend(true, testGroups, groups);
    it('replies without error', function(callback) {
      return joinr.byArrayReverse(testGroups, 'groupIds', '_users', function(ids, callback) {
        return setImmediate(function() {
          return callback(null, _.filter(users, function(user) {
            return !!_.intersection(user.groupIds, ids).length;
          }));
        });
      }, function(err) {
        assert(!err);
        return callback(null);
      });
    });
    it('returns the correct users for groups', function() {
      var editors = _.find(testGroups, function(group) {
        return group._id === 'editors';
      });
      assert(editors);
      assert(editors._users);
      assert(editors._users.length === 2);
      assert(_.find(editors._users, function(user) {
        return user._id === 'joe';
      }));
      assert(_.find(editors._users, function(user) {
        return user._id === 'jack';
      }));
    });
  });
  describe('byArrayReverse() with dot notation', function() {
    var testGroups = [];
    // Copy the test data so we don't permanently modify it
    extend(true, testGroups, groups);
    it('replies without error', function(callback) {
      return joinr.byArrayReverse(testGroups, 'settings.groupIds', '_users', function(ids, callback) {
        return setImmediate(function() {
          return callback(null, _.filter(dotNotationUsers, function(user) {
            return !!_.intersection(user.settings.groupIds, ids).length;
          }));
        });
      }, function(err) {
        assert(!err);
        return callback(null);
      });
    });
    it('returns the correct users for groups', function() {
      var editors = _.find(testGroups, function(group) {
        return group._id === 'editors';
      });
      assert(editors);
      assert(editors._users);
      assert(editors._users.length === 2);
      assert(_.find(editors._users, function(user) {
        return user._id === 'joe';
      }));
      assert(_.find(editors._users, function(user) {
        return user._id === 'jack';
      }));
    });
  });
});
