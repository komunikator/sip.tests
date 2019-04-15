let SIP = require('sip.client');
let fs = require('fs');

describe('Call Tests media transfer', function() {

    it('Start Sip Server Register Unregister', function(done) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        this.timeout(300);

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

        // Чтение сертификатов сертификата
        // let sslTls = getCertificate(settings.tls.key, settings.tls.cert);
        // settings['tls']['key'] = sslTls['key'];
        // settings['tls']['cert'] = sslTls['cert'];

        // let sslWss = getCertificate(settings.wss.key, settings.wss.cert);
        // settings['wss']['key'] = sslWss['key'];
        // settings['wss']['cert'] = sslWss['cert'];

        function getCertificate(keyPath, crtPath) {
            let key = '';
            let cert = '';

            if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
                key = fs.readFileSync(keyPath); 
                cert = fs.readFileSync(crtPath);
            }

            return { 
                key: key,
                cert: cert
            };
        }

        sipServer = new sipServerModule.SipServer(settings);
        sipServer.ProxyStart(settings);

        // let uaAlice = new SIP.UA({
        //     //uri: 'sip:1@127.0.0.1',
        //     uri: 'sip:1@127.0.0.1',
        //     user: '1',
        //     password: '1',
        //     // wsServers: ['ws://127.0.0.1:8506'],
        //     wsServers: ['udp://127.0.0.1:5060'],
        //     // wsServers: ['tcp://127.0.0.1:5061'],
        //     // wsServers: ['tls://127.0.0.1:5062'],
        //     register: true,
        //     // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
        //     //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
        //     registerExpires: 120,
        //     // transport: 'ws'
        //     //transport: 'udp'
        //     //transport: 'tcp'
        //     transport: 'tls'
        // });

        // uaAlice.on('registered', function() {
        //     uaAlice.unregister();
        // });

        // uaAlice.on('unregistered', function(response, err) {
        //     console.log('UNREGISTER');
        //     // setTimeout(function() {
        //         uaAlice.stop();

        //         if (err) {
        //             // done(err);
        //         } else {
        //             // done();
        //         }
        //     // }, 1000);
        // });
        // uaAlice.start();
    });

    // it('Call UDP <- UDP', function(done) {
    //     this.timeout(50000);

    //     let ua1 = new SIP.UA({
    //         uri: 'sip:1@127.0.0.1',
    //         user: '1',
    //         password: '1',
    //         //wsServers: ['ws://127.0.0.1:8506'],
    //         wsServers: ['udp://127.0.0.1:5060'],
    //         //wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         transport: 'udp'
    //             //transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     let logger = ua1.getLogger('test');

    //     setTimeout(function() {
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             let session = ua1.invite('sip:alice@127.0.0.1', options);
    //         });
    //         file.pipe(reader);
    //     }, 2000);

    //     let uaAlice = new SIP.UA({
    //         uri: 'sip:alice@127.0.0.1',
    //         user: 'alice',
    //         password: 'alice',
    //         //wsServers: ['ws://127.0.0.1:8506'],
    //         wsServers: ['udp://127.0.0.1:5060'],
    //         //wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         transport: 'udp'
    //             //transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     uaAlice.on('invite', function(session) {
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Спасибо_за_оценку.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             session.accept(options);

    //             let fileNameRemoteStream = 'rec/remoteStream.raw';
    //             let remoteStream = session.getRemoteStreams();
    //             let writeStream = fs.createWriteStream(fileNameRemoteStream);

    //             remoteStream.on('data', (data) => {
    //                 writeStream.write(data);
    //             });

    //             // Проверка на корректность переданных данных
    //             setTimeout(() => {
    //                 let remoteStream = fs.readFileSync(fileNameRemoteStream);
    //                 let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
    //                 let wavReader = new wav.Reader();

    //                 wavReader.on('format', function(format) {
    //                     wavReader.on('data', (data) => {
    //                         remoteStream = remoteStream.slice(1, data.length + 1);

    //                         function isEqualBuffers() {
    //                             for (let i = 0, len = data.length; i < len; i++) {
    //                                 if (data[i] != remoteStream[i]) {
    //                                     return false;
    //                                 }
    //                             }
    //                             return true;
    //                         }

                            
    //                         session.bye();
    //                         ua1.unregister();
    //                         ua1.stop();
    //                         uaAlice.unregister();
    //                         uaAlice.stop();

    //                         if (isEqualBuffers()) {
    //                             done();
    //                         } else {
    //                             done('Buffer are not identical');
    //                         }
    //                     });
    //                 });
    //                 readStream.pipe(wavReader);
    //             }, 6000);

    //         });
    //         file.pipe(reader);
    //     });

    // });

    // it('Call UDP <- WS', function(done) {
    //     this.timeout(50000);

    //     let ua2 = new SIP.UA({
    //         uri: 'sip:1@127.0.0.1',
    //         user: '1',
    //         password: '1',
    //         // wsServers: ['ws://127.0.0.1:8506'],
    //         wsServers: ['udp://127.0.0.1:5060'],
    //         //wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         transport: 'udp'
    //             //transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     let logger = ua2.getLogger('test');

    //     setTimeout(function() {
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             let session = ua2.invite('sip:alice@127.0.0.1', options);
    //         });
    //         file.pipe(reader);
    //     }, 2000);

    //     let ua3 = new SIP.UA({
    //         uri: 'sip:alice@127.0.0.1',
    //         user: 'alice',
    //         password: 'alice',
    //         wsServers: ['ws://127.0.0.1:8506'],
    //         // wsServers: ['udp://127.0.0.1:5060'],
    //         //wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         transport: 'ws'
    //         // transport: 'udp'
    //             //transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     ua3.on('invite', function(session) {
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Спасибо_за_оценку.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             session.accept(options);

    //             let fileNameRemoteStream = 'rec/remoteStream.raw';
    //             let remoteStream = session.getRemoteStreams();
    //             let writeStream = fs.createWriteStream(fileNameRemoteStream);

    //             remoteStream.on('data', (data) => {
    //                 writeStream.write(data);
    //             });

    //             // Проверка на корректность переданных данных
    //             setTimeout(() => {
    //                 let remoteStream = fs.readFileSync(fileNameRemoteStream);
    //                 let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
    //                 let wavReader = new wav.Reader();

    //                 wavReader.on('format', function(format) {
    //                     wavReader.on('data', (data) => {
    //                         remoteStream = remoteStream.slice(1, data.length + 1);

    //                         function isEqualBuffers() {
    //                             for (let i = 0, len = data.length; i < len; i++) {
    //                                 if (data[i] != remoteStream[i]) {
    //                                     return false;
    //                                 }
    //                             }
    //                             return true;
    //                         }

    //                         session.bye();
    //                         ua2.unregister();
    //                         ua2.stop();
    //                         ua3.unregister();
    //                         ua3.stop();

    //                         if (isEqualBuffers()) {
    //                             done();
    //                         } else {
    //                             done('Buffer are not identical');
    //                         }
    //                     });
    //                 });
    //                 readStream.pipe(wavReader);
    //             }, 6000);

    //         });
    //         file.pipe(reader);
    //     });
    // });
    

    
    // it('Call TCP <- UDP', function(done) {
    //     this.timeout(50000);

    //     let ua1 = new SIP.UA({
    //         uri: 'sip:1@127.0.0.1',
    //         user: '1',
    //         password: '1',
    //         //wsServers: ['ws://127.0.0.1:8506'],
    //         // wsServers: ['udp://127.0.0.1:5060'],
    //         wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         // transport: 'udp'
    //             transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     let logger = ua1.getLogger('test');

    //     setTimeout(function() {
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             let session = ua1.invite('sip:alice@127.0.0.1', options);
    //         });
    //         file.pipe(reader);
    //     }, 2000);

    //     let uaAlice = new SIP.UA({
    //         uri: 'sip:alice@127.0.0.1',
    //         user: 'alice',
    //         password: 'alice',
    //         //wsServers: ['ws://127.0.0.1:8506'],
    //         wsServers: ['udp://127.0.0.1:5060'],
    //         //wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         transport: 'udp'
    //             //transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     uaAlice.on('invite', function(session) {
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Спасибо_за_оценку.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             session.accept(options);

    //             let fileNameRemoteStream = 'rec/remoteStream.raw';
    //             let remoteStream = session.getRemoteStreams();
    //             let writeStream = fs.createWriteStream(fileNameRemoteStream);

    //             remoteStream.on('data', (data) => {
    //                 writeStream.write(data);
    //             });

    //             // Проверка на корректность переданных данных
    //             setTimeout(() => {
    //                 let remoteStream = fs.readFileSync(fileNameRemoteStream);
    //                 let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
    //                 let wavReader = new wav.Reader();

    //                 wavReader.on('format', function(format) {
    //                     wavReader.on('data', (data) => {
    //                         remoteStream = remoteStream.slice(1, data.length + 1);

    //                         function isEqualBuffers() {
    //                             for (let i = 0, len = data.length; i < len; i++) {
    //                                 if (data[i] != remoteStream[i]) {
    //                                     return false;
    //                                 }
    //                             }
    //                             return true;
    //                         }

    //                         session.bye();
    //                         ua1.unregister();
    //                         ua1.stop();
    //                         uaAlice.unregister();
    //                         uaAlice.stop();

    //                         if (isEqualBuffers()) {
    //                             done();
    //                         } else {
    //                             done('Buffer are not identical');
    //                         }
    //                     });
    //                 });
    //                 readStream.pipe(wavReader);
    //             }, 6000);

    //         });
    //         file.pipe(reader);
    //     });
    // });

    // Звонок
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

                if (isEqualBuffers()) {
                    done();
                } else {
                    done('Buffer are not identical');
                }
            });
            readStream.pipe(wavReader);
        }

    });

    
    // it('Call TCP <- TCP', function(done) {
    //     this.timeout(90000);
    //     let registerUa1 = false;
    //     let registerUaAlice = false;
    //     let isSendingInvite = false;
    //     let fs = require('fs');
    //     let outfileName = 'media/Спасибо_за_оценку.wav';
    //     let outStream = fs.createReadStream(outfileName);
    //     let infileName = 'rec/remoteStream.raw';
    //     let inStream = fs.createWriteStream(infileName);
    //     let sessionUa1;

    //     let ua1 = new SIP.UA({
    //         uri: 'sip:1@127.0.0.1',
    //         user: '1',
    //         password: '1',
    //         //wsServers: ['ws://127.0.0.1:8506'],
    //         // wsServers: ['udp://127.0.0.1:5060'],
    //         wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         // transport: 'udp'
    //             transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     ua1.on('registered', () => {
    //         registerUa1 = true;

    //         onAllRegisters();
    //     });

    //     function onAllRegisters() {
    //         if (registerUa1 && registerUaAlice && !isSendingInvite) {
    //             isSendingInvite = true;
    //             sendInviteAlice();
    //         }
    //     }

    //     let logger = ua1.getLogger('test');

    //     // setTimeout(function() {
    //     function sendInviteAlice() {
    //         console.warn('sendInviteAlice!!!!!!!!!!!! ');
    //         let fs = require('fs');
    //         let wav = require('wav');
    //         let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

    //         // Передача файла по rtp
    //         let file = fs.createReadStream(fileName);
    //         let reader = new wav.Reader();

    //         reader.on('format', function(format) {
    //             let options = {
    //                 media: {
    //                     stream: reader
    //                 }
    //             };

    //             console.warn('sendInviteAlice!!!');

    //             sessionUa1 = ua1.invite('sip:alice@127.0.0.1');

    //             // sessionUa1.on('bye', () => {
    //             //     console.warn('!!!!!!!!!!!!!!!!!!!!!!! AliceBYE');
    //             // });

    //             //console.warn('sessionUa1', sessionUa1);
    //         });
    //         file.pipe(reader);
    //     }
    //     // }, 2000);

    //     let uaAlice = new SIP.UA({
    //         uri: 'sip:alice@127.0.0.1',
    //         user: 'alice',
    //         password: 'alice',
    //         //wsServers: ['ws://127.0.0.1:8506'],
    //         // wsServers: ['udp://127.0.0.1:5060'],
    //         wsServers: ['tcp://127.0.0.1:5061'],
    //         //wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         //transport: 'ws'
    //         // transport: 'udp'
    //         transport: 'tcp'
    //             //transport: 'tls'
    //     });

    //     uaAlice.on('registered', () => {
    //         registerUaAlice = true;

    //         onAllRegisters();
    //     });

    //     uaAlice.on('invite', function(session) {
    //         let wav = require('wav');
    //         // Передача файла по rtp
    //         let reader = new wav.Reader();
    //         console.warn('!!!!!!!!!!!!!!!!!!!!!!! ALICE INVITED');
    //         //session.accept();
    //         //session.bye();


    //          //reader.on('end', () => {
    //              //session.bye();
    //          //    console.warn('!!!!!!!!!!!!!!!!!!!!!!! END');
    //          //})

    //         //  reader.on('format', function(format) {
    //         //      let options = {
    //         //           media: {
    //         //               stream: reader
    //         //           }
    //         //       };

    //         //     });
    //         //    outStream.pipe(reader);
    //         //     session.accept(options);
    //             session.accept();
    //             console.warn('!!!!!!!!!!!!!!!!!!!!!!! END');

    //     });
    //     // sessionUa1.on('accepted', () => {
    //     //     //let remoteStream = sessionUa1.getRemoteStreams();

    //     //     console.warn('!!!!!!!!!!!!!!!!!!!!!!! UaiAccepted');

    //     //     // remoteStream.on('data', (data) => {
    //     //     //     inStream.write(data);
    //     //     // });
    //     // });

    // });
    

    // it('Stop Sip Server', function(done) {
    //     this.timeout(30000);

    //     sipServer.stop();
        
    //     let uaAlice = new SIP.UA({
    //         //uri: 'sip:1@127.0.0.1',
    //         uri: 'sip:1@127.0.0.1',
    //         user: '1',
    //         password: '1',
    //         // wsServers: ['ws://127.0.0.1:8506'],
    //         //wsServers: ['udp://127.0.0.1:5060'],
    //         //wsServers: ['tcp://127.0.0.1:5061'],
    //         wsServers: ['tls://127.0.0.1:5062'],
    //         register: true,
    //         // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
    //         //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
    //         registerExpires: 120,
    //         // transport: 'ws'
    //         //transport: 'udp'
    //         //transport: 'tcp'
    //         transport: 'tls'
    //     });

    //     uaAlice.on('registered', function() {
    //         clearTimeout(timer);
    //         uaAlice.unregister();
    //         uaAlice.stop();
    //         done('Ошибка: Зарегистрировался аккаунт к остановленному сип серверу');
    //     });


    //     let timer = setTimeout(() => {
    //         uaAlice.unregister();
    //         uaAlice.stop();
    //         done();
    //     }, 7000);

    //     uaAlice.start();
    // });

});
