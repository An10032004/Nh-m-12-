
(function ($) {

    "use strict";

    var fullHeight = function () {

        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });

    };
    fullHeight();

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

})(jQuery);

// dynamic chat app 

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
var userData = JSON.parse(getCookie('user'))

var sender_id = userData._id
var receiver_id
var global_group_id
var socket = io('/user-namespace', {
    auth: {
        token: userData._id
    }
})

$(document).ready(function () {

    $('.user-list').click(function () {
        var userId = $(this).attr('data-id')
        receiver_id = userId
        var userName = $(this).find('.user-status + div').contents().first().text().trim();
        var userImage = $(this).find('img').attr('src');
        var isOnline = $(this).find('.status-dot').hasClass('online');
        $('.chat-section').removeClass('animate');
        void $('.chat-section')[0].offsetWidth; // Reset layout để kích hoạt lại animation
        $('.chat-section').addClass('animate');

        $('.start-head').hide();
        $('.chat-section').show();

        $('.selected-user').html(`
            <div class="user-status">
                <img src="${userImage}" alt="${userName}" class="user-image">
                <span class="status-dot ${isOnline ? 'online' : 'offline'}" aria-hidden="true"></span>
            </div>
            <span class="selected-user-name" style="margin-right:30px">${userName}</span> <div class="inner-list-typing"></div>
            <span class="sr-only">${isOnline ? 'Online' : 'Offline'}</span>
        `);

        socket.emit('existsChat', { sender_id: sender_id, receiver_id: receiver_id })
        
    })



});
// UserOnline status
socket.on('getOnlineUser', function (data) {
    $('#' + data.user_id + '-status').text('Online');
    $('#' + data.user_id + '-dot').removeClass('offline').addClass('online');
});

socket.on('getOfflineUser', function (data) {
    $('#' + data.user_id + '-status').text('Offline');
    $('#' + data.user_id + '-dot').removeClass('online').addClass('offline');
});

// chat save 
$('#chat-form').submit(function (event) {
    event.preventDefault()
    var message = $('#message').val()

    $.ajax({
        url: '/save-chat',
        type: 'POST',
        data: { sender_id: sender_id, receiver_id: receiver_id, message: message },
        success: function (response) {
            if (response.success) {

                $('#message').val('')
                let chat = response.data.message
                let html = `
                            
                            <div class="current-user-chat" id='`+ response.data._id + `'>
                                <h5 > <span>`+ chat + `</span> 
                                    
                                    <i class="fa fa-trash" aria-hidden="true" data-id='`+ response.data._id + `' data-toggle="modal" data-target="#deleteChatModel"></i>
                                    <i class="fa fa-edit" aria-hidden="true" data-id='`+ response.data._id + `' data-msg='` + chat + `' data-toggle="modal" data-target="#editChatModel"></i>
                                    </h5>
                            </div>
                            `
                $('.chat-container').append(html)
                socket.emit('newChat', response.data)
               
                scrollChat()
            } else {
                alert(data.msg)
            }
        }
    })
})

import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'
const buttonIcon = document.querySelector(".button-icon");
if (buttonIcon) {
    const tooltip = document.querySelector('.tooltip')
    Popper.createPopper(buttonIcon, tooltip);
    buttonIcon.onclick = () => {
        tooltip.classList.toggle('shown')
    }
}

const emojiPicker = document.querySelector("emoji-picker")
if (emojiPicker) {
    const inputChat = document.querySelector("#message")
    emojiPicker.addEventListener("emoji-click", event => {
        const icon = event.detail.unicode
        inputChat.value = inputChat.value + icon

        socket.emit("CLIENT_SEND_TYPING", "show")
        setTimeout(() => {
            socket.emit("CLIENT_SEND_TYPING","hidden")
        },3000)
        })
        
    inputChat.addEventListener("keyup", () => {
    socket.emit("CLIENT_SEND_TYPING", "show")
        setTimeout(() => {
            socket.emit("CLIENT_SEND_TYPING","hidden")
        },3000)
})
    }


//typing 
const elementListTyping = document.querySelector(".inner-list-typing");
socket.on("SERVER_RETURN_TYPING", (data) => {
    if (data.type == "show") {
        const existListTyping = elementListTyping.querySelector(`[user-id="${data.userId}"]`)

        if (!existListTyping) {
            const boxTyping = document.createElement("div")
            boxTyping.classList.add("box-typing")
            boxTyping.setAttribute("user-id", data.userId)
            boxTyping.innerHTML = `
            <div class="inner-name"></div>
                <div class="inner-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
        `
            elementListTyping.appendChild(boxTyping);
        }else{
            const boxRemove = elementListTyping.querySelector(`[user-id="${data.userId}"]`)
            if(boxRemove){
                elementListTyping.removeChild(boxRemove)
            }
        }


    }
})

socket.on('loadNewChat', function (data) {
    console.log(data.receiver_id)
    console.log(sender_id)
    if (sender_id == data.receiver_id && receiver_id == data.sender_id) {
        
        let html = `
                <div class="distance-user-chat" id='`+ data.id + `'>
                    <h5 ><span> `+ data.message + ` </span> </h5>
                </div>
                `
        $('.chat-container').append(html)
    }
})
socket.on('loadChats', function (data) {
    $('.chat-container').html('')
    var chats = data.chats
    let html = ''

    for (let x = 0; x < chats.length; x++) {
        let addClass = ''
        if (chats[x]['sender_id'] == sender_id) {
            addClass = "current-user-chat"
        }
        else {
            addClass = "distance-user-chat"
        }
        html += `
                     <div class='`+ addClass + `' id= '` + chats[x]['_id'] + `'>
                                <h5 > <span >`+ chats[x]['message'] + ` </span>`

        if (chats[x]['sender_id'] == sender_id) {
            html += `<i class="fa fa-trash" aria-hidden="true" data-id='` + chats[x]['_id'] + `' data-toggle="modal" data-target="#deleteChatModel"></i>
                        <i class="fa fa-edit" aria-hidden="true" data-id='`+ chats[x]['_id'] + `' data-msg='` + chats[x]['message'] + `' data-toggle="modal" data-target="#editChatModel"></i>
    
                        `
        }

        html += `
                 </h5>
                    
                    </div>
                
                `


    }
    $('.chat-container').append(html)
    scrollChat()
})

function scrollChat() {
    $('.chat-container').animate({
        scrollTop: $('.chat-container').offset().top + $('.chat-container')[0].scrollHeight
    }, 0)
}
$(document).on('click', '.fa-trash', function () {
    let msg = $(this).parent().text()
    $('#delete-message').text(msg)

    $('#delete-message-id').val($(this).attr('data-id'))
})

$('#delete-chat-form').submit(function (event) {
    event.preventDefault()
    var id = $('#delete-message-id').val()

    $.ajax({
        url: '/delete-chat',
        type: 'DELETE',
        data: { id: id },
        success: function (res) {
            if (res.success == true) {
                $('#' + id).remove()
                $('#deleteChatModel').modal('hide')
                socket.emit('chatDeleted', id)
            } else {
                alert(res.msg)
            }
        }
    })
})

socket.on('chatMessageDeleted', function (id) {
    $('#' + id).remove()
})

$(document).on('click', '.fa-edit', function () {
    $('#edit-message-id').val($(this).attr('data-id'))
    $('#update-message').val($(this).attr('data-msg'))
})

$('#update-chat-form').submit(function (event) {
    event.preventDefault()
    var id = $('#edit-message-id').val()
    var msg = $('#update-message').val()

    $.ajax({
        url: '/update-chat',
        type: 'PATCH',
        data: { id: id, message: msg },
        success: function (res) {
            if (res.success == true) {

                $('#editChatModel').modal('hide')
                $('#' + id).find('span').text(msg)
                $('#' + id).find('.fa-edit').attr('data-msg', msg)
                socket.emit('chatUpdated', { id: id, message: msg })
            } else {
                alert(res.msg)
            }
        }
    })
})

socket.on('chatMessageUpdated', function (data) {
    $('#' + data.id).find('span').text(data.message)
})


$(".addMember").click(function () {
    var id = $(this).attr('data-id')
    var limit = $(this).attr('data-limit')

    $('#group_id').val(id)
    $('#limit').val(limit)

    $.ajax({
        url: '/get-members',
        type: 'POST',
        data: { group_id: id },
        success: function (res) {
            if (res.success == true) {
                console.log(res)
                let users = res.data;
                let html = '';
                for (let i = 0; i < users.length; i++) {

                    let isMemberOfGroup = users[i]['member'].length > 0 ? true : false

                    html += `
                        <tr>
                            <td>
                                <input type="checkbox" `+ (isMemberOfGroup ? 'checked' : '') + ` name="members[]" value="` + users[i]['_id'] + `"/>
                            </td>

                            <td>`+ users[i]['name'] + `</td>
                        </tr>
                    `
                }
                $('.addMemberTable').html(html)
            } else {
                alert(res.msg)
            }
        }
    })
})

$('#add-member-form').submit(function (event) {
    event.preventDefault()

    var formData = $(this).serialize()

    $.ajax({
        url: "/add-members",
        type: "POST",
        data: formData,
        success: function (res) {

            if (res.success) {

                $('#memberModel').modal('hide')
                $('#add-member-form')[0].reset()
                alert(res.msg)
            } else {
                $('#add-member-error').text(res.msg)
                setTimeout(() => {
                    $('#add-member-error').text('')
                }, 3000)
            }
        }
    })
})


//update group

$('.updateMember').click(function () {
    var obj = JSON.parse($(this).attr('data-obj'))


    $('#update_group_id').val(obj._id)
    $('#last_limit').val(obj.limit)
    $('#group_name').val(obj.name)
    $('#group_limit').val(obj.limit)
})


$('#updateChatGroupForm').submit(function (e) {
    e.preventDefault()
    $.ajax({
        url: '/update-chat-group',
        type: 'POST',
        data: new FormData(this),
        contentType: false,
        cache: false,
        processData: false,
        success: function (res) {
            alert(res.msg)
            if (res.success) {
                location.reload()
            }
        }
    })
})

//del chatGroup

$('.deleteGroup').click(function () {
    $('#delete_group_id').val($(this).attr('data-id'))
    $('#delete_group_name').text($(this).attr('data-name'))
})

$('#deleteChatGroupForm').submit(function (e) {
    e.preventDefault()

    var formData = $(this).serialize()

    $.ajax({
        url: '/delete-chat-group',
        type: 'POST',
        data: formData,
        success: function (res) {
            alert(res.msg)
            if (res.success) {
                location.reload()
            }
        }
    })
})

//sharelink

$('.copy').click(function () {
    $(this).prepend('<span class="copied_text">Copied</span>')


    var group_id = $(this).attr('data-id')

    var url = window.location.host + '/share-group/' + group_id

    var temp = $("<input>")
    $("body").append(temp)
    temp.val(url).select()
    document.execCommand('copy')


    temp.remove()

    setTimeout(() => {
        $('.copied_text').remove()
    }, 2000)
})

//joinGroup

$('.join-now').click(function () {
    $(this).text("Wait...")
    $(this).attr('disabled', 'disabled')
    var group_id = $(this).attr('data-id')

    $.ajax({
        url: '/join-group',
        type: "POST",
        data: { group_id },
        success: function (res) {
            alert(res.msg)
            if (res.success) {
                location.reload()
            }
            else {

                $(this).text('Join')
                $(this).removeAttr('disabled')
            }
        }
    })
})

//search
const formSearch = document.querySelector("#form-search")
if (formSearch) {
    let url = new URL(window.location.href);
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();

        const search = e.target.elements.keyword.value;

        if (search) {
            url.searchParams.set("keyword", search);
        }
        else {
            url.searchParams.delete("keyword");
        }
        window.location.href = url.href
    })
}

//groupChat
$('.group-list').click(function () {
    $('.group-start-head').hide();
    $('.group-chat-section').show();


    global_group_id = $(this).attr('data-id')

    loadGroupChat()
})

$('#group-chat-form').submit(function (event) {
    event.preventDefault()
    var message = $('#group-message').val()

    $.ajax({
        url: '/group-chat-save',
        type: 'POST',
        data: { sender_id: sender_id, group_id: global_group_id, message: message },
        success: function (response) {
            if (response.success) {

                $('#group-message').val('')
                let message = response.chat.message
                let html = `
                    <div class="current-user-chat"'`+ response.chat._id + `'>
                        
                        <h5 > <span>`+ message + `</span> 
                        <i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='`+response.chat._id+`' data-toggle="modal" data-target="#deleteGroupChatModel"></i>

                            
                            </h5>`

                            html+=`
                            </h5>`
                 

                    html+=`

                    </div>
                        `
                $('.group-chat-container').append(html)
                socket.emit('newGroupChat', response.chat)
                scrollChat()
            } else {

                // <i class="fa fa-edit" aria-hidden="true" data-id='`+response.data._id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#editChatModel"></i>
            }
        }
    })
})

socket.on('loadNewGroupChat', function (data) {
    if (global_group_id == data.group_id) {
        let html = `
            <div class="distance-user-chat" id='`+ data._id + `'>

                <div class='user-data'> 
                    <img src="`+data.sender_id.image+`" class='user-chat-image' />
                    <b>  ` +data.sender_id.name+`</b>
                </div>
                
            </div>
            `
            html += `
                <h5 > <span>`+ data.message + `</span> 
                    
                    
                    </h5>`

                
                
           
            
        $('.group-chat-container').append(html)
        scrollChat()
    }
})

function loadGroupChat() {
    $.ajax({
        url: '/load-group-chats',   
        type: 'POST',
        data: { group_id: global_group_id },
        success: function (res) {
            if (res.success) {
                var chats = res.chats
                var html = ''

                for (let i = 0; i < chats.length; i++) {
                    let ClassName = 'distance-user-chat'
                    if (chats[i]['sender_id']._id == sender_id) {
                        ClassName = 'current-user-chat'
                    }

                    if (chats[i]['sender_id']._id == sender_id) {
                        html+= `
                            <div class='user-data current-user-chat'><b>Me </b>  </div>
                        `
                    }else{
                        html+= `
                        <div class='user-data'> 
                            <img src="`+chats[i]['sender_id'].image+`" class='user-chat-image' />
                            <b>  ` +chats[i]['sender_id'].name+`</b>
                        </div>
                    `
                    }

                    html += `
                            <div class='`+ClassName+`' id='`+ chats[i]['_id'] + `'>
                    <h5 > <span>`+ chats[i]['message'] + `</span> `
                    
                    if (chats[i]['sender_id']._id == sender_id) {
                        html+=`<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='`+chats[i]['_id']+`' data-toggle="modal" data-target="#deleteGroupChatModel"></i>`
                    }

                        
                    html+=`
                        </h5>`

                        
                       
                    html+=` 
                </div>
                    `
                }
                $('.group-chat-container').html(html)
            } else {
                alert(res.msg)
            }
        }
    })
}

$(document).on('click','.deleteGroupChat',function(){
    var msg = $(this).parent().text()

    $('#delete-group-message').text(msg)
    $('#delete-group-message-id').val($(this).attr('data-id'))
})

$('#delete-group-chat-form').submit(function(e){
    e.preventDefault()
    var id =  $('#delete-group-message-id').val()

    $.ajax({
        url:"/delete-group-chats",
        type:'POST',
        data:{id:id},
        success:function(res){
            if(res.success){
                $('#' + id).remove()
                $('#deleteGroupChatModel').modal('hide')
                socket.emit('groupChatDeleted',id)
            }else{
                alert(res.msg)
            }
        }
    })
})

socket.on('groupChatMessageDeleted',function(id){
    $('#' + id).remove()
})

const chatBody = document.querySelector('.chat-body')
const messageInput = document.querySelector(".message-input")
const sendMessageButton = document.querySelector('#send-message')
const fileInput = document.querySelector('#file-input')
const fileUploadWrapper = document.querySelector('.file-upload-wrapper')
const fileCancelButton = document.querySelector('#file-cancel')
const API_KEY = "AIzaSyBlVff7YQiqJEj__Otj4JJZ0209JCeiy5A"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
const userdata = {
    message : null,
    file:{
        data:null,
        mime_type:null,
    }
}

const chatHistory = []

const createMessageElement = (content,...classes) => {
    const div = document.createElement('div')
    div.classList.add('message',...classes)
    div.innerHTML = content
    return div
}
const generateBotResponse =async (incomingMessageDiv) =>{
    const messageElement = incomingMessageDiv.querySelector('.message-text')
    chatHistory.push({
        role:"user",
        parts:[{text:userdata.message},...(userdata.file.data ? [{ inline_data :userdata.file}] : [])]
    }
    )
    const requestOptions = {
        method:'POST',
        headers : {'Content-Type': 'application/json'},
        body:JSON.stringify({
            contents: chatHistory
        })
    }
    
    try {
        const response = await fetch(API_URL,requestOptions)
        const data = await response.json()
        if(!response.ok) throw new Error(data.error.message)
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim()
        messageElement.innerText = apiResponseText

        chatHistory.push({
            role:"model",
            parts:[{text:apiResponseText}]})

    } catch (error) {
        console.log(error)
        messageElement.innerText = error.message
        messageElement.style.color = '#ff0000'
    }finally{
        userdata.file = {}
        incomingMessageDiv.classList.remove('thinking')
        chatBody.scrollTo({top:chatBody.scrollHeight})

    }
}
const handleOutgoingMessage = (e) => {
    e.preventDefault()
    userdata.message = messageInput.value.trim()
    messageInput.value = ""
    fileUploadWrapper.classList.remove('file-uploaded')

    const messageContent = `<div class="message-text"></div>
    ${userdata.file.data ? `<img src="data:${userdata.file.mime_type};base64,${userdata.file.data}" class="attachment" />` : ""} `
    const outgoingMessageDiv = createMessageElement(messageContent,'user-message')
     outgoingMessageDiv.querySelector('.message-text').textContent = userdata.message
    chatBody.appendChild(outgoingMessageDiv)
    chatBody.scrollTo({top:chatBody.scrollHeight})

    setTimeout(() =>{
        const messageContent = ` <div class="message bot-message">
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot">.</div>
                        <div class="dot">.</div>
                        <div class="dot">.</div>
                    </div>
                </div></div>`
        const incomingMessageDiv = createMessageElement(messageContent,'bot-message','thinking')
        chatBody.appendChild(incomingMessageDiv)
        chatBody.scrollTo({top:chatBody.scrollHeight})

        generateBotResponse(incomingMessageDiv)
    },600)
}


messageInput.addEventListener("keydown",(e) => {
    const userMessage = e.target.value.trim()
    if(e.key == 'Enter' && userMessage){
        handleOutgoingMessage(e)
    }
})

fileInput.addEventListener("change",()=>{
    const file = fileInput.files[0]
    if(!file) return
    const reader = new FileReader()

    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result
        fileUploadWrapper.classList.add("file-uploaded")
        const base64String = e.target.result.split(",")[1]
        
        userdata.file ={
            data:base64String,
            mime_type:file.type
        }
        console.log(userdata)
        fileInput.value = ""
    }
    reader.readAsDataURL(file)
})

fileCancelButton.addEventListener('click',() => {
    userdata.file = {}
    fileUploadWrapper.classList.remove('file-uploaded')
})

const picker = new EmojiMart.Picker({
    theme:"light",
    skinTonePosition:"none",
    previewPosition:"none",
    onEmojiSelect: (emoji)  => {
        const { selectionStart:start , selectionEnd:end} = messageInput;
        messageInput.setRangeText(emoji.native,start,end,"end")
        messageInput.focus()
    },
    onClickOutside : (e) => {
        if(e.target.id === 'emoji-picker'){
            document.body.classList.toggle('show-emoji-picker')
        }else{
            document.body.classList.remove('show-emoji-picker')

        }
    }

})
document.querySelector(".chat-form").appendChild(picker)


sendMessageButton.addEventListener("click",(e) =>handleOutgoingMessage(e))

document.querySelector('#file-upload').addEventListener('click',() => fileInput.click())



//game
let gameHasStarted = false;
var board = null
var game = new Chess()
var $status = $('#status')
var $pgn = $('#pgn')
let gameOver = false;

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false
    if (!gameHasStarted) return false;
    if (gameOver) return false;

    if ((playerColor === 'black' && piece.search(/^w/) !== -1) || (playerColor === 'white' && piece.search(/^b/) !== -1)) {
        return false;
    }

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop (source, target) {
    let theMove = {
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for simplicity
    };
    // see if the move is legal
    var move = game.move(theMove);


    // illegal move
    if (move === null) return 'snapback'

    socket.emit('move', theMove);

    updateStatus()
}

socket.on('newMove', function(move) {
    game.move(move);
    board.position(game.fen());
    updateStatus();
});

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    board.position(game.fen())
}

function updateStatus () {
    var status = ''

    var moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
    }

    else if (gameOver) {
        status = 'Opponent disconnected, you win!'
    }

    else if (!gameHasStarted) {
        status = 'Waiting for black to join'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
        
    }

    $status.html(status)
    $pgn.html(game.pgn())
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png'
}
board = Chessboard('myBoard', config)
if (playerColor == 'black') {
    board.flip();
}

updateStatus()

var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')) {
    socket.emit('joinGame', {
        code: urlParams.get('code')
    });
}

socket.on('startGame', function() {
    console.log('Game has started!');
    gameHasStarted = true;
    updateStatus()
});

socket.on('gameOverDisconnect', function() {
    gameOver = true;
    updateStatus()
});



