const socket = io()

// html m clent count k id ko yaha pe get krnge
const clientsTotal = document.getElementById('client-total')

// message form ko get karke change karnge
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const messageContainer =  document.getElementById('message-container')
const nameInput =  document.getElementById('name-input')
const messageForm =  document.getElementById('message-form')
const messageInput =  document.getElementById('message-input')

const messageTone = new Audio('/message-one.mp3')


loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();

    if (username ) {
      socket.emit('join', username);
      usernameInput.value = '';
      usernameInput.disabled = true;
      loginButton.disabled = true;
    }
  });

  socket.on('user-list', (users) => {
    userList.innerHTML = '';
    users.forEach((user) => {
      const userElement = document.createElement('li');
      userElement.innerText = user;
      userList.appendChild(userElement);
      localStorage.setItem(user,true)
    });
  });

  socket.on('nameinput', (name) => {
    nameInput.innerHTML = '';
    

  });


messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    sendMessage()
})

socket.on('clients-total' , (data)=>{
  clientsTotal.innerText = `Total Clients: ${data}`
})

const sendMessage =()=>{
    // agar jo ye input khali raha to hi  
    if(messageInput.value === '') return
    console.log(messageInput.value)
    // ab ham dataka format banaynge
    const data = {
        name:nameInput.value,
        message: messageInput.value,
        dateTime : new Date(),
    }
    // ye message hame custom event banaya hai
    socket.emit('message' , data)
    // calling for adding message to ui
    addMessageToUi(true ,data)
    // message bhejne k bad dobara input field khali
    messageInput.value =''
}

socket.on('chat-message' , (data)=>{
    // audio play krwa rhe h
    messageTone.play()
    console.log(data)
    addMessageToUi(false, data)
})

// message diusplay karne k liye ...left side m sender aur right side m apna
const addMessageToUi =(isOwnMessage , data)=>{
    clearFeedback()
    // isme mapping k help se sab dikha denge
    const element = `
    <li class="${isOwnMessage ? 'message-right' :'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
    `
    // message container m eement wala data append kar denge
   messageContainer.innerHTML += element
   scrollToBottom()
}

// scroll bar ko rokna hai
const scrollToBottom=()=>{
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

// events lagaynge .. typing , key press aur empty ka
messageInput.addEventListener('focus', (e)=>{
    socket.emit('feedback' , {
        feedback:`${nameInput.value} is tying a message`,
    })
})
messageInput.addEventListener('keypress', (e)=>{
    socket.emit('feedback' , {
        feedback:`${nameInput.value} is tying a message`,
    })
})
messageInput.addEventListener('blur', (e)=>{
    socket.emit('feedback' , {
        feedback:'',
    })
})

// typing ko html element k sth connect
socket.on('feedback' , (data)=>{
    clearFeedback()
    const element = `
    <li class="message-feedback">
              <p class="feedback" id="feedback">${data.feedback}</p>
            </li>
    `
    messageContainer.innerHTML += element
})


const clearFeedback=()=>{
    document.querySelectorAll('li.message-feedback').forEach(element =>{
        element.parentNode.removeChild(element)
    })
}