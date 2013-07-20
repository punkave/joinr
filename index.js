var _ = require('underscore');

module.exports = {
  // Perform a one-to-one join with related documents.
  //
  // If you have events and wish to bring a place object into a ._place property
  // of each event based on a .placeId property, this is what you want.
  //
  // The first argument should be an array of documents already fetched.
  //
  // The second argument is the property in each of those documents that identifies
  // a related document (for instance, placeId).
  //
  // The third argument is the property name in which to store the related
  // document after fetching it (for instance, _place).
  //
  // The fourth argument is the function to call to fetch the related documents.
  // This function will receive an array of IDs and a callback.
  //
  // The fifth argument is the callback, which will receive an error if any.
  // The related documents will be attached directly to `items` under the
  // property name `objectField`, so there is no need to return values.
  //
  // Example:
  //
  // joinr.oneToOne(items, 'placeId', '_place', function(ids, callback) {
  //   return myCollection.find({ _id: { $in: ids } }, callback);
  // }, callback);

  byOne: function(items, idField, objectField, getter, callback) {
    var otherIds = [];
    var othersById = {};
    _.each(items, function(item) {
      if (item[idField]) {
        otherIds.push(item[idField]);
      }
    });
    if (otherIds.length) {
      return getter(otherIds, function(err, others) {
        if (err) {
          return callback(err);
        }
        // Make a lookup table of the others by id
        _.each(others, function(other) {
          othersById[other._id] = other;
        });
        // Attach the others to the items
        _.each(items, function(item) {
          var id = item[idField];
          if (id && othersById[id]) {
            item[objectField] = othersById[id];
          }
        });
        return callback(null);
      });
    } else {
      return callback(null);
    }
  },

  // Join with related documents where the id of documents in your collection
  // is stored in a property on the related side. Since more than one related
  // document might refer to each of your documents, the result is stored in
  // an array property of each document.
  //
  // If you have places and wish to retrieve all the events which have a
  // placeId property referring to those places, this is what you want.
  //
  // The first argument should be an array of documents already fetched.
  //
  // The second argument is the property in each of the related documents
  // that identifies documents in your original collection (for instance, placeId).
  //
  // The third argument is the array property name in which to store the related
  // documents after fetching them (for instance, _events).
  //
  // The fourth argument is the function to call to fetch the related documents.
  // This function will receive an array of IDs and a callback. These IDs refer
  // to documents in your original collection.
  //
  // The fifth argument is the callback, which will receive an error if any.
  // The related documents will be attached directly to `items` under the
  // property name `objectField`, so there is no need to return values.
  //
  // Example:
  //
  // joinr.byOneReverse(items, 'placeId', '_place', function(ids, callback) {
  //   return myCollection.find({ placeId: { $in: ids } }, callback);
  // }, callback);

  byOneReverse: function(items, idField, objectsField, getter, callback) {
    var itemIds = _.pluck(items, '_id');
    if (itemIds.length) {
      return getter(itemIds, function(err, others) {
        if (err) {
          return callback(err);
        }

        var itemsById = {};
        _.each(items, function (item) {
          itemsById[item._id] = item;
        });
        // Attach the others to the items
        _.each(others, function(other) {
          if (other[idField]) {
            var id = other[idField];
            if (itemsById[id]) {
              var item = itemsById[id];
              if (!item[objectsField]) {
                item[objectsField] = [];
              }
              item[objectsField].push(other);
            }
          }
        });
        return callback(null);
      });
    } else {
      return callback(null);
    }
  },

  // Perform a one-to-many join with related documents via an array property
  // of your documents.
  //
  // If you have users and wish to bring all associated groups into a
  // ._groups property based on a .groupIds array property, this is what
  // you want.
  //
  // The first argument should be an array of documents already fetched.
  //
  // The second argument is the array property in each of those documents that
  // identifies related documents (for instance, groupIds).
  //
  // The third argument is the array property name in which to store the related
  // documents after fetching them (for instance, _groups).
  //
  // The fourth argument is the function to call to fetch the related documents.
  // This function will receive an array of IDs and a callback.
  //
  // The fifth argument is the callback, which will receive an error if any.
  // The related documents will be attached directly to the items under the
  // property name specified by objectsField, so there is no need to return values.
  //
  // The callback receives an error object if any.
  //
  // Example:
  //
  // joinr.byArray(users, 'groupIds', '_groups', function(ids, callback) {
  //   return groupsCollection.find({ groupIds: { $in: ids } }, callback);
  // }, callback);

  byArray: function(items, idsField, objectsField, getter, callback) {
    var otherIds = [];
    var othersById = {};
    _.each(items, function(item) {
      if (item[idsField]) {
        otherIds = otherIds.concat(item[idsField]);
      }
    });
    if (otherIds.length) {
      return getter(otherIds, function(err, others) {
        if (err) {
          return callback(err);
        }
        // Make a lookup table of the others by id
        _.each(others, function(other) {
          othersById[other._id] = other;
        });
        // Attach the others to the items
        _.each(items, function(item) {
          _.each(item[idsField] || [], function(id) {
            if (othersById[id]) {
              if (!item[objectsField]) {
                item[objectsField] = [];
              }
              item[objectsField].push(othersById[id]);
            }
          });
        });
        return callback(null);
      });
    } else {
      return callback(null);
    }
  },

  // Perform a one-to-many join with related documents via an array property
  // of the related documents.
  //
  // If you have groups and wish to bring all associated users into a
  // ._users property based on a .groupIds array property of those users,
  // this is what you want.
  //
  // The first argument should be an array of documents already fetched.
  //
  // The second argument is the array property in each of the related documents
  // that identifies documents in your original collection (for instance,
  // groupIds).
  //
  // The third argument is the array property name in which to store the related
  // documents after fetching them (for instance, _users).
  //
  // The fourth argument is the function to call to fetch the related documents.
  // This function will receive an array of IDs referring to documents in
  // your original collection, and a callback.
  //
  // The fifth argument is the callback, which will receive an error if any.
  // The related documents will be attached directly to the items under the
  // property name specified by objectsField, so there is no need to return values.
  //
  // The callback receives an error object if any.
  //
  // Example:
  //
  // joinr.byArrayReverse(groups, 'groupIds', '_users', function(ids, callback) {
  //   return usersCollection.find({ placeIds: { $in: ids } }, callback);
  // }, callback);

  byArrayReverse: function(items, idsField, objectsField, getter, callback) {
    var itemIds = _.pluck(items, '_id');
    if (itemIds.length) {
      return getter(itemIds, function(err, others) {
        if (err) {
          return callback(err);
        }

        var itemsById = {};
        _.each(items, function (item) {
          itemsById[item._id] = item;
        });
        // Attach the others to the items
        _.each(others, function(other) {
          _.each(other[idsField], function(id) {
            if (itemsById[id]) {
              var item = itemsById[id];
              if (!item[objectsField]) {
                item[objectsField] = [];
              }
              item[objectsField].push(other);
            }
          });
        });
        return callback(null);
      });
    } else {
      return callback(null);
    }
  }
};

