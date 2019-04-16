let SIP = require('sip.client');
let fs = require('fs');

describe('Call Tests media transfer', function() {

    it('Start Sip Server Register Unregister', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        this.timeout(3000);

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
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            // wsServers: ['wss://127.0.0.1:8507'],
            // wsServers: ['ws://127.0.0.1:8506'],
            wsServers: ['udp://127.0.0.1:5060'],
            // wsServers: ['tcp://127.0.0.1:5061'],
            // wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            // transport: 'ws'
            transport: 'udp'
            //transport: 'tcp'
            // transport: 'tls'
        });

        uaAlice.on('registered', function() {
            console.warn('registered');
            uaAlice.unregister();
        });

        uaAlice.on('unregistered', function(response, err) {
            console.log('UNREGISTER');

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

    it('Call UDP <- WSS', function(done) {
        this.timeout(50000);

        let sessionUa1;
        let registerUa1 = false;
        let registerUaAlice = false;
        let isSendingInvite = false;
        let fs = require('fs');
        let timerEndData;

        let outStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
        let inStream = fs.createWriteStream('rec/remoteStream.raw');

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['wss://127.0.0.1:8507'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'wss'
        });

        ua1.on('registered', () => {
            console.log('***************** REGISTER UA1');
            registerUa1 = true;
            onAllRegisters();
        });

        function onAllRegisters() {
            if (registerUa1 && registerUaAlice && !isSendingInvite) {
                isSendingInvite = true;
                sendInviteAlice();
            }
        }

        function sendInviteAlice() {
            sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

            let remoteStream = sessionUa1.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UA1 remoteStream data', data);
                inStream.write(data);

                clearTimeout(timerEndData);
                timerEndData = setTimeout(() => {
                    checkMediaData();
                }, 1000);
            });
        }

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            wsServers: ['udp://127.0.0.1:5060'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'udp'
        });

        uaAlice.on('registered', () => {
            registerUaAlice = true;

            onAllRegisters();
        });

        uaAlice.on('invite', function(session) {
            console.warn('invite');

            let wav = require('wav');
            let reader = new wav.Reader();

            session.accept({
                media: {
                    stream: reader
                }
            });

            let remoteStream = session.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UaAlice remoteStream data', data);
            });

            sessionUa1.on('accepted', () => {
                outStream.pipe(reader);
            });
        });

        function checkMediaData() {
            let wav = require('wav');
            let remoteStream = fs.readFileSync('rec/remoteStream.raw');
            let readStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
            let wavReader = new wav.Reader();

            wavReader.on('data', (data) => {
                function isEqualBuffers() {
                    for (let i = 0, len = data.length; i < len; i++) {
                        console.log('Сравнение данных', remoteStream[i], data[i]);

                        if (data[i] != remoteStream[i]) {
                            return false;
                        }
                    }
                    return true;
                }

                sessionUa1.bye();
                ua1.unregister();
                ua1.stop();
                uaAlice.unregister();
                uaAlice.stop();

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
        }
    });

    it('Call UDP <- UDP', function(done) {
        this.timeout(50000);

        let sessionUa1;
        let registerUa1 = false;
        let registerUaAlice = false;
        let isSendingInvite = false;
        let fs = require('fs');
        let timerEndData;

        let outStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
        let inStream = fs.createWriteStream('rec/remoteStream.raw');

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['udp://127.0.0.1:5060'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'udp'
        });

        ua1.on('registered', () => {
            registerUa1 = true;
            onAllRegisters();
        });

        function onAllRegisters() {
            if (registerUa1 && registerUaAlice && !isSendingInvite) {
                isSendingInvite = true;
                sendInviteAlice();
            }
        }

        function sendInviteAlice() {
            sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

            let remoteStream = sessionUa1.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UA1 remoteStream data', data);
                inStream.write(data);

                clearTimeout(timerEndData);
                timerEndData = setTimeout(() => {
                    checkMediaData();
                }, 1000);
            });
        }

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            wsServers: ['udp://127.0.0.1:5060'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'udp'
        });

        uaAlice.on('registered', () => {
            registerUaAlice = true;

            onAllRegisters();
        });

        uaAlice.on('invite', function(session) {
            console.warn('invite');

            let wav = require('wav');
            let reader = new wav.Reader();

            session.accept({
                media: {
                    stream: reader
                }
            });

            let remoteStream = session.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UaAlice remoteStream data', data);
            });

            sessionUa1.on('accepted', () => {
                outStream.pipe(reader);
            });
        });

        function checkMediaData() {
            let wav = require('wav');
            let remoteStream = fs.readFileSync('rec/remoteStream.raw');
            let readStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
            let wavReader = new wav.Reader();

            wavReader.on('data', (data) => {
                function isEqualBuffers() {
                    for (let i = 0, len = data.length; i < len; i++) {
                        console.log('Сравнение данных', remoteStream[i], data[i]);

                        if (data[i] != remoteStream[i]) {
                            return false;
                        }
                    }
                    return true;
                }

                sessionUa1.bye();
                ua1.unregister();
                ua1.stop();
                uaAlice.unregister();
                uaAlice.stop();

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
        }
    });



    it('Call TCP <- TCP', function(done) {
        this.timeout(50000);

        let sessionUa1;
        let registerUa1 = false;
        let registerUaAlice = false;
        let isSendingInvite = false;
        let fs = require('fs');
        let timerEndData;

        let outStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
        let inStream = fs.createWriteStream('rec/remoteStream.raw');

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['tcp://127.0.0.1:5061'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'tcp'
        });

        ua1.on('registered', () => {
            registerUa1 = true;
            onAllRegisters();
        });

        function onAllRegisters() {
            if (registerUa1 && registerUaAlice && !isSendingInvite) {
                isSendingInvite = true;
                sendInviteAlice();
            }
        }

        function sendInviteAlice() {
            sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

            let remoteStream = sessionUa1.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UA1 remoteStream data', data);
                inStream.write(data);

                clearTimeout(timerEndData);
                timerEndData = setTimeout(() => {
                    checkMediaData();
                }, 1000);
            });
        }

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            wsServers: ['tcp://127.0.0.1:5061'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'tcp'
        });

        uaAlice.on('registered', () => {
            registerUaAlice = true;

            onAllRegisters();
        });

        uaAlice.on('invite', function(session) {
            console.warn('invite');

            let wav = require('wav');
            let reader = new wav.Reader();

            session.accept({
                media: {
                    stream: reader
                }
            });

            let remoteStream = session.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UaAlice remoteStream data', data);
            });

            sessionUa1.on('accepted', () => {
                outStream.pipe(reader);
            });
        });

        function checkMediaData() {
            let wav = require('wav');
            let remoteStream = fs.readFileSync('rec/remoteStream.raw');
            let readStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
            let wavReader = new wav.Reader();

            wavReader.on('data', (data) => {
                function isEqualBuffers() {
                    for (let i = 0, len = data.length; i < len; i++) {
                        console.log('Сравнение данных', remoteStream[i], data[i]);

                        if (data[i] != remoteStream[i]) {
                            return false;
                        }
                    }
                    return true;
                }

                sessionUa1.bye();
                ua1.unregister();
                ua1.stop();
                uaAlice.unregister();
                uaAlice.stop();

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
        }
    });



    it('Call TLS <- TLS', function(done) {
        this.timeout(50000);

        let sessionUa1;
        let registerUa1 = false;
        let registerUaAlice = false;
        let isSendingInvite = false;
        let fs = require('fs');
        let timerEndData;

        let outStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
        let inStream = fs.createWriteStream('rec/remoteStream.raw');

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'tls'
        });

        ua1.on('registered', () => {
            registerUa1 = true;
            onAllRegisters();
        });

        function onAllRegisters() {
            if (registerUa1 && registerUaAlice && !isSendingInvite) {
                isSendingInvite = true;
                sendInviteAlice();
            }
        }

        function sendInviteAlice() {
            sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

            let remoteStream = sessionUa1.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UA1 remoteStream data', data);
                inStream.write(data);

                clearTimeout(timerEndData);
                timerEndData = setTimeout(() => {
                    checkMediaData();
                }, 1000);
            });
        }

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'tls'
        });

        uaAlice.on('registered', () => {
            registerUaAlice = true;

            onAllRegisters();
        });

        uaAlice.on('invite', function(session) {
            console.warn('invite');

            let wav = require('wav');
            let reader = new wav.Reader();

            session.accept({
                media: {
                    stream: reader
                }
            });

            let remoteStream = session.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UaAlice remoteStream data', data);
            });

            sessionUa1.on('accepted', () => {
                outStream.pipe(reader);
            });
        });

        function checkMediaData() {
            let wav = require('wav');
            let remoteStream = fs.readFileSync('rec/remoteStream.raw');
            let readStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
            let wavReader = new wav.Reader();

            wavReader.on('data', (data) => {
                function isEqualBuffers() {
                    for (let i = 0, len = data.length; i < len; i++) {
                        console.log('Сравнение данных', remoteStream[i], data[i]);

                        if (data[i] != remoteStream[i]) {
                            return false;
                        }
                    }
                    return true;
                }

                sessionUa1.bye();
                ua1.unregister();
                ua1.stop();
                uaAlice.unregister();
                uaAlice.stop();

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
        }
    });



    it('Call WS <- WS', function(done) {
        this.timeout(50000);

        let sessionUa1;
        let registerUa1 = false;
        let registerUaAlice = false;
        let isSendingInvite = false;
        let fs = require('fs');
        let timerEndData;

        let outStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
        let inStream = fs.createWriteStream('rec/remoteStream.raw');

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['ws://127.0.0.1:8506'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
        });

        ua1.on('registered', () => {
            registerUa1 = true;
            onAllRegisters();
        });

        function onAllRegisters() {
            if (registerUa1 && registerUaAlice && !isSendingInvite) {
                isSendingInvite = true;
                sendInviteAlice();
            }
        }

        function sendInviteAlice() {
            sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

            let remoteStream = sessionUa1.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UA1 remoteStream data', data);
                inStream.write(data);

                clearTimeout(timerEndData);
                timerEndData = setTimeout(() => {
                    checkMediaData();
                }, 1000);
            });
        }

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            wsServers: ['ws://127.0.0.1:8506'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
        });

        uaAlice.on('registered', () => {
            registerUaAlice = true;

            onAllRegisters();
        });

        uaAlice.on('invite', function(session) {
            console.warn('invite');

            let wav = require('wav');
            let reader = new wav.Reader();

            session.accept({
                media: {
                    stream: reader
                }
            });

            let remoteStream = session.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UaAlice remoteStream data', data);
            });

            sessionUa1.on('accepted', () => {
                outStream.pipe(reader);
            });
        });

        function checkMediaData() {
            let wav = require('wav');
            let remoteStream = fs.readFileSync('rec/remoteStream.raw');
            let readStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
            let wavReader = new wav.Reader();

            wavReader.on('data', (data) => {
                function isEqualBuffers() {
                    for (let i = 0, len = data.length; i < len; i++) {
                        console.log('Сравнение данных', remoteStream[i], data[i]);

                        if (data[i] != remoteStream[i]) {
                            return false;
                        }
                    }
                    return true;
                }

                sessionUa1.bye();
                ua1.unregister();
                ua1.stop();
                uaAlice.unregister();
                uaAlice.stop();

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
        }
    });



    it('Call WSS <- WSS', function(done) {
        this.timeout(50000);

        let sessionUa1;
        let registerUa1 = false;
        let registerUaAlice = false;
        let isSendingInvite = false;
        let fs = require('fs');
        let timerEndData;

        let outStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
        let inStream = fs.createWriteStream('rec/remoteStream.raw');

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            wsServers: ['wss://127.0.0.1:8507'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
        });

        ua1.on('registered', () => {
            registerUa1 = true;
            onAllRegisters();
        });

        function onAllRegisters() {
            if (registerUa1 && registerUaAlice && !isSendingInvite) {
                isSendingInvite = true;
                sendInviteAlice();
            }
        }

        function sendInviteAlice() {
            sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

            let remoteStream = sessionUa1.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UA1 remoteStream data', data);
                inStream.write(data);

                clearTimeout(timerEndData);
                timerEndData = setTimeout(() => {
                    checkMediaData();
                }, 1000);
            });
        }

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            wsServers: ['wss://127.0.0.1:8507'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
        });

        uaAlice.on('registered', () => {
            registerUaAlice = true;

            onAllRegisters();
        });

        uaAlice.on('invite', function(session) {
            console.warn('invite');

            let wav = require('wav');
            let reader = new wav.Reader();

            session.accept({
                media: {
                    stream: reader
                }
            });

            let remoteStream = session.getRemoteStreams();

            remoteStream.on('data', (data) => {
                console.log('UaAlice remoteStream data', data);
            });

            sessionUa1.on('accepted', () => {
                outStream.pipe(reader);
            });
        });

        function checkMediaData() {
            let wav = require('wav');
            let remoteStream = fs.readFileSync('rec/remoteStream.raw');
            let readStream = fs.createReadStream('media/Спасибо_за_оценку.wav');
            let wavReader = new wav.Reader();

            wavReader.on('data', (data) => {
                function isEqualBuffers() {
                    for (let i = 0, len = data.length; i < len; i++) {
                        console.log('Сравнение данных', remoteStream[i], data[i]);

                        if (data[i] != remoteStream[i]) {
                            return false;
                        }
                    }
                    return true;
                }

                sessionUa1.bye();
                ua1.unregister();
                ua1.stop();
                uaAlice.unregister();
                uaAlice.stop();

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
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
        }, 2000);

        uaAlice.start();
    });
});
