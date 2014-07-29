'use strict';

var builder    = require('ltx')
  , crypto     = require('crypto')
  , Base     = require('xmpp-ftw/lib/base')

var VCard = function() {}

VCard.prototype = new Base()

VCard.prototype._events = {}

VCard.prototype.handles = function(stanza) {
    return false
}

VCard.prototype.handle = function(stanza) {
    return false
}

module.exports = VCard
