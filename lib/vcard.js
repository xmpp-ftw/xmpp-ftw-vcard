'use strict';

var Base     = require('xmpp-ftw/lib/base')

var VCard = function() {}

VCard.prototype = new Base()

VCard.prototype._events = {
    'xmpp.vcard.get': 'get'
}

VCard.prototype.handles = function(stanza) {
    return (stanza.is('iq') &&
        ('undefined' !== typeof stanza.getChild('vCard', this.NS)))
}

VCard.prototype.handle = function() {
    return false
}

module.exports = VCard
