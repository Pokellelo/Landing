//Variables globales
const defaultElement = {
  id: 0,
  index: null,
  title: "No title",
  width: "100px",
  height: "100px",
  positionX: "0px",
  positionY: "0px",
  inner_value: "",
  text_color: "black",
  is_text: false,
  is_image: false,
  id_vide: false,
  is_url: false,
  is_canvas: false,
};

const main = document.getElementById("main");

const regex_url =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

const the_last_mouse_position = { x: 0, y: 0 };

let selected_id = null;
let being_paste = false;
let resized = null;
let unique_tags = {};
var the_moving_div = "";
let mousemoving = false;

/*********Functions*********/

//General Use - not binded to anything
const setStorage = (id, value) => {
  localStorage.setItem(id, JSON.stringify(value));
};

const getStorage = (id) => {
  const data = localStorage.getItem(id);
  return data ? JSON.parse(data) : undefined;
};
const reset = () => {
  localStorage.clear();
  location.reload();
};
const resizeObserver = new ResizeObserver((entries) => {
  //Create an resize observer to an element
  resized = {
    id: entries[0].target.childNodes[0].id,
    height: entries[0].contentRect.height,
    width: entries[0].contentRect.width,
  };
});

const parentbyid = (id) => {
  return document.querySelector("#" + id).parentElement;
};

const createElement_withAtributes = (attributes = {}, tag = "div") => {
  const e = document.createElement(tag);
  for (let key in attributes) {
    e[key] = attributes[key];
  }
  return e;
};

//Functions binded to some feature

const generateElement = (e, index) => {
  let type_tag = "div";
  if (e.is_text) {
    type_tag = "textarea";
    {
      unique_tags = {
        title: "text" + e.id,
        onfocusout: () => {}
      };
    }
  } else if (e.is_image) {
    type_tag = "img";
    unique_tags.alt = "image" + e.id;
  } else if (e.is_url) {
    type_tag = "a";
    unique_tags.href = e.inner_value;
    unique_tags.target = "_";
  } else if (e.is_canvas) type_tag = "iframe";

  const d = createElement_withAtributes(unique_tags, type_tag);

  const wrapper = createElement_withAtributes("div");
  const toolbar = createElement_withAtributes("div");
  toolbar.className = "element-toolbar";

  d.id = "ele" + e.id;
  wrapper.style.color = e.text_color;

  wrapper.style.left = e.positionX;
  wrapper.style.top = e.positionY;
  wrapper.style.width = e.width;
  wrapper.style.height = e.height;

  resizeObserver.observe(wrapper);

  wrapper.className = "wrapper";

  d.className = "element";
  d.onmousedown = onMouseDown;
  const text = document.createTextNode(e.inner_value);

  if (!e.is_image) {
    d.appendChild(text);
  } else {
    d.src = e.inner_value;
  }

  wrapper.appendChild(d);
  wrapper.appendChild(toolbar);

  main.appendChild(wrapper);

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

  const index = elements.push(newElement) - 1;

  elements[index].index = index;
  setStorage("ids_in_use", ids_in_use);
  setStorage("elements", elements);

  generateElement(newElement, index);
};

//Handlers, listeners
document.onpaste = async (evt) => {
  if (being_paste) return;
  being_paste = true;
  let dataType = "text";
  const dT = evt.clipboardData;
  let data = "";

  if (dT && dT.files.length > 0) {
    var orgEvent = evt;
    for (var i = 0; i < orgEvent.clipboardData.items.length; i++) {
      if (
        orgEvent.clipboardData.items[i].kind == "file" &&
        orgEvent.clipboardData.items[i].type == "image/png"
      ) {
        var imageFile = orgEvent.clipboardData.items[i].getAsFile();
        var fileReader = new FileReader();
        fileReader.onloadend = function () {
          data = fileReader.result;
          setElement("image", data);
        };
        fileReader.readAsDataURL(imageFile);
        break;
      }
    }
  } else {
    data = await navigator.clipboard.readText();
    if (regex_url.test(data)) dataType = "url";
    console.log(dataType);
    setElement(dataType, data);
  }
};

document.onmousemove = (e) => {
  e.preventDefault();
  if (the_moving_div == "") return;

  const h = document.getElementById(the_moving_div);
  const d = h.parentElement;
  d.style.left = d.offsetLeft + e.clientX - the_last_mouse_position.x + "px"; // move the div by however much the mouse moved
  d.style.top = d.offsetTop + e.clientY - the_last_mouse_position.y + "px";
  the_last_mouse_position.x = e.clientX; // remember where the mouse is now
  the_last_mouse_position.y = e.clientY;
};

document.onmouseup = (e) => {
  if (resized) {
    const rs = document.getElementById(resized.id);
    elements[rs.id.slice(-1) - 1].height = resized.height + "px";
    elements[rs.id.slice(-1) - 1].width = resized.width + "px";
    setStorage("elements", elements);
    resize = null;
  }

  e.preventDefault();
  if (the_moving_div == "") return;
  const d = document.getElementById(the_moving_div);

  d.focus();
  the_moving_div = "";

  d.parentElement.style.border = "";

  // -1 it's temporary
  elements[d.id.slice(-1) - 1].positionY = d.parentElement.style.top;
  elements[d.id.slice(-1) - 1].positionX = d.parentElement.style.left;

  setStorage("elements", elements);
};

const onMouseDown = (e) => {
  mousemoving = true;
  e.preventDefault();
  the_moving_div = e.target.id; // remember which div has been selected
  the_last_mouse_position.x = e.clientX; // remember where the mouse was when it was clicked
  the_last_mouse_position.y = e.clientY;
  e.target.parentElement.style.border = "2px solid blue"; // highlight the border of the div

  var divs = document.getElementsByClassName("wrapper");
  e.target.style.zIndex = divs.length; // put this div  on top
  var i = 1;
  for (div of divs) if (div.id != the_moving_div) div.style.zIndex = i++; // put all other divs behind the selected one
};

//Initialization

const e = getStorage("elements");
const iiu = getStorage("ids_in_use");
const bc = getStorage("background_color");

let elements = e ? e : [];
const ids_in_use = iiu ? iiu : [0];
let background_color = bc ? bc : "white";

generateAllElements();
