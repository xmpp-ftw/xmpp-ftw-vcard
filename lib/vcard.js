'use strict';

var Base = require('xmpp-ftw/lib/base')
  , ltx  = require('ltx')

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
    var self = this
    var stanza = new ltx.Element('iq', { id: this._getId(), type: 'get' })
    stanza.c('vCard', { xmlns: this.NS })
    this.manager.trackId(stanza, function(stanza) {
        if ('error' === stanza.attrs.type)
            return callback(self._parseError(stanza), null)
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = VCard
