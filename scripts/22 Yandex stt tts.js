exports.src = {
    mark: 'Начало',
    dtmfOn: true,
    recOn: true,
    on: {'opt': {
        seq: true, 
        endSeq: '0', 
        model:'numbers', 
        textFilter:'(\\d+)',
        developer_key: ""
    },
        '^\\d+$': {
            ttsPlay: {
                key: "",
                text: function(self) {
                    let text = self.session.dtmfTime[0].keys;
                    console.log('TTS PLAY ', text);
                    return text;
                },
                next: {
                    sttOn: {'opt': {model:'general'},
                        '^\\d+$': {
                            sendMESSAGE: { text: '<sttText>' }
                        }
                    }
                }
            },
        }
    }
}