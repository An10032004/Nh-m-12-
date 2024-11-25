(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
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
    var socket = io('/user-namespace',{
        auth:{
            token:userData._id
        }
    })

    $(document).ready(function(){

        $('.user-list').click(function(){
            var userId = $(this).attr('data-id')
            receiver_id = userId
            $('.start-head').hide();
            $('.chat-section').show();
                
            socket.emit('existsChat',{sender_id:sender_id,receiver_id:receiver_id})
        })

        
        
    }); 
    // UserOnline status
    socket.on('getOnlineUser',function(data){
        $('#'+data.user_id+'-status').text('Online')
        $('#'+data.user_id+'-status').removeClass('offline-status')
        $('#'+data.user_id+'-status').addClass('online-status')
    })

    socket.on('getOfflineUser',function(data){
        $('#'+data.user_id+'-status').text('Offline')
        $('#'+data.user_id+'-status').addClass('offline-status')
        $('#'+data.user_id+'-status').removeClass('online-status')
    })

    // chat save 
        $('#chat-form').submit(function(event){
            event.preventDefault()
            var message =$('#message').val()
            
            $.ajax({
                url:'/save-chat',
                type:'POST',
                data:{sender_id:sender_id,receiver_id:receiver_id,message:message},
                success:function(response){
                    if(response.success){
                        
                        $('#message').val('')
                        let chat = response.data.message
                        let html = `
                            <div class="current-user-chat" id='`+response.data._id+`'>
                                <h5 > <span>`+chat+`</span> 
                                    
                                    <i class="fa fa-trash" aria-hidden="true" data-id='`+response.data._id+`' data-toggle="modal" data-target="#deleteChatModel"></i>
                                    <i class="fa fa-edit" aria-hidden="true" data-id='`+response.data._id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#editChatModel"></i>
                                    </h5>
                            </div>
                            `
                            $('.chat-container').append(html)
                            socket.emit('newChat',response.data)
                            scrollChat()
                        }else{
                        alert(data.msg)
                    }
                }
            })
        })
        socket.on('loadNewChat',function(data){
            if(sender_id == data.receiver_id && receiver_id == data.sender_id){
                let html = `
                <div class="distance-user-chat" id='`+data.id+`'>
                    <h5 ><span> `+data.message+` </span> </h5>
                </div>
                `
                $('.chat-container').append(html)
            }
        })
        socket.on('loadChats',function(data){
            $('.chat-container').html('')
            var chats = data.chats
            let html = ''

            for(let x = 0 ; x < chats.length;x++){
                let addClass = ''
                if(chats[x]['sender_id'] == sender_id){
                    addClass = "current-user-chat"
                }
                else{
                    addClass = "distance-user-chat"
                }
                html += `
                     <div class='`+addClass+`' id= '`+chats[x]['_id']+`'>
                                <h5 > <span>`+chats[x]['message']+` </span>`
                
                  if(chats[x]['sender_id']== sender_id){
                    html += `<i class="fa fa-trash" aria-hidden="true" data-id='`+chats[x]['_id']+`' data-toggle="modal" data-target="#deleteChatModel"></i>
                        <i class="fa fa-edit" aria-hidden="true" data-id='`+chats[x]['_id']+`' data-msg='`+chats[x]['message']+`' data-toggle="modal" data-target="#editChatModel"></i>
    
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
        
        function scrollChat(){
            $('.chat-container').animate({
                scrollTop:$('.chat-container').offset().top + $('.chat-container')[0].scrollHeight
            },0)
        }
        $(document).on('click','.fa-trash',function(){
            let msg = $(this).parent().text()
            $('#delete-message').text(msg)

            $('#delete-message-id').val($(this).attr('data-id'))
        })

        $('#delete-chat-form').submit(function(event){
            event.preventDefault()
            var id = $('#delete-message-id').val()

            $.ajax({
                url:'/delete-chat',
                type:'DELETE',
                data:{id:id},
                success: function(res){
                    if(res.success == true){
                        $('#'+id).remove()
                        $('#deleteChatModel').modal('hide')
                        socket.emit('chatDeleted',id)
                    }else{
                        alert(res.msg)
                    }
                }
            })
        })

        socket.on('chatMessageDeleted',function(id){
            $('#'+id).remove()
        })

        $(document).on('click','.fa-edit',function(){
            $('#edit-message-id').val( $(this).attr('data-id') )
            $('#update-message').val( $(this).attr('data-msg') )
        })

        $('#update-chat-form').submit(function(event){
            event.preventDefault()
            var id = $('#edit-message-id').val()
            var msg = $('#update-message').val()

            $.ajax({
                url:'/update-chat',
                type:'PATCH',
                data:{id:id,message:msg},
                success: function(res){
                    if(res.success == true){
                        
                        $('#editChatModel').modal('hide')
                        $('#' +id).find('span').text(msg)
                        $('#' +id).find('.fa-edit').attr('data-msg',msg)
                        socket.emit('chatUpdated',{id:id,message:msg})
                    }else{
                        alert(res.msg)
                    }
                }
            })
        })  

        socket.on('chatMessageUpdated',function(data){
            $('#' +data.id).find('span').text(data.message)
        })


$(".addMember").click(function(){
    var id = $(this).attr('data-id')
    var limit = $(this).attr('data-limit')

    $('#group_id').val(id)
    $('#limit').val(limit)

    $.ajax({
        url:'/get-members',
        type:'POST',
        data:{group_id:id},
        success:function(res){
            if(res.success == true){
                console.log(res)
                let users = res.data;
                let html = '';
                for(let i = 0 ;  i < users.length;i++){

                    let isMemberOfGroup = users[i]['member'].length > 0 ? true : false

                    html+=`
                        <tr>
                            <td>
                                <input type="checkbox" `+(isMemberOfGroup?'checked':'')+` name="members[]" value="`+users[i]['_id']+`"/>
                            </td>

                            <td>`+users[i]['name']+`</td>
                        </tr>
                    `
                }
                $('.addMemberTable').html(html)
            }else{
                alert(res.msg)
            }
        }
    })
})

$('#add-member-form').submit(function(event){
    event.preventDefault()

    var formData = $(this).serialize()

    $.ajax({
        url:"/add-members",
        type:"POST",
        data:formData,
        success: function(res){
            
            if(res.success){
                
                $('#memberModel').modal('hide')
                $('#add-member-form')[0].reset()
                alert(res.msg)
            }else{
                $('#add-member-error').text(res.msg)
                setTimeout(() =>{
                    $('#add-member-error').text('')
                },3000)
            }
        }
    })
})


//update group

$('.updateMember').click(function(){
    var obj = JSON.parse($(this).attr('data-obj'))


    $('#update_group_id').val(obj._id)
    $('#last_limit').val(obj.limit)
    $('#group_name').val(obj.name)
    $('#group_limit').val(obj.limit)
})


$('#updateChatGroupForm').submit(function(e){
    e.preventDefault()
    $.ajax({
        url:'/update-chat-group',
        type:'POST',
        data: new FormData(this),
        contentType:false,
        cache:false,
        processData:false,
        success:function(res){
            alert(res.msg)
            if(res.success){
                location.reload()
            }
        }
    })
})

//del chatGroup

$('.deleteGroup').click(function(){
    $('#delete_group_id').val($(this).attr('data-id'))
    $('#delete_group_name').text($(this).attr('data-name'))
})

$('#deleteChatGroupForm').submit(function(e){
    e.preventDefault()

    var formData = $(this).serialize()

    $.ajax({
        url:'/delete-chat-group',
        type:'POST',
        data:formData,
        success:function(res){
            alert(res.msg)
            if(res.success){
                location.reload()
            }
        }
    })
})

//sharelink

$('.copy').click(function(){
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
    },2000)
})

//joinGroup

$('.join-now').click(function(){
    $(this).text("Wait...")
    $(this).attr('disabled','disabled')
    var group_id = $(this).attr('data-id')

    $.ajax({
        url:'/join-group',
        type:"POST",
        data:{group_id},
        success:function(res){
            alert(res.msg)
            if(res.success){
                location.reload()
            }
            else{
                
                $(this).text('Join')
                $(this).removeAttr('disabled')
            }
        }
    })
})

//search
const formSearch = document.querySelector("#form-search")
if(formSearch) {
  let url = new URL(window.location.href);
  formSearch.addEventListener("submit", (e) => {
  e.preventDefault();

  const search = e.target.elements.keyword.value;
 
  if (search){
    url.searchParams.set("keyword", search );
  }
  else {
    url.searchParams.delete("keyword");
  }
  window.location.href = url.href
})
}

//groupChat
$('.group-list').click(function(){
    $('.group-start-head').hide();
    $('.group-chat-section').show();
})
