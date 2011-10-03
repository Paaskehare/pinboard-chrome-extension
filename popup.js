var urlBar;
var titleBar;
var descriptionBar;
var tagsBar;

var url;
var title;

var username = localStorage["pinboard_username"]
var password = localStorage["pinboard_password"]

function init() {
  chrome.tabs.getSelected(undefined, function(tab) {
    url = tab.url;
    title = tab.title;
    urlBar = document.getElementById("urlBar");
    urlBar.value=url;
    
    titleBar = document.getElementById("titleBar");
    titleBar.value=title;

    tagsBar = document.getElementById("tagsBar");
    getSuggested(url);
  });
}

function tagClicked() {
  tagsBar.value = tagsBar.value + this.innerHTML + " ";
}

function appendTag(tag) {
  var t = document.createElement('span');
  t.className = "tag";
  t.innerHTML = tag;
  t.onclick = tagClicked;
  document.getElementById("tags").appendChild(t);
}

function getSuggested(url) {
  var request = new XMLHttpRequest();
  request.open("GET","https://"+username+":"+password+"@api.pinboard.in/v1/posts/suggest?url="+encodeURI(url),false);
  request.send();
  xmlDoc=request.responseXML;
  var xmlTags = xmlDoc.getElementsByTagName("suggested")[0];
  if (xmlTags) {
    var tagNodes = xmlTags.childNodes;
    for (var i=0; i<tagNodes.length;i++) {
      var node = tagNodes[i];
      if(node.nodeName == "suggested" || node.nodeName == "recommended")
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

   formUrl = encodeURI(document.getElementById("urlBar").value);
   formTitle = encodeURI(document.getElementById("titleBar").value);
   formDescription = encodeURI(document.getElementById("descriptionBar").value);
   formTags = encodeURI(document.getElementById("tagsBar").value);
   var pinUrl = "https://"+username+":"+password+"@api.pinboard.in/v1/posts/add" +
    "?url=" + formUrl + 
    "&description=" + formTitle +
    "&extended=" + formDescription +
    "&tags=" + formTags;

   var request = new XMLHttpRequest();
   request.open("GET",pinUrl,false);
   request.send();
   /*document.getElementById("tags").innerHTML=pinUrl;*/
   /*document.getElementById("status").innerHTML=xmlDoc;*/
   document.getElementById("submit").value="Done.";
}