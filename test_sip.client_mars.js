let SIP = require('sip.client');
let fs = require('fs');

// Тесты запускаются, но периодически нет установленного сценария на обнента в марс.
let mars;

// ********************** Общие функции **************************
function startMars() {
    // mars = require('child_process').fork(__dirname + '/node_modules/mars/mars.js', {silent: true, execPath: 'node'});
    mars = require('mars');
}

function stopMars() {
    if (mars) {
        mars.kill('SIGHUP');
    }
}

// describe('Start Server', function() {
//     it('Start Sip Server Register Unregister', function(done) {
//         process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//         this.timeout(30000);
    
//         let sipServerModule = require('sip.server');
//         let settings = {
//             accounts: {
//                 1: {
//                     user: '1',
//                     password: '1'
//                 },
//                 2: {
//                     user: '2',
//                     password: '2'
//                 },
//                 3: {
//                     user: '3',
//                     password: '3'
//                 },
//                 alice: {
//                     user: 'alice',
//                     password: 'alice'
//                 }
//             },
//             tls: {
//                 port: 5062,
//                 key: 'server_localhost.key',
//                 cert: 'server_localhost.crt',
//                 secureProtocol: 'TLSv1.2'
//             },
//             wss: {
//                 port: 8507,
//                 key: 'server_localhost.key',
//                 cert: 'server_localhost.crt'
//             }
//         };

//         function getCertificate(keyPath, crtPath) {
//             let key = '';
//             let cert = '';
    
//             if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
//                 key = fs.readFileSync(keyPath); 
//                 cert = fs.readFileSync(crtPath);
//             }
    
//             return { 
//                 key: key,
//                 cert: cert
//             };
//         }
    
//         sipServer = new sipServerModule.SipServer(settings);
//         sipServer.ProxyStart(settings);
    
//         let uaAlice = new SIP.UA({
//             //uri: 'sip:1@127.0.0.1',
//             uri: 'sip:1@127.0.0.1',
//             user: '1',
//             password: '1',
//             // wsServers: ['ws://127.0.0.1:8506'],
//             //wsServers: ['udp://127.0.0.1:5060'],
//             //wsServers: ['tcp://127.0.0.1:5061'],
//             wsServers: ['tls://127.0.0.1:5062'],
//             register: true,
//             // mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
//             //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
//             registerExpires: 120,
//             // transport: 'ws'
//             //transport: 'udp'
//             //transport: 'tcp'
//             transport: 'tls'
//         });
    
//         uaAlice.on('registered', function() {
//             uaAlice.unregister();
//         });
    
//         uaAlice.on('unregistered', function(response, err) {
//             // setTimeout(function() {
//                 uaAlice.stop();
    
//                 if (err) {
//                     done(err);
//                 } else {
//                     done();
//                 }
//             // }, 1000);
//         });
//         uaAlice.start();
//     });
// });

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

    it('Call MARS <- WS', (done) => {
        startMars();

        // ********************** 1 **************************
        let ua3 = new SIP.UA({
            uri: 'sip:3@' + hostIp,
            user: '3',
            password: '3',
            wsServers: ['ws://' + hostIp + ':8506'],
            register: true,
            mediaHandlerFactory: SIP.RTP.MediaHandler.defaultFactory,
            registerExpires: 20,
            transport: 'ws'
        });
        let logger = ua3.getLogger('test');
        let registerUa3 = false;
        let inData = Buffer(0);
        let minPacketSize = 4000;
        let timer;
        let dataToCheck = '157157157';

        ua3.on('registered', () => {
            if (!registerUa3) {
                registerUa3 = true;

                // ****** Исходящий звонок ****** //
                const EventEmitter = require('events');
                const stream = new EventEmitter();

                let options = {
                    media: {
                        stream: stream
                    }
                };

                let session = ua3.invite('sip:1@' + hostIp, options);

                ua3.on('message', function(msg) {
                    console.log('Get sip message', msg.body);
                    if (msg.body == dataToCheck) {
                        done();
                    } else {
                        done('SIP message does not match the correct');
                    }
                    // stopMars();
                });

                // ****** Воспроизведение входящего потока ****** //
                var flagStopWrite = false;
                var remoteStream = session.getRemoteStreams();

                let fileNameRemoteStream = '/media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';
                // let writeStream = fs.createWriteStream(fileNameRemoteStream);

                remoteStream.on('data', (data) => {
                    var newData = new Buffer(data.length - 12);
                    data.copy(newData, 0, 12);

                    if (!flagStopWrite) {
                        let totalLength = inData.length + data.length;
                        inData = Buffer.concat([inData, data], totalLength);
                    }

                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        if ( flagStopWrite || (inData.length < minPacketSize) ) {
                            stream.emit('data', newData);
                            return;
                        }

                        flagStopWrite = true;
                        console.log('Начали воспроизведение полученного потока. Длина записи', inData.length);

                        stream.emit('data', inData);

                        let player_1 = require("./node_modules/mars/lib/media/player");
                        let player = new player_1.Player();

                        player.on('buffer', (data) => {
                            console.log('data', data.length);

                            var newData = new Buffer(data.length - 12);
                            data.copy(newData, 0, 12);

                            // newData = new Buffer( convertoUlawToPcmu(newData) );

                            let rtcBuffer = new Buffer(newData.length);
                            newData.copy(rtcBuffer);

                            stream.emit('data', newData);
                        });
                    }, 500);
                });

                setTimeout(() => {
                    let dtmfArray = dataToCheck.split('');
                    dtmfArray.push(0);
                    dtmfArray.forEach( (dtmf) => {
                        session.dtmf(dtmf);
                    });
                }, 3000);
            }
        });
    }).timeout(70000);
});





// describe('Call and Message Tests Echo', function() {
//     let SIP = require('sip.client');
//     let g711 = new (require(__dirname + '/node_modules/mars/lib/media/G711').G711)();
//     let player_1 = require(__dirname + '/node_modules/mars/lib/media/player');
//     let file = __dirname + '/media/Добро_пожаловать_в демонстрацию_системы_MARS.wav';
//     let hostIp = '127.0.0.1';

//     // ********************** Общие функции для группы тестов **************************
//     function convertoUlawToPcmu(buffer) {
//         var l = buffer.length;
//         var buf = new Int16Array(l);

//         while (l--) {
//             buf[l] = g711.ulaw2linear(buffer[l]); //convert to pcmu
//         }

//         return buf.buffer;
//     }

//     it('Call and Message MARS <- UDP', (done) => {
//         startMars();

//         setTimeout(() => {
//             // ********************** 1 **************************
//             let ua1 = new SIP.UA({
//                 uri: 'sip:1@' + hostIp,
//                 user: '1',
//                 password: '1',
//                 // wsServers: ['ws://' + hostIp + ':8506'],
//                 wsServers: ['udp://' + hostIp + ':5060'],
//                 // wsServers: ['tcp://' + hostIp + ':5060'],
//                 // wsServers: ['tls://' + hostIp + ':5061'],
//                 register: true,
//                 //mediaHandlerFactory: SIP.WebRTC.MediaHandler.defaultFactory,
//                 mediaHandlerFactory: SIP.RTC.MediaHandler.defaultFactory,
//                 //mediaHandlerFactory: SIP.WRTC.MediaHandler.defaultFactory,
//                 registerExpires: 60,
//                 //transport: 'ws'
//                 transport: 'udp'
//                     //transport: 'tcp'
//                     //transport: 'tls'
//             });
//             let logger = ua1.getLogger('test');
//             let outData = Buffer(0);
//             let inData = Buffer(0);

//             setTimeout(() => {
//                 // ****** Исходящий звонок ****** //
//                 const EventEmitter = require('events');

//                 const stream = new EventEmitter();

//                 let options = {
//                     media: {
//                         stream: stream
//                     }
//                 };

//                 let session = ua1.invite('sip:2@' + hostIp, options);

//                 // ****** Воспроизведение входящего потока ****** //
//                 var remoteStream = session.getRemoteStreams();
//                 remoteStream.on('data', (data) => {

//                     let totalLength = inData.length + data.length;
//                     inData = Buffer.concat([inData, data], totalLength);

//                 });

//                 setTimeout(() => {
//                     let player = new player_1.Player();

//                     player.on('buffer', (data) => {
//                         var newData = new Buffer(data.length - 12);
//                         data.copy(newData, 0, 12);

//                         let rtcBuffer = new Buffer(newData.length);
//                         newData.copy(rtcBuffer);

//                         let totalLength = outData.length + rtcBuffer.length;
//                         outData = Buffer.concat([outData, rtcBuffer], totalLength);

//                         stream.emit('data', newData);
//                     });

//                     player.emit('start_play', {
//                         params: {
//                             file: file
//                         }
//                     });

//                     player.on('event', (data) => {
//                     });
//                 }, 1000);



//             }, 2000);
//         }, 10000);
//     }).timeout(70000);
// });

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