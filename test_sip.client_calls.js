let SIP = require('sip.client');
let fs = require('fs');

describe('Call Tests media transfer', function() {

    it('Call UDP <- UDP', function(done) {
        this.timeout(50000);

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

        let logger = ua1.getLogger('test');

        setTimeout(function() {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                let session = ua1.invite('sip:alice@127.0.0.1', options);
            });
            file.pipe(reader);
        }, 2000);

        let uaAlice = new SIP.UA({
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

        uaAlice.on('invite', function(session) {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Спасибо_за_оценку.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                session.accept(options);

                let fileNameRemoteStream = 'rec/remoteStream.raw';
                let remoteStream = session.getRemoteStreams();
                let writeStream = fs.createWriteStream(fileNameRemoteStream);

                remoteStream.on('data', (data) => {
                    writeStream.write(data);
                });

                // Проверка на корректность переданных данных
                setTimeout(() => {
                    let remoteStream = fs.readFileSync(fileNameRemoteStream);
                    let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
                    let wavReader = new wav.Reader();

                    wavReader.on('format', function(format) {
                        wavReader.on('data', (data) => {
                            remoteStream = remoteStream.slice(1, data.length + 1);

                            function isEqualBuffers() {
                                for (let i = 0, len = data.length; i < len; i++) {
                                    if (data[i] != remoteStream[i]) {
                                        return false;
                                    }
                                }
                                return true;
                            }

                            session.bye();
                            ua1.unregister();
                            uaAlice.unregister();

                            if (isEqualBuffers()) {
                                done();
                            } else {
                                done('Buffer are not identical');
                            }
                        });
                    });
                    readStream.pipe(wavReader);
                }, 6000);

            });
            file.pipe(reader);
        });

    });

    it('Call UDP <- WS', function(done) {
        this.timeout(50000);

        let ua2 = new SIP.UA({
            uri: 'sip:2@127.0.0.1',
            user: '2',
            password: '2',
            // wsServers: ['ws://127.0.0.1:8506'],
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

        let logger = ua2.getLogger('test');

        setTimeout(function() {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                let session = ua2.invite('sip:3@127.0.0.1', options);
            });
            file.pipe(reader);
        }, 2000);

        let ua3 = new SIP.UA({
            uri: 'sip:3@127.0.0.1',
            user: '3',
            password: '3',
            wsServers: ['ws://127.0.0.1:8506'],
            // wsServers: ['udp://127.0.0.1:5060'],
            //wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            transport: 'ws'
            // transport: 'udp'
                //transport: 'tcp'
                //transport: 'tls'
        });

        ua3.on('invite', function(session) {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Спасибо_за_оценку.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                session.accept(options);

                let fileNameRemoteStream = 'rec/remoteStream.raw';
                let remoteStream = session.getRemoteStreams();
                let writeStream = fs.createWriteStream(fileNameRemoteStream);

                remoteStream.on('data', (data) => {
                    writeStream.write(data);
                });

                // Проверка на корректность переданных данных
                setTimeout(() => {
                    let remoteStream = fs.readFileSync(fileNameRemoteStream);
                    let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
                    let wavReader = new wav.Reader();

                    wavReader.on('format', function(format) {
                        wavReader.on('data', (data) => {
                            remoteStream = remoteStream.slice(1, data.length + 1);

                            function isEqualBuffers() {
                                for (let i = 0, len = data.length; i < len; i++) {
                                    if (data[i] != remoteStream[i]) {
                                        return false;
                                    }
                                }
                                return true;
                            }

                            session.bye();
                            ua2.unregister();
                            ua3.unregister();

                            if (isEqualBuffers()) {
                                done();
                            } else {
                                done('Buffer are not identical');
                            }
                        });
                    });
                    readStream.pipe(wavReader);
                }, 6000);

            });
            file.pipe(reader);
        });
    });
    

    
    it('Call TCP <- UDP', function(done) {
        this.timeout(50000);

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            // wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            // transport: 'udp'
                transport: 'tcp'
                //transport: 'tls'
        });

        let logger = ua1.getLogger('test');

        setTimeout(function() {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                let session = ua1.invite('sip:alice@127.0.0.1', options);
            });
            file.pipe(reader);
        }, 2000);

        let uaAlice = new SIP.UA({
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

        uaAlice.on('invite', function(session) {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Спасибо_за_оценку.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                session.accept(options);

                let fileNameRemoteStream = 'rec/remoteStream.raw';
                let remoteStream = session.getRemoteStreams();
                let writeStream = fs.createWriteStream(fileNameRemoteStream);

                remoteStream.on('data', (data) => {
                    writeStream.write(data);
                });

                // Проверка на корректность переданных данных
                setTimeout(() => {
                    let remoteStream = fs.readFileSync(fileNameRemoteStream);
                    let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
                    let wavReader = new wav.Reader();

                    wavReader.on('format', function(format) {
                        wavReader.on('data', (data) => {
                            remoteStream = remoteStream.slice(1, data.length + 1);

                            function isEqualBuffers() {
                                for (let i = 0, len = data.length; i < len; i++) {
                                    if (data[i] != remoteStream[i]) {
                                        return false;
                                    }
                                }
                                return true;
                            }

                            session.bye();
                            ua1.unregister();
                            uaAlice.unregister();

                            if (isEqualBuffers()) {
                                done();
                            } else {
                                done('Buffer are not identical');
                            }
                        });
                    });
                    readStream.pipe(wavReader);
                }, 6000);

            });
            file.pipe(reader);
        });
    });

    it('Call TCP <- TCP', function(done) {
        this.timeout(50000);

        let ua1 = new SIP.UA({
            uri: 'sip:1@127.0.0.1',
            user: '1',
            password: '1',
            //wsServers: ['ws://127.0.0.1:8506'],
            // wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            // transport: 'udp'
                transport: 'tcp'
                //transport: 'tls'
        });

        let logger = ua1.getLogger('test');

        setTimeout(function() {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                let session = ua1.invite('sip:alice@127.0.0.1', options);
            });
            file.pipe(reader);
        }, 2000);

        let uaAlice = new SIP.UA({
            uri: 'sip:alice@127.0.0.1',
            user: 'alice',
            password: 'alice',
            //wsServers: ['ws://127.0.0.1:8506'],
            // wsServers: ['udp://127.0.0.1:5060'],
            wsServers: ['tcp://127.0.0.1:5061'],
            //wsServers: ['tls://127.0.0.1:5062'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
            registerExpires: 120,
            //transport: 'ws'
            // transport: 'udp'
            transport: 'tcp'
                //transport: 'tls'
        });

        uaAlice.on('invite', function(session) {
            let fs = require('fs');
            let wav = require('wav');
            let fileName = 'media/Спасибо_за_оценку.wav';

            // Передача файла по rtp
            let file = fs.createReadStream(fileName);
            let reader = new wav.Reader();

            reader.on('format', function(format) {
                let options = {
                    media: {
                        stream: reader
                    }
                };

                session.accept(options);

                let fileNameRemoteStream = 'rec/remoteStream.raw';
                let remoteStream = session.getRemoteStreams();
                let writeStream = fs.createWriteStream(fileNameRemoteStream);

                remoteStream.on('data', (data) => {
                    writeStream.write(data);
                });

                // Проверка на корректность переданных данных
                setTimeout(() => {
                    let remoteStream = fs.readFileSync(fileNameRemoteStream);
                    let readStream = fs.createReadStream('media/Добро_пожаловать_в демонстрацию_системы_MARS.wav');
                    let wavReader = new wav.Reader();

                    wavReader.on('format', function(format) {
                        wavReader.on('data', (data) => {
                            remoteStream = remoteStream.slice(1, data.length + 1);

                            function isEqualBuffers() {
                                for (let i = 0, len = data.length; i < len; i++) {
                                    if (data[i] != remoteStream[i]) {
                                        return false;
                                    }
                                }
                                return true;
                            }

                            session.bye();
                            ua1.unregister();
                            uaAlice.unregister();

                            if (isEqualBuffers()) {
                                done();
                            } else {
                                done('Buffer are not identical');
                            }
                        });
                    });
                    readStream.pipe(wavReader);
                }, 6000);

            });
            file.pipe(reader);
        });
    });
});
