var urlBar;
var titleBar;
var descriptionBar;
var tagsBar;

var tagsDiv;

var url;
var title;

var username = localStorage["pinboard_username"]
var password = localStorage["pinboard_password"]

function init() {

  /* Get the divs used in the Script */

  urlBar = document.getElementById("urlBar");
  titleBar = document.getElementById("titleBar");

  tagsBar = document.getElementById("tagsBar");
  tagsDiv = document.getElementById("tags");

  chrome.tabs.getSelected(undefined, function(tab) {

    /* Get page URL and title for the current tab */

    url = tab.url;
    alert(url);
    title = tab.title;

    urlBar.value=url;
    titleBar.value=title;

    /* 
     * Finally get suggested tags for the current url
     * We get this inside the function to ensure the url has been grabbed.
     */
    getSuggestedTags(url);
  });

  /* Finally get suggested tags for the current url */
}

function tagClicked() {
  tagsBar.value = tagsBar.value + this.innerHTML + " ";
}

function appendTag(tag) {
  alert(tag);
  var t = document.createElement('span');
  t.className = "tag";
  t.innerHTML = tag;
  t.onclick = tagClicked;
  document.getElementById("tags").appendChild(t);
}

function getSuggestedTags(url) {
  var request = new XMLHttpRequest();
  //var urltoGet = "https://"+username+":"+password+"@api.pinboard.in/v1/posts/suggest?url="+encodeURI(url);
  request.open("GET","https://"+username+":"+password+"@api.pinboard.in/v1/posts/suggest?url="+encodeURI(url), false);
  request.send();
  xmlDoc=request.responseXML;
  var xmlTags = xmlDoc.getElementsByTagName("suggested")[0];
  if (xmlTags) {
    var tagNodes = xmlTags.childNodes;
    for (var i=0; i<tagNodes.length;i++) {
      var node = tagNodes[i];
      if(node.nodeName == "suggested" || node.nodeName == "recommended" || node.nodeName == "popular")
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