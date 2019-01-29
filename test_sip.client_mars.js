let SIP = require('sip.client');
let fs = require('fs');

// Тесты запускаются, но периодически нет установленного сценария на обнента в марс.
let mars;

// ********************** Общие функции **************************
function startMars() {
    mars = require('child_process').fork(__dirname + '/node_modules/mars/mars.js', {silent: true, execPath: 'node'});
}

function stopMars() {
    if (mars) {
        mars.kill('SIGHUP');
    }
}

describe('Call Tests Echo', function() {
    let SIP = require('sip.client');
    let g711 = new (require(__dirname + '/node_modules/mars/lib/media/G711').G711)();
    let player_1 = require(__dirname + '/node_modules/mars/lib/media/player');
    let file = __dirname + '/media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';
    let hostIp = '127.0.0.1';

    // ********************** Общие функции для группы тестов **************************
    function convertoUlawToPcmu(buffer) {
        var l = buffer.length;
        var buf = new Int16Array(l);

        while (l--) {
            buf[l] = g711.ulaw2linear(buffer[l]); //convert to pcmu
        }

        return buf.buffer;
    }

    it('Call MARS <- UDP', (done) => {
        startMars();

        setTimeout(() => {
            // ********************** 1 **************************
            let ua1 = new SIP.UA({
                uri: 'sip:1@' + hostIp,
                user: '1',
                password: '1',
                // wsServers: ['ws://' + hostIp + ':8506'],
                wsServers: ['udp://' + hostIp + ':5060'],
                // wsServers: ['tcp://' + hostIp + ':5060'],
                // wsServers: ['tls://' + hostIp + ':5061'],
                register: true,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WRTC.MediaHandler.defaultFactory,
                registerExpires: 60,
                //transport: 'ws'
                transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });
            let logger = ua1.getLogger('test');
            let outData = Buffer(0);
            let inData = Buffer(0);

            setTimeout(() => {
                // ****** Исходящий звонок ****** //
                const EventEmitter = require('events');

                const stream = new EventEmitter();

                let options = {
                    media: {
                        stream: stream
                    }
                };

                let session = ua1.invite('sip:2@' + hostIp, options);

                // ****** Воспроизведение входящего потока ****** //
                var remoteStream = session.getRemoteStreams();

                // let fileNameRemoteStream = 'rec/remoteStream.raw';
                // let writeStream = fs.createWriteStream(fileNameRemoteStream);

                remoteStream.on('data', (data) => {
                    // data = new Buffer( convertoUlawToPcmu(data) );
                    // console.log('Входящий поток запись в файл');
                    // console.log(data);
    
                    let totalLength = inData.length + data.length;
                    inData = Buffer.concat([inData, data], totalLength);

                    // console.log('data', data);
                    // console.log('data.length', data.length);

                    // console.log('inData', inData);
                    // console.log('inData.length', inData.length);

                    // writeStream.write(data);
                });

                setTimeout(() => {
                    let player = new player_1.Player();

                    player.on('buffer', (data) => {
                        var newData = new Buffer(data.length - 12);
                        data.copy(newData, 0, 12);

                        // newData = new Buffer( convertoUlawToPcmu(newData) );

                        let rtcBuffer = new Buffer(newData.length);
                        newData.copy(rtcBuffer);

                        // console.log('rtcBuffer', rtcBuffer);
                        // console.log('newData', newData);

                        let totalLength = outData.length + rtcBuffer.length;
                        outData = Buffer.concat([outData, rtcBuffer], totalLength);

                        // console.log('outData', outData);
                        // console.log('outData.length', outData.length);

                        stream.emit('data', newData);
                    });

                    player.emit('start_play', {
                        params: {
                            file: file
                        }
                    });

                    player.on('event', (data) => {
                        // console.log('event data: ', data);
                    });
                }, 1000);

                // Проверка на корректность передачи данных
                setTimeout(() => {
                    stopMars();
                    ua1.unregister();

                    if ( (outData && outData.length) && (inData && inData.length) ) {
                        for (let i = 0, len = outData.length; i < len; i++) {

                            // console.log(' ');
                            // console.log('outData', outData[i], inData[i]);
                            // console.log('inData', inData[i]);

                            if (outData[i] != inData[i]) {
                                return done('Buffer are not identical');
                            }
                        }
                        done();
                    } else {
                        done('Buffer are not identical');
                    }
                }, 10000);

            }, 2000);
        }, 10000);
    }).timeout(70000);
});


/*
describe('Call Tests PCM FILES', () => {
    let SIP = require('sip.client');
    let g711 = new (require(__dirname + '/node_modules/mars/lib/media/G711').G711)();
    let player_1 = require(__dirname + '/node_modules/mars/lib/media/player');
    let file = __dirname + '/media/entrance_data.wav';
    let hostIp = '127.0.0.1';

    // ********************** Общие функции для группы тестов **************************
    function convertoUlawToPcmu(buffer) {
        var l = buffer.length;
        var buf = new Int16Array(l);

        while (l--) {
            buf[l] = g711.ulaw2linear(buffer[l]); //convert to pcmu
        }

        return buf.buffer;
    }

    it('Call MARS <- UDP', (done) => {
        stopMars();
        setTimeout(() => {
            startMars();
        }, 1000);

        setTimeout(() => {
            // Тестовый звонок на марс для отладки rtc канала на Марсе
            // ********************** 1 **************************
            let ua1 = new SIP.UA({
                uri: 'sip:1@' + hostIp,
                user: '1',
                password: '1',
                // wsServers: ['ws://' + hostIp + ':8506'],
                wsServers: ['udp://' + hostIp + ':5060'],
                // wsServers: ['tcp://' + hostIp + ':5060'],
                // wsServers: ['tls://' + hostIp + ':5061'],
                register: true,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WRTC.MediaHandler.defaultFactory,
                registerExpires: 60,
                //transport: 'ws'
                transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });
            let logger = ua1.getLogger('test');

            setTimeout(() => {
                // ****** Исходящий звонок ****** //
                const EventEmitter = require('events');

                const stream = new EventEmitter();

                let options = {
                    media: {
                        stream: stream
                    }
                };

                let session = ua1.invite('sip:alice@' + hostIp, options);

                // ****** Воспроизведение входящего потока ****** //
                var remoteStream = session.getRemoteStreams();

                var remoteBuffers;

                remoteStream.on('data', (data) => {
                    data = new Buffer( convertoUlawToPcmu(data) );

                    if (remoteBuffers) {
                        var totalLength = remoteBuffers.length + data.length;
                        remoteBuffers = Buffer.concat([remoteBuffers, data], totalLength);

                        if (totalLength > 500) {
                            remoteBuffers = null;
                        }
                    } else {
                        remoteBuffers = data;
                    }

                });

                var rightResult = '4567';
                var resultInput = '';

                ua1.on('message', (message) => {

                    if (message.body) {
                        resultInput += message.body;

                        if (resultInput == rightResult) {
                            session.bye();

                            setTimeout(() => {
                                // console.log('bye');
                                done();
                            }, 3000);
                        } else {
                            if (resultInput.length >= rightResult.length) {
                                done('Введенные показания не соответствуют ' + resultInput + ' != ' + rightResult);
                            }
                        }
                    }
                });

                setTimeout(() => {
                    let player = new player_1.Player();

                    player.on('buffer', (data) => {
                        var newData = new Buffer(data.length - 12);
                        data.copy(newData, 0, 12);

                        // newData = new Buffer( convertoUlawToPcmu(newData) );

                        let rtcBuffer = new Buffer(newData.length);
                        newData.copy(rtcBuffer);

                        stream.emit('data', newData);
                    });

                    player.emit('start_play', {
                        params: {
                            file: file
                        }
                    });

                    player.on('event', (data) => {
                        // console.log('event data: ', data);
                    });
                }, 1000);
            // });
            }, 2000);
        }, 10000);
    }).timeout(70000);

    it('Call MARS <- WS', (done) => {
        stopMars();
        setTimeout(() => {
            startMars();
        }, 1000);

        setTimeout(() => {
            // Тестовый звонок на марс для отладки rtc канала на Марсе
            // ********************** 1 **************************
            let ua1 = new SIP.UA({
                uri: 'sip:1@' + hostIp,
                user: '1',
                password: '1',
                wsServers: ['ws://' + hostIp + ':8506'],
                // wsServers: ['udp://' + hostIp + ':5060'],
                //wsServers: ['tcp://' + hostIp + ':5060'],
                //wsServers: ['tls://' + hostIp + ':5061'],
                register: true,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                transport: 'ws'
                // transport: 'udp'
                    //transport: 'tcp'
                    //transport: 'tls'
            });
            let logger = ua1.getLogger('test');

            setTimeout(() => {
                // ****** Исходящий звонок ****** //
                const EventEmitter = require('events');
                const stream = new EventEmitter();

                let options = {
                    media: {
                        stream: stream
                    }
                };

                let session = ua1.invite('sip:alice@' + hostIp, options);

                // ****** Воспроизведение входящего потока ****** //
                var remoteStream = session.getRemoteStreams();

                var remoteBuffers;

                remoteStream.on('data', (data) => {
                    data = new Buffer( convertoUlawToPcmu(data) );

                    if (remoteBuffers) {
                        var totalLength = remoteBuffers.length + data.length;
                        remoteBuffers = Buffer.concat([remoteBuffers, data], totalLength);

                        if (totalLength > 500) {
                            remoteBuffers = null;
                        }
                    } else {
                        remoteBuffers = data;
                    }

                });

                var rightResult = '4567';
                var resultInput = '';

                ua1.on('message', (message) => {
                    if (message.body) {
                        resultInput += message.body;

                        if (resultInput == rightResult) {
                            session.bye();

                            setTimeout(() => {
                                // console.log('bye');
                                done();
                            }, 3000);
                        } else {
                            if (resultInput.length >= rightResult.length) {
                                // done('Введенные показания не соответствуют ' + resultInput + ' != ' + rightResult);
                            }
                        }
                    }
                });

                setTimeout(() => {
                    let player = new player_1.Player();

                    player.on('buffer', (data) => {
                        var newData = new Buffer(data.length - 12);
                        data.copy(newData, 0, 12);

                        newData = new Buffer( convertoUlawToPcmu(newData) );

                        let rtcBuffer = new Buffer(newData.length);
                        newData.copy(rtcBuffer);

                        stream.emit('data', newData);
                    });

                    player.emit('start_play', {
                        params: {
                            file: file
                        }
                    });

                    player.on('event', (data) => {
                        // console.log('event data: ', data);
                    });
                }, 1000);
            });
        }, 2000);
    }).timeout(70000);

    it('Call MARS <- TCP', (done) => {
        stopMars();
        setTimeout(() => {
            startMars();
        }, 1000);

        setTimeout(() => {
            // Тестовый звонок на марс для отладки rtc канала на Марсе
            // ********************** 1 **************************
            let ua1 = new SIP.UA({
                uri: 'sip:1@' + hostIp,
                user: '1',
                password: '1',
                //wsServers: ['ws://' + hostIp + ':8506'],
                // wsServers: ['udp://' + hostIp + ':5060'],
                wsServers: ['tcp://' + hostIp + ':5060'],
                //wsServers: ['tls://' + hostIp + ':5061'],
                register: true,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                // transport: 'udp'
                    transport: 'tcp'
                    //transport: 'tls'
            });
            let logger = ua1.getLogger('test');

            setTimeout(() => {
                // ****** Исходящий звонок ****** //
                const EventEmitter = require('events');
                const stream = new EventEmitter();

                let options = {
                    media: {
                        stream: stream
                    }
                };

                let session = ua1.invite('sip:alice@' + hostIp, options);

                // ****** Воспроизведение входящего потока ****** //
                var remoteStream = session.getRemoteStreams();

                var remoteBuffers;

                remoteStream.on('data', (data) => {
                    data = new Buffer( convertoUlawToPcmu(data) );

                    if (remoteBuffers) {
                        var totalLength = remoteBuffers.length + data.length;
                        remoteBuffers = Buffer.concat([remoteBuffers, data], totalLength);

                        if (totalLength > 500) {
                            remoteBuffers = null;
                        }
                    } else {
                        remoteBuffers = data;
                    }

                });

                var rightResult = '4567';
                var resultInput = '';

                ua1.on('message', (message) => {
                    if (message.body) {
                        resultInput += message.body;

                        if (resultInput == rightResult) {
                            session.bye();

                            setTimeout(() => {
                                // console.log('bye');
                                done();
                            }, 3000);
                        } else {
                            if (resultInput.length >= rightResult.length) {
                                // done('Введенные показания не соответствуют ' + resultInput + ' != ' + rightResult);
                            }
                        }
                    }
                });

                setTimeout(() => {
                    let player = new player_1.Player();

                    player.on('buffer', (data) => {
                        var newData = new Buffer(data.length - 12);
                        data.copy(newData, 0, 12);

                        newData = new Buffer( convertoUlawToPcmu(newData) );

                        let rtcBuffer = new Buffer(newData.length);
                        newData.copy(rtcBuffer);

                        stream.emit('data', newData);
                    });

                    player.emit('start_play', {
                        params: {
                            file: file
                        }
                    });

                    player.on('event', (data) => {
                        // console.log('event data: ', data);
                    });
                }, 1000);
            });
        }, 2000);
    }).timeout(70000);


    it('Call MARS <- TLS', (done) => {
        stopMars();
        setTimeout(() => {
            startMars();
        }, 1000);

        setTimeout(() => {
            // Тестовый звонок на марс для отладки rtc канала на Марсе
            // ********************** 1 **************************
            let ua1 = new SIP.UA({
                uri: 'sip:1@' + hostIp,
                user: '1',
                password: '1',
                //wsServers: ['ws://' + hostIp + ':8506'],
                // wsServers: ['udp://' + hostIp + ':5060'],
                // wsServers: ['tcp://' + hostIp + ':5060'],
                wsServers: ['tls://' + hostIp + ':5061'],
                register: true,
                //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
                mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
                //mediaHandlerFactory: SIP.WRTC.MediaHandler.defaultFactory,
                registerExpires: 120,
                //transport: 'ws'
                // transport: 'udp'
                // transport: 'tcp'
                transport: 'tls'
            });
            let logger = ua1.getLogger('test');

            setTimeout(() => {
                // ****** Исходящий звонок ****** //
                const EventEmitter = require('events');
                const stream = new EventEmitter();

                let options = {
                    media: {
                        stream: stream
                    }
                };

                let session = ua1.invite('sip:alice@' + hostIp, options);

                // ****** Воспроизведение входящего потока ****** //
                var remoteStream = session.getRemoteStreams();

                var remoteBuffers;

                remoteStream.on('data', (data) => {
                    data = new Buffer( convertoUlawToPcmu(data) );

                    if (remoteBuffers) {
                        var totalLength = remoteBuffers.length + data.length;
                        remoteBuffers = Buffer.concat([remoteBuffers, data], totalLength);

                        if (totalLength > 500) {
                            remoteBuffers = null;
                        }
                    } else {
                        remoteBuffers = data;
                    }

                });

                var rightResult = '4567';
                var resultInput = '';

                ua1.on('message', (message) => {
                    if (message.body) {
                        resultInput += message.body;

                        if (resultInput == rightResult) {
                            session.bye();

                            setTimeout(() => {
                                // console.log('bye');
                                done();
                            }, 3000);
                        } else {
                            if (resultInput.length >= rightResult.length) {
                                // done('Введенные показания не соответствуют ' + resultInput + ' != ' + rightResult);
                            }
                        }
                    }
                });

                setTimeout(() => {
                    let player = new player_1.Player();

                    player.on('buffer', (data) => {
                        var newData = new Buffer(data.length - 12);
                        data.copy(newData, 0, 12);

                        newData = new Buffer( convertoUlawToPcmu(newData) );

                        let rtcBuffer = new Buffer(newData.length);
                        newData.copy(rtcBuffer);

                        stream.emit('data', newData);
                    });

                    player.emit('start_play', {
                        params: {
                            file: file
                        }
                    });

                    player.on('event', (data) => {
                        // console.log('event data: ', data);
                    });
                }, 1000);
            });
        }, 2000);
    }).timeout(70000);
});
*/