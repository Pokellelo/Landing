const defaultElement = {
  id: 0,
  title: "No title",
  width: "100px",
  height: "100px",
  positionX: 0,
  positionY: 0,
  inner_value: "",
  is_canvas: false,
  is_image: false,
  is_text: false,
  is_url: false,
};

const main = document.getElementById("main");

const regex_text =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const regex_url = /e/;

let selected_id = null;
let being_paste = false;

const generateElement = (e, index) => {
  
  const d = document.createElement("div");
  d.className = "basic-element";
  d.id = "ele" + e.id;

  //let divs = document.getElementsByClassName("basic-element");
  //for (div of divs) div.onmousedown = onMouseDown;

  d.onmousedown = onMouseDown;
  const text = document.createTextNode(e.inner_value);
  d.appendChild(text);
  main.appendChild(d);
  being_paste = false;
};

const removeElement = (index) => {
  elements.slice(index, 1);
  //setStorage("elements", newElement)
};

const generateAllElements = () => {
  elements.forEach((e, i) => {
    generateElement(e, i);
  });
};

const setElement = (type, value = "") => {
  let newElement = structuredClone(defaultElement);

  newElement["is_" + type] = true;
  newElement.inner_value = value;
  while (ids_in_use.includes(newElement.id)) {
    newElement.id++;
  }
  ids_in_use.push(newElement.id);

  elements.push(newElement);
  setStorage("ids_in_use", ids_in_use);
  setStorage("elements", elements);

  generateElement(newElement);
};

//localStorage.clear()
const setStorage = (id, value) => {
  localStorage.setItem(id, JSON.stringify(value));
};

const getStorage = (id) => {
  const data = localStorage.getItem(id);
  return data ? JSON.parse(data) : undefined;
};

document.onpaste = async (evt) => {
  if (being_paste) return;
  being_paste = true;
  let dataType = "text";
  const dT = evt.clipboardData;
  let data = "";

  if (dT && dT.files.length > 0) {
    //is A File
    const file = dT.files[0];
  } else {
    data = await navigator.clipboard.readText();
    dataType = regex_url.test(data) ? "url" : type;
  }

  setElement(dataType, data);
};

//Init

const e = getStorage("elements");
const iiu = getStorage("ids_in_use");

var elements = e ? e : [];

const ids_in_use = iiu ? iiu : [0];

generateAllElements();

console.log(elements);

document.onmousemove = onMouseMove;
document.onmouseup = onMouseUp;

var the_moving_div = "";
var the_last_mouse_position = { x: 0, y: 0 };

function onMouseDown(e) {
  e.preventDefault();
  the_moving_div = e.target.id; // remember which div has been selected
  the_last_mouse_position.x = e.clientX; // remember where the mouse was when it was clicked
  the_last_mouse_position.y = e.clientY;
  e.target.style.border = "2px solid blue"; // highlight the border of the div

  var divs = document.getElementsByClassName("basic-element");
  e.target.style.zIndex = divs.length; // put this div  on top
  var i = 1;
  for (div of divs) if (div.id != the_moving_div) div.style.zIndex = i++; // put all other divs behind the selected one
}

function onMouseMove(e) {
  e.preventDefault();

  if (the_moving_div == "") return;

  var d = document.getElementById(the_moving_div);
  d.style.left = d.offsetLeft + e.clientX - the_last_mouse_position.x + "px"; // move the div by however much the mouse moved
  d.style.top = d.offsetTop + e.clientY - the_last_mouse_position.y + "px";
  the_last_mouse_position.x = e.clientX; // remember where the mouse is now
  the_last_mouse_position.y = e.clientY;
  onMove();
}

function onMouseUp(e) {
  e.preventDefault();
  if (the_moving_div == "") return;
  document.getElementById(the_moving_div).style.border = ""; // hide the border again
  the_moving_div = "";
}

function onMove() {}
