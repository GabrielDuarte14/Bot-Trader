//Instantiate Websocket module

const WebSocket = require('ws');
var moment = require('moment');
const CREDENCIAIS = require('./credenciais')
const email = CREDENCIAIS.email;
const senha = CREDENCIAIS.senha;
//WebSocketAPI Address
var wsAddress = 'wss://api.foxbit.com.br/';
var authenticated = false;
//Message Frame
var messageFrame = {

    "m": 0, //MessageType ( 0_Request/1_Reply/2_Subscribe /3_Event /4_Unsubscribe /Error )
    "i": 0, //Sequence Number
    "n": "", //Endpoint
    "o": "" //Payload
}

var payload = {
    /*
        "APIKey": CREDENCIAIS.APIKey,
        "Signature": CREDENCIAIS.Signature,
        "UserId": CREDENCIAIS.UserId,
        "Nonce": CREDENCIAIS.Nonce
    */
};

//Setup WebSocket client Address
var ws = new WebSocket(wsAddress);
const autoReconnectDelay = 5000

const connectToWSS = () => {
    var ws = new WebSocket('ws://localhost:8000')

    ws.on('close', () => {
        
        clearTimeout(ws.pingTimeout)
        setTimeout(() => {
            ws.removeAllListeners()
            ws = connectToWSS()
        }, autoReconnectDelay)
    })

    ws.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            ws.removeAllListeners()
            ws = (connectToWSS()).ws
        }

        
    })
    
    return ws
}

connectToWSS()


ws.on('open', function open() {

    console.log('Conected');
   



});

process.stdin.on('readable', async () => {
    // reads what is being typed. 
    let variable = process.stdin.read();
    // trying to read 
    variable = variable.toString().replace(/\n/, "");
    variable = variable.replace(/\r/, "");
    if (variable == 1) {

        login();
        setTimeout(() => {
            instruments();
            //42
        }, 2000);

    }
});

//Event Receiving Message
ws.on('message', function incoming(data) {

    //data contém o payload de resposta

    var resultado =JSON.parse(data.toString())
   // console.log(resultado)

    if(resultado.n == "GetOpenOrders"){
        resultado = JSON.parse(resultado.o)
        console.log(resultado[0])
    }
   console.log(resultado)

    
});

//Event Close Message
ws.on('close', function () {

    console.log('Connection Closed');

});
//Event Error Message
ws.on('error', function () {

    console.log('Error');

});

async function login() {
    //Indique para qual endpoint será enviado.
    messageFrame.n = "AuthenticateUser"
    payload.APIKey = CREDENCIAIS.APIKey
    payload.Signature = CREDENCIAIS.Signature
    payload.UserId = CREDENCIAIS.UserId
    payload.Nonce = CREDENCIAIS.Nonce



    //Adicione o payload referente ao endpoint indicado
    messageFrame.o = JSON.stringify(payload);

    ws.send(JSON.stringify(messageFrame), function ack(error) {

        //Se encontrar erros, dispara
        console.log(error);

        if (error == undefined) {
            authenticated = true;
        }
    });

}
function SendOrder(){
    messageFrame.n = 'SendOrder';
    var requestPayload = {
            'AccountId': CREDENCIAIS.UserId,
            'ClientOrderId': 0,
            'Quantity': 2.15,
            'DisplayQuantity': 0,
            'UseDisplayQuantity': true,
            'LimitPrice': 2.015,
            'OrderIdOCO': 0,
            'OrderType': 2,     //ORDEM A MERCADO = 1
            'PegPriceType': 1,
            'InstrumentId': 42,
            'TrailingAmount': 1.0,
            'LimitOffset': 2.0,
            'Side': 0,
            'StopPrice': 0,
            'TimeInForce': 1,
            'OMSId': 1,
    };
    messageFrame.o = JSON.stringify(requestPayload);
    //console.log('\r\n-> ' + JSON.stringify(messageFrame));
    ws.send(JSON.stringify(messageFrame), function ack(error) {
        ws = new WebSocket('wss://api.foxbit.com.br/')
        console.log('SendOrder.error: (' + error + ')');
    });
}

function webLogin() {
    //Indique para qual endpoint será enviado.
    var payload = {

        "UserName": CREDENCIAIS.email,
        "Password": CREDENCIAIS.senha

    };
    messageFrame.n = "WebAuthenticateUser"

    //Adicione o payload referente ao endpoint indicado
    messageFrame.o = JSON.stringify(payload);

    ws.send(JSON.stringify(messageFrame), function ack(error) {

        //Se encontrar erros, dispara
        console.log(error);

    });
}
function instruments(){
    messageFrame.n = 'GetTickerHistory';
    var agora = new Date();
   // console.log(hora)
    requestPayload2 = {
        "InstrumentId": 42,
        "Interval": 60,
        "FromDate": "2022-03-27T21:25:00",
        "ToDate": "2022-03-27T21:26:00",
    };
    messageFrame.o = JSON.stringify(requestPayload2);
    ws.send(JSON.stringify(messageFrame), function ack(error) {
        console.log('GetOpenOrders.error: (' + error + ')');

    });
}
function dados() {

    messageFrame.n = 'GetOpenOrders';
    requestPayload2 = {
        "OMSId": 1,
        "AccountId": 7606362816437430,

    };
    messageFrame.o = JSON.stringify(requestPayload2);
    ws.send(JSON.stringify(messageFrame), function ack(error) {
        console.log('GetOpenOrders.error: (' + error + ')');

    });
    SendOrder();

}

