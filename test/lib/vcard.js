'use strict';

var VCard = require('../../index')
  , ltx    = require('ltx')
  , helper = require('../helper')

/* jshint -W030 */
describe('VCard', function() {

    var vcard, socket, xmpp, manager

    before(function() {
        socket = new helper.SocketEventer()
        xmpp = new helper.XmppEventer()
        manager = {
            socket: socket,
            client: xmpp,
            trackId: function(id, callback) {
                if (typeof id !== 'object')
                    throw new Error('Stanza ID spoofing protection not implemented')
                this.callback = callback
            },
            makeCallback: function(error, data) {
                this.callback(error, data)
            },
            getJidType: function(type) {
                if ('bare' === type)
                    return 'juliet@example.com'
                throw new Error('Unknown JID type')
            }
        }
        vcard = new VCard()
        vcard.init(manager)
    })

    beforeEach(function() {
        socket.removeAllListeners()
        xmpp.removeAllListeners()
        vcard.init(manager)
    })

    describe('Handles', function() {

        it('Returns false for non-VCard temp stanzas', function() {
            vcard.handles(ltx.parse('<message/>')).should.be.false
            vcard.handles(ltx.parse('<iq/>')).should.be.false
            vcard.handles(ltx.parse('<iq><notVCard/></iq>')).should.be.false
        })

        it('Returns true for correct stanza', function() {
            var stanza = '<iq><vCard xmlns="vcard-temp"/></iq>'
            vcard.handles(ltx.parse(stanza)).should.be.true
        })

    })

})