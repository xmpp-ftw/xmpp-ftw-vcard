'use strict';

var Base = require('xmpp-ftw/lib/base')
  , ltx  = require('ltx')

var VCard = function() {}

VCard.prototype = new Base()

VCard.prototype.NS = 'vcard-temp'

VCard.prototype._events = {
    'xmpp.vcard.get': 'getCard',
    'xmpp.vcard.set': 'setCard',
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
    var attrs = { id: this._getId(), type: 'get' }
    if (data.to) attrs.to = data.to
    var stanza = new ltx.Element('iq', attrs)
    stanza.c('vCard', { xmlns: this.NS })
    this.manager.trackId(stanza, function(stanza) {
        if ('error' === stanza.attrs.type)
            return callback(self._parseError(stanza), null)
        callback(null, true)
    })
    this.client.send(stanza)
}

VCard.prototype.setCard = function(data, callback) {
    if (typeof callback !== 'function')
        return this._clientError('Missing callback', data)
    var self = this
    var attrs = { id: this._getId(), type: 'set' }
    var stanza = new ltx.Element('iq', attrs)
    stanza.c('vCard', { xmlns: this.NS })
    this.manager.trackId(stanza, function(stanza) {
        if ('error' === stanza.attrs.type)
            return callback(self._parseError(stanza), null)
        callback(null, true)
    })
    this.client.send(stanza)
}

module.exports = VCard
