'use strict';

var VCard = require('../../index')
  , ltx    = require('ltx')
  , helper = require('../helper')
  , should = require('should')

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
    
    it('Exports the correct namespace', function() {
        vcard.NS.should.equal('vcard-temp')
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
    
    describe('Get a vcard', function() {
        
        it('Errors if no callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing callback')
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.send('xmpp.vcard.get', {})
        })

        it('Errors if non-function callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing callback')
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.send('xmpp.vcard.get', {}, true)
        })
        
        it('Requests user\'s vcard', function(done) {
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('get')
                stanza.attrs.id.should.exist
                stanza.getChild('vCard', vcard.NS).should.exist
                done()
            })
            socket.send('xmpp.vcard.get', {}, function() {})
        })
        
        it('Requests another user\'s vcard', function(done) {
            var request = { to: 'doc@outati.me' }
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('get')
                stanza.attrs.to.should.equal(request.to)
                stanza.attrs.id.should.exist
                stanza.getChild('vCard', vcard.NS).should.exist
                done()
            })
            socket.send('xmpp.vcard.get', request, function() {})
        })
        
        it('Handles error response', function(done) {
            xmpp.once('stanza', function() {
                manager.makeCallback(helper.getStanza('iq-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'cancel',
                    condition: 'error-condition'
                })
                done()
            }
            socket.send('xmpp.vcard.get', {}, callback)
        })
        
        it('Returns a VCard', function(done) {
            xmpp.once('stanza', function() {
                manager.makeCallback(helper.getStanza('vcard-basic'))
            })
            var callback = function(error, vcard) {
                should.not.exist(error)
                vcard.should.exist
                done()
            }
            socket.send('xmpp.vcard.get', {}, callback)
        })
        
    })

    describe('Update a vcard', function() {
        
        it('Errors if no callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing callback')
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.send('xmpp.vcard.set', {})
        })

        it('Errors if non-function callback provided', function(done) {
            xmpp.once('stanza', function() {
                done('Unexpected outgoing stanza')
            })
            socket.once('xmpp.error.client', function(error) {
                error.type.should.equal('modify')
                error.condition.should.equal('client-error')
                error.description.should.equal('Missing callback')
                error.request.should.eql({})
                xmpp.removeAllListeners('stanza')
                done()
            })
            socket.send('xmpp.vcard.set', {}, true)
        })
        
        it('Requests user\'s vcard', function(done) {
            xmpp.once('stanza', function(stanza) {
                stanza.is('iq').should.be.true
                stanza.attrs.type.should.equal('set')
                stanza.attrs.id.should.exist
                stanza.getChild('vCard', vcard.NS).should.exist
                done()
            })
            socket.send('xmpp.vcard.set', {}, function() {})
        })
        
        it('Handles error response', function(done) {
            xmpp.once('stanza', function() {
                manager.makeCallback(helper.getStanza('iq-error'))
            })
            var callback = function(error, success) {
                should.not.exist(success)
                error.should.eql({
                    type: 'cancel',
                    condition: 'error-condition'
                })
                done()
            }
            socket.send('xmpp.vcard.set', {}, callback)
        })
        
        it('Accepts the update', function(done) {
            xmpp.once('stanza', function() {
                manager.makeCallback(helper.getStanza('iq-result'))
            })
            var callback = function(error, success) {
                should.not.exist(error)
                success.should.be.true
                done()
            }
            socket.send('xmpp.vcard.set', {}, callback)
        })
        
    })

})