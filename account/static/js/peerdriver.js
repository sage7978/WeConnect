var lastPeerId = null;
var peer = null; 
var conn = null;
var savedpeer = null;

var chat_area = $('.chat-area');
var intro_content = $('.intro-content');

var loading_icon = $('.loading-icon');
var current_active_person = -1;

var count = 0;


function addMessage(msg){
    $('.msg_show').append('<p>' + msg + '</p>');
}
    
function initialize() {
        peer = new Peer(null, {
        debug: 2
    });

    peer.on('open', function (id) {
        if (peer.id === null) {
            console.log('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }

        console.log('ID: ' + peer.id);
        addMessage('ID: ' + peer.id);
        driver(peer.id);
    });
    peer.on('connection', function (c) { // commented out for debug
        // if (conn && conn.open) {
        //     c.on('open', function() {
        //         c.send("Already connected to another client");
        //         setTimeout(function() { c.close(); }, 200);
        //     });
        //     return;
        // }
        conn = c;
        console.log("Connected to: " + conn.peer);
        connected();
        chat_area.toggle();
        ready();
    });
    peer.on('disconnected', function () {
        status.innerHTML = "Connection lost. Please reconnect";
        console.log('Connection lost. Please reconnect');
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;
        peer.reconnect();
    });
    peer.on('close', function() {
        conn = null;
        status.innerHTML = "Connection destroyed. Please refresh";
        console.log('Connection destroyed');
    });
    peer.on('error', function (err) {
        console.log(err);
        alert('' + err);
    });
};

function ready() {
    conn.on('data', function (data) {
        console.log("Data recieved: " + data);
        console.log("I am ready");
        var cueString = "<span class=\"cueMsg\">Cue: </span>";
        switch (data) {
            case 'Off':
                if(conn)conn.close();
                console.log("Disconnected");
                window.location = '/';
                break;
            default:
                add_to_peer_msg(data);
                break;
        };
    });
    conn.on('close', function () {
        conn = null;
        alert("Peer closed the connection.")
        window.location = '/';
    });
}

function join(recvIdInput) {
    if (conn) {
        conn.close();
    }

    conn = peer.connect(recvIdInput, {
        reliable: true
    });
    //console.log(conn.peer);
    //console.log("A phase");
    conn.on('open', function () {
        //console.log("B phase");
        console.log("Connected to: " + conn.peer);
        connected();
        chat_area.toggle();
    });
    // Handle incoming data (messages only since this is the signal sender)
    conn.on('data', function (data) {
        console.log("Data recieved: " + data);
        var cueString = "<span class=\"cueMsg\">Cue: </span>";
        console.log("I am join");
        switch (data) {
            case 'Off':
                if(conn)conn.close();
                console.log("Disconnected");
                window.location = '/';
                break;
            default:
                add_to_peer_msg(data);
                break;
        };
    });
    conn.on('close', function () {
        conn = null;
        console.log("Connection closed!!");
        alert("Peer closed the connection.")
        window.location = '/';
    });
};


function off(){
    if (conn) {
        send("Off");
        conn.close();
        alert("Disconnected");
    }
}


// function wait() {
//     conn.on('data', function (data) {
//         console.log("Data recieved");
//         addMessage("<span class=\"peerMsg\">Peer: </span>" + data);      
//     });
//     conn.on('close', function () {
//         status.innerHTML = "Connection reset<br>Awaiting connection...";
//         conn = null;
//     });
// }

function sendTheStatus(msg_x){
    if (conn) {
        conn.send(msg_x);
        console.log("Sent: " + msg_x);
    } else {
        console.log('Connection is closed');
    }
}

function send(msg_x){
    if (conn) {
        conn.send(msg_x);
    } else {
        console.log('Connection is closed');
    }
}


function add_to_my_msg(msg_val){
    if(current_active_person==0){
        $('.only-chats').append('<div class="right-container"><div class="right-text msg"><span class="you-text"><em>You </em></span><br>'+ msg_val +'</div><div class="right-shape"></div></div>');
        
    }
    else{
        $('.only-chats').append('<div class="right-container"><div class="right-text msg"><span class="you-text"><em>You </em></span><br>'+ msg_val +'</div><div class="right-shape-null"></div></div>');
        
    }
    scrollSmoothToBottom('scrollChat');
    current_active_person = 1;
    send(msg_val);
}

function add_to_peer_msg(msg_val){
    if(current_active_person==1){
        $('.only-chats').append('<div class="left-container"><div class="left-shape"></div><div class="left-text msg"><span class="stranger-text"><em>Stranger </em></span><br>'+ msg_val +'</div></div>');
        
    }
    else{
        $('.only-chats').append('<div class="left-container"><div class="left-shape-null"></div><div class="left-text msg"><span class="stranger-text"><em>Stranger </em></span><br>'+ msg_val +'</div></div>');
        
    }
    scrollSmoothToBottom('scrollChat');
    current_active_person = 0;
}

function scrollSmoothToBottom (id) {
   //document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'end' });
    //document.getElementById(id).scrollIntoView(false);
    setTimeout(() => {
        var objDiv = document.getElementById(id);
        objDiv.scrollTop = objDiv.scrollHeight
      },
      0)
}

function connected(){
    console.log("Here");
    loading_icon.toggle();
    intro_content.empty();
    intro_content.append("<div class='intro-header'>Woah, You are connected.</div><p>Say Hello!!!</p>");
}

function ajax_call(peerid){
          //console.log(page_n);
          //initialize();
    $.ajax({
            type: "GET",
            url: "/pair/", // name of url
            data : {    
                id : peerid, //page_number
            },
        success: function (data) {
            console.log(data);
            if(data.status=="join"){
                join(data.peer_id);
            }
            else if(data.status=="wait"){
            }
            else if(data.status =="error"){
            console.log(data.expand);
            }
        },
        error: function () {}
    });
}


function driver(peerid){
    ajax_call(peerid);
}