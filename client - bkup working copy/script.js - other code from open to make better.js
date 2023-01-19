import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index); //possible error of chartAt to be chatAt
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;

}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

//create a global variable to store previous inputs and responses
let previousConversations = [];

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const data = new FormData(form);
  const prompt = data.get('prompt');

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, prompt);

  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  //check if there is a previous conversation that matches the current prompt
  let previousResponse = '';
  previousConversations.forEach(conversation => {
    if(conversation.prompt === prompt) {
      previousResponse = conversation.response;
    }
  });

  //if there is a previous response, use that instead of making a request to the server
  if(previousResponse) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';
    typeText(messageDiv, previousResponse);
  } else {
    //fetch data from server -> bot's response
    const response = await fetch('https://starr-codex.onrender.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();

      //store the bot's response in the previousConversations array
      //previousConversations.push({prompt: prompt, response: parsedData});

      previousResponse = parsedData;
      previousConversations[prompt] = parsedData;

      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();

      messageDiv.innerHTML = "Something went wrong";

      alert(err);
    }
  }
}

function alwaysPushUp() {
  chatContainer.scrollTop = 0;
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
if (e.keyCode === 13) {
  handleSubmit(e);
  alwaysPushUp();
}
});