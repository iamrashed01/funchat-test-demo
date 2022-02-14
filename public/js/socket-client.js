const socket = io();

const sign_in_form = document.getElementById("sign_in_form");
const sign_in_form__input = document.getElementById("sign_in_form__input");
sign_in_form__input.focus();

const room_info = document.getElementById("room_info");
const roomsUl = document.getElementById("rooms");
const new_room_form = document.getElementById("new_room_form");
const new_room_form__input = document.getElementById("new_room_form__input");

const chatFrom = document.getElementById("chatFrom");
const chatFrom__input = document.getElementById("chatFrom__input");

const messages = document.getElementById("messages");
const input = document.getElementById("input");

let user_name = "";
let current_room = "";

function showCreateRoom() {
  new_room_form.style.display = "block";
  new_room_form__input.focus();
}

function getEventTarget(e) {
  e = e || window.event;
  return e.target || e.srcElement;
}
roomsUl.onclick = function (event) {
  var target = getEventTarget(event);

  joinNewRoom(target.innerHTML, user_name);
  chatFrom.style.display = "block";
};

sign_in_form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (sign_in_form__input.value) {
    user_name = sign_in_form__input.value;
    room_info.style.display = "block";
    sign_in_form__input.value = "";
    sign_in_form.remove();
    new_room_form__input.focus();
  }
});

new_room_form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (new_room_form__input.value) {
    joinNewRoom(new_room_form__input.value, user_name);
    chatFrom.style.display = "block";
    new_room_form__input.value = "";
    new_room_form.remove();
  }
});

chatFrom.addEventListener("submit", function (e) {
  e.preventDefault();
  if (chatFrom__input.value) {
    chatMessage(user_name, current_room, chatFrom__input.value);
    chatFrom__input.value = "";
  }
});

socket.on("message", function ({ user_name, msg }) {
  const item = document.createElement("li");
  item.textContent = "(" + user_name + ") : " + msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("all", function (msg) {
  const item = document.createElement("li");
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("welcome", function (msg) {
  new_room_form.style.display = "none";
  room_info.style.display = "none";
  messages.style.display = "block";
  const item = document.createElement("li");
  item.setAttribute("class", "bold");
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// show the room list
socket.emit("get-rooms");
socket.on("rooms", (rooms) => {
  if (rooms?.length > 0) {
    new_room_form.style.display = "none";
    room_info.style.display = "none";
    rooms.forEach((room) => {
      const rooms = document.getElementById("rooms");
      const item = document.createElement("li");
      item.textContent = room;
      rooms.appendChild(item);
    });
  }
  window.scrollTo(0, document.body.scrollHeight);
});

function joinNewRoom(room_name, user_name) {
  current_room = room_name;
  socket.emit("join-room", {
    room_name,
    user_name,
  });
}

function chatMessage(user_name, room, msg) {
  socket.emit("chat", {
    user_name,
    msg,
    room,
  });
}
