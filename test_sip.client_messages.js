let SIP = require('sip.client');
let fs = require('fs');
let sipServer;

describe('Send Message Tests', function() {

    it('Start Sip Server Register Unregister', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        this.timeout(30000);

        let sipServerModule = require('sip.server');
        let settings = {
            accounts: {
                1: {
                    user: '1',
                    password: '1'
                },
                alice: {
                    user: 'alice',
                    password: 'alice'
                }
            },
            tls: {
                port: 5062,
                key: 'server_localhost.key',
                cert: 'server_localhost.crt',
                secureProtocol: 'TLSv1.2'
            },
            wss: {
                port: 8507,
                key: 'server_localhost.key',
                cert: 'server_localhost.crt'
            }
        };

        sipServer = new sipServerModule.SipServer(settings);
        sipServer.ProxyStart(settings);

        let uaAlice = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            // wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            // transport: 'ws'
            //transport: 'udp'
            //transport: 'tcp'
            transport: 'tls'
        });

        uaAlice.on('registered', function() {
            uaAlice.unregister();
        });
        
        uaAlice.on('unregistered', function(response, err) {
            uaAlice.unregister();
            uaAlice.stop();

            if (err) {
                done(err);
            } else {
                done();
            }
        });
        uaAlice.start();
    });

    it('Send Message 2xWS <- WS', function(done) {
        this.timeout(20000);

        let uaAlice;
        let counterMessages = 0;

        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        let ua11;

        ua1.on('registered', function() {

            ua11 = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:1@127.0.0.1',
                user: '1',
                password: '1',
                wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                    //transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            ua11.on('registered', function() {
                startAlice();
            });

            ua11.on('message', function(msg) {
                counterMessages++;
    
                console.log('MESSAGE ua11', msg.body, 'counterMessages', counterMessages);

                if (msg.body == 'Hello Bob!') {
                    if (counterMessages == 2) {
                        clearTimeout(timer);

                        ua1.unregister();
                        ua1.stop();
                        ua11.unregister();
                        ua11.stop();
                        uaAlice.unregister();
                        uaAlice.stop();
                        
                        done();
                    }
                }
            });
        });

        ua1.on('message', function(msg) {
            counterMessages++;


            console.log('MESSAGE ua1', msg.body, 'counterMessages', counterMessages);

            if (msg.body == 'Hello Bob!') {
                if (counterMessages == 2) {
                    clearTimeout(timer);

                    ua1.unregister();
                    ua1.stop();
                    ua11.unregister();
                    ua11.stop();
                    uaAlice.unregister();
                    uaAlice.stop();

                    done();
                }
            }
        });

        ua1.start();

        let timer = setTimeout(() => {

            ua1.unregister();
            ua1.stop();
            ua11.unregister();
            ua11.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                    //transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });
    

    
    it('Send Message WS <- WS', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            if (msg.body == 'Hello Bob!') {
                // setTimeout(function() {
                    ua1.unregister();
                    ua1.stop();
                    uaAlice.unregister();
                    uaAlice.stop();
                    done();
                // }, 1000);
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                    //transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });


    it('Send Message WS <- TCP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });


    it('Send Message WS <- UDP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);

            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message WS <- TLS', function(done) {
        this.timeout(10000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);

            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 60,
                //transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message TLS <- WS', function(done) {
        this.timeout(5000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            //transport: 'tcp'
            transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                    //transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message TLS <- TCP', function(done) {
        this.timeout(5000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            //transport: 'tcp'
            transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });



    it('Send Message TLS <- UDP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            //transport: 'tcp'
            transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);

            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message TLS <- TLS', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            //transport: 'tcp'
            transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);

            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });


    it('Send Message TCP <- WS', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                    //transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message TCP <- TCP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                done();
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message TCP <- UDP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                done();
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });
    
    it('Send Message TCP <- TLS', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            //transport: 'udp'
            transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                done();
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message UDP <- WS', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                done();
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                    //transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message UDP <- TCP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                done();
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });
    
    it('Send Message UDP <- UDP', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                done();
            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                //uri: 'sip:1@127.0.0.1',
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                //wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });

    it('Send Message UDP <- TLS', function(done) {
        this.timeout(2000);

        let uaAlice;
        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua1.on('registered', function() {
            startAlice();
        });

        ua1.on('message', function(msg) {
            clearTimeout(timer);

            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();

            if (msg.body == 'Hello Bob!') {
                setTimeout(function() {
                    done();
                }, 1000);

            } else {
                done('Message not Hello Bob!');
            }
        });

        ua1.start();

        let timer = setTimeout(() => {
            ua1.unregister();
            ua1.stop();
            uaAlice.unregister();
            uaAlice.stop();
            done('Cработал таймаут');
        }, 3000);

        function startAlice() {
            uaAlice = new SIP.UA({
                uri: 'sip:alice@127.0.0.1',
                user: 'alice',
                password: 'alice',
                //wsServers: ['ws://127.0.0.1:8506'],
                //wsServers: ['udp://127.0.0.1:5060'],
                //wsServers: ['tcp://127.0.0.1:5061'],
                wsServers: ['tls://127.0.0.1:5062'],
                register: true,
                mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                //transport: 'udp'
                //transport: 'tcp'
                transport: 'tls'
            });

            uaAlice.on('registered', function() {
                function sendMessageAccountTo1() {
                    let text = 'Hello Bob!';
                    uaAlice.message('sip:1@127.0.0.1', text);
                }
                sendMessageAccountTo1();
            });

            uaAlice.start();
        }
    });


    it('Stop Sip Server', function(done) {
        this.timeout(30000);

        sipServer.stop();
        
        let uaAlice = new SIP.UA({
            //uri: 'sip:1@127.0.0.1',
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            // wsServers: ['ws://127.0.0.1:8506'],
            //wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            // transport: 'ws'
            //transport: 'udp'
            //transport: 'tcp'
            transport: 'tls'
        });

        uaAlice.on('registered', function() {
            clearTimeout(timer);
            uaAlice.unregister();
            uaAlice.stop();
            done('Ошибка: Зарегистрировался аккаунт к остановленному сип серверу');
        });

        let timer = setTimeout(() => {
            uaAlice.unregister();
            uaAlice.stop();
            done();
        }, 7000);

        uaAlice.start();
    });

});


