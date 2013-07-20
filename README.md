# joinr

<a href="http://apostrophenow.org/"><img src="https://raw.github.com/punkave/joinr/master/logos/logo-box-madefor.png" align="right" /></a>

`joinr` makes it easy to fetch related documents when working with MongoDB collections, or documents in a similar database.

`joinr` allows joins to be performed via IDs stored in a regular property (`byOne`) or in an array property (`byArray`). Joins can be performed when the ID of the related document is in the document you already have (`byOne` or `byArray`) and also when the related documents contain the IDs of documents you already have (`byOneReverse` and `byArrayReverse`).

`joinr` emphasizes performance. Fetch the relevant documents first; that gives you a chance to `limit` the results. Then use `joinr` to fetch related documents with a single MongoDB query.

## Installation

    npm install joinr

Tip: we recommend `--save` so that `joinr` is automatically added to your `package.json`.

## Quick Example

    var joinr = require('joinr');

    // Fetch events, then join them with places
    eventsCollection.find({ ... }, function(err, events) {
      joinr.oneToOne(events, 'placeId', '_place', function(ids, callback) {
        return eventsCollection.find({ _id: { $in: ids } }, callback);
      }, function(err) {
        // Do something with your events now that they have their
        // related place in a ._place property
      }
    });

## Requirements

Technically, none. Typically you'll want to use it with MongoDB. `joinr` assumes that objects have an `_id` property.

## API

### joinr.byOne

Performs a one-to-one join with related documents, based on an ID stored in the documents you already have.

If you have events and wish to bring a place object into a `._place` property
of each event based on a `.placeId` property of each event, this is what you want.

The first argument should be an array of documents already fetched.

The second argument is the property in each of those documents that identifies
a related document (for instance, `placeId`).

The third argument is the property name in which to store the related
document after fetching it (for instance, `_place`).

The fourth argument is the function to call to fetch the related documents.
This function will receive an array of IDs and a callback.

The fifth argument is the callback, which will receive an error if any.
The related documents will be attached directly to `items` under the
property name `objectField`, so there is no need to return values.

#### Example

    joinr.byOne(events, 'placeId', '_place', function(ids, callback) {
      return placesCollection.find({ _id: { $in: ids } }, callback);
    }, callback);

### joinr.byOneReverse

Join with related documents where the id of documents in your collection
is stored in a property of the related documents. Since more than one related
document might refer to each of your documents, the results will be stored in
an array property of each of your documents.

If you have places and wish to retrieve all the events which have a
`placeId` property referring to those places, this is what you want.

The first argument should be an array of documents already fetched.

The second argument is the property in each of the related documents
that identifies documents in your original collection (for instance, `placeId`).

The third argument is the array property name in which to store the related
documents after fetching them (for instance, `_events`).

The fourth argument is the function to call to fetch the related documents.
This function will receive an array of IDs and a callback. These IDs refer
to documents in your original collection.

The fifth argument is the callback, which will receive an error if any.
The related documents will be attached directly to `items` under the
property name `objectField`, so there is no need to return values.

#### Example

    joinr.byOneReverse(places, 'placeId', '_place', function(ids, callback) {
      return eventsCollection.find({ placeId: { $in: ids } }, callback);
    }, callback);

### joinr.byArray

Perform a one-to-many join with related documents via an array property
of your documents.

If you have users and wish to bring all associated groups into a
`._groups` property based on a `.groupIds` array property, this is what
you want.

The first argument should be an array of documents already fetched.

The second argument is the array property in each of those documents that
identifies related documents (for instance, `groupIds`).

The third argument is the array property name in which to store the related
documents after fetching them (for instance, `_groups`).

The fourth argument is the function to call to fetch the related documents.
This function will receive an array of IDs and a callback.

The fifth argument is the callback, which will receive an error if any.
The related documents will be attached directly to the items under the
property name specified by objectsField, so there is no need to return values.

The callback receives an error object if any.

#### Example

    joinr.byArray(users, 'groupIds', '_groups', function(ids, callback) {
      return groupsCollection.find({ groupIds: { $in: ids } }, callback);
    }, callback);

### joinr.byArrayReverse

Performs a one-to-many join with related documents via an array property
of the related documents.

If you have groups and wish to bring all associated users into a
`._users` property based on a `.groupIds` array property of those users,
this is what you want.

The first argument should be an array of documents already fetched.

The second argument is the array property in each of the related documents
that identifies documents in your original collection (for instance,
`groupIds`).

The third argument is the array property name in which to store the related
documents after fetching them (for instance, `_users`).

The fourth argument is the function to call to fetch the related documents.
This function will receive an array of IDs referring to documents in
your original collection, and a callback.

The fifth argument is the callback, which will receive an error if any.
The related documents will be attached directly to the items under the
property name specified by objectsField, so there is no need to return values.

The callback receives an error, if any.

#### Example

    joinr.byArrayReverse(groups, 'groupIds', '_users', function(ids, callback) {
      return usersCollection.find({ placeIds: { $in: ids } }, callback);
    }, callback);

## About P'unk Avenue and Apostrophe

`joinr` was created at [P'unk Avenue](http://punkave.com) for use in Apostrophe, an open-source content management system built on node.js. If you like `joinr` you should definitely [check out apostrophenow.org](http://apostrophenow.org). Also be sure to visit us on [github](http://github.com/punkave).

## Support

Feel free to open issues on [github](http://github.com/punkave/joinr).

<a href="http://punkave.com/"><img src="https://raw.github.com/punkave/joinr/master/logos/logo-box-builtby.png" /></a>

