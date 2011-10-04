var urlBar;
var titleBar;
var descriptionBar;
var tagsBar;

var privateToggle;
var laterToggle;

var tagsDiv;
var statusDiv;

var submitBtn;

var url;
var title;

var username = localStorage["pinboard_username"];
var password = localStorage["pinboard_password"];

function init() {

  /* Get the divs used in the Script */

  urlBar = document.getElementById("urlBar");
  titleBar = document.getElementById("titleBar");

  tagsBar = document.getElementById("tagsBar");
  tagsDiv = document.getElementById("tags");
  statusDiv = document.getElementById("status");

  privateToggle = document.getElementById("privateToggle");
  laterToggle = document.getElementById("laterToggle");

  submitBtn = document.getElementById("submit");

  if (!username || !password)
   setWarning("You have not yet entered login information for pinboard, you should go do so on the options page");

  chrome.tabs.getSelected(undefined, function(tab) {

    /* Get page URL and title for the current tab */

    url = tab.url;
    title = tab.title;

    urlBar.value=url;
    titleBar.value=title;

    /* 
     * Finally get suggested tags for the current url
     *
     * We get this inside the "chrome.tabs.getSelected"-function 
     * to ensure the url has been fetched.
     */
    
    getSuggestedTags(url);
  });
}

function setWarning(message) {
  /* Create status element */
  
  var st = document.createElement("span");
  st.className = "warning";
  st.innerHTML = message;

  /* Clear status and insert status element */

  statusDiv.innerHTML="";
  statusDiv.appendChild(st);
}

function tagClicked() {
  var value = tagsBar.value;

  if (this.className == "tagclicked") {
    this.className = "tag";
    value = value.replace(this.innerHTML + " ", "");
  } else {
    this.className = "tagclicked";
    value = value + this.innerHTML + " ";
  }

  tagsBar.value = value;
}

function appendTag(tag) {
  var t = document.createElement('span');
  t.className = "tag";
  t.innerHTML = tag;
  t.onclick = tagClicked;
  tagsDiv.appendChild(t);
}

function getSuggestedTags(url) {
  var request = new XMLHttpRequest();
  var urltoGet = "https://"+username+":"+password+"@api.pinboard.in/v1/posts/suggest?url="+encodeURI(url);
  request.open("GET","https://"+username+":"+password+"@api.pinboard.in/v1/posts/suggest?url="+encodeURI(url), false);
  request.send();
  xmlDoc=request.responseXML;
  var xmlTags = xmlDoc.getElementsByTagName("suggested")[0];
  if (xmlTags) {
    var tagNodes = xmlTags.childNodes;
    for (var i=0; i<tagNodes.length;i++) {
      var node = tagNodes[i];
      if(node.nodeName == "suggested" || node.nodeName == "popular")
        appendTag(node.childNodes[0].nodeValue);
    }
  }
}

function postForm() {
  /*
   * For some reason the chrome API does not support GET forms, 
   * and the pinboard API does not support POST
   * thus we make a XMLHttpRequest for posting the values instead.
   */

  var formPrivate = "yes";
  var formLater = "no";

  if(privateToggle.checked)
    formPrivate = "no";
  if(laterToggle.checked)
    formLater = "yes";

  var formUrl = encodeURI(document.getElementById("urlBar").value);
  var formTitle = encodeURI(document.getElementById("titleBar").value);
  var formDescription = encodeURI(document.getElementById("descriptionBar").value);
  var formTags = encodeURI(document.getElementById("tagsBar").value).replace("%20", "+");

  var pinUrl = "https://"+username+":"+password+"@api.pinboard.in/v1/posts/add" +
    "?url=" + formUrl + 
    "&description=" + formTitle +
    "&extended=" + formDescription +
    "&tags=" + formTags +
    "&shared=" + formPrivate +
    "&toread=" + formLater;

  setWarning(pinUrl);

  var request = new XMLHttpRequest();
  request.open("GET",pinUrl,false);
  request.send();

  submitBtn.className="done";
  submitBtn.value="Done!";
}