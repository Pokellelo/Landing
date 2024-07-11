const defaultElement = {
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

const main = document.getElementById("main")

const regex_text =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const regex_url = /e/;

let selected_id = null;
let being_paste = false;

const generateElement = (e) => {
  console.log(e);




};

const removeElement = (index) => {
  elements.slice(index, 1);
  //setStorage("elements", newElement)
};

const generateAllElements = () => {
  elements.forEach((e) => {
    generateElement(e);
  });
};

const setElement = (type, value = "") => {
  let newElement = structuredClone(defaultElement);

  newElement["is_" + type] = true;
  elements.push(newElement);
  setStorage("elements", elements);

  generateElement(newElement);
};

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

  if (dT) {
    //is A File
    const file = dT.files[0];
  } else {
    const data = await navigator.clipboard.readText();
    dataType = regex_url.test(data) ? "url" : type;
  }

  setElement(dataType);
};

//Init

const e = getStorage("elements");

var elements = e ? e : [];

generateAllElements();

console.log(elements);
