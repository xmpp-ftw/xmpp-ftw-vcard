'use strict';

var Base     = require('xmpp-ftw/lib/base')

var VCard = function() {}

VCard.prototype = new Base()

VCard.prototype.NS = 'vcard-temp'

VCard.prototype._events = {
    'xmpp.vcard.get': 'getCard'
}

VCard.prototype.handles = function(stanza) {
    return (stanza.is('iq') &&
        ('undefined' !== typeof stanza.getChild('vCard', this.NS)))
}

VCard.prototype.handle = function() {
    return false
}

VCard.prototype.getCard = function(data, callback) {
    if (typeof callback !== 'function')
        return this._clientError('Missing callback', data)
}

module.exports = VCard
