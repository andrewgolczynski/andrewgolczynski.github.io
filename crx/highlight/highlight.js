// Original Hilitor JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.
// Modified by Andrew Golczynski (error handling, specialization for crx deployment)

function Hilitor(id, tag) {
  var targetNode = document.getElementById(id) || document.body;
  var hiliteTag = tag; //todo - if tag is null, we could hit problems...
  var skipTags = new RegExp("^(?:(^\\b" + hiliteTag + "\\-\\S+)|SCRIPT|FORM|SPAN|TEXTAREA)$"); //todo - make sure this isn't ruined
  var colors = ["#ff9900", "#ffff00", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegex = "";
  var openLeft = false;
  var openRight = false;

  this.setRegex = function(input) {
    input = input.replace(/^[^\w]+|[^\w]+$/g, "").replace(/[^\w'-]+/g, "|");
    if (input == "") {return 0;}
    var re = "(" + input + ")";
    if(!this.openLeft) re = "\\b" + re;
    if(!this.openRight) re = re + "\\b";
    matchRegex = new RegExp(re, "i");
  };

  this.getRegex = function() {
    var retval = matchRegex.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node) {
    if(node === undefined || !node) return;
    if(!matchRegex) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if(node.nodeType == 3) { // NODE_TEXT
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
        if(!wordColor[regs[0].toLowerCase()]) {
          wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
        }
		//create new node to hold hilighted text
        var match = document.createElement(hiliteTag);
		match = document.createTextNode(regs[0]);
		//split out the old text, and replace it with the match node from above
        var after = node.splitText(regs.index);
        after.nodeValue = after.nodeValue.substring(regs[0].length);
		var owner = document.createElement("span");
		node.parentNode.insertBefore(owner, after);
		owner.appendChild(match);
		owner.className = hiliteTag;
		owner.style.backgroundColor = wordColor[regs[0].toLowerCase()];
        owner.style.fontStyle = "inherit";
        owner.style.color = "#000";
      }
    };
  };

  // remove highlighting
  this.remove = function() {
    var arr = document.getElementsByClassName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
  };

  // start highlighting at target node
  this.apply = function(input) {
    if(input === undefined || !input) return;
    if(this.setRegex(input) == 0) {return;}
    this.hiliteWords(targetNode);
  };
}

var hi = new Hilitor(document.body, "hilighted-content");

function highlightSelectedText() {
  var sel = window.getSelection().toString();
  hi.apply(sel);
}

document.addEventListener("dblclick", highlightSelectedText);
document.addEventListener("keydown", clearEvent);

function clearEvent(event) {
	var key = window.event?event.which:e.keyCode;
	if(key == 27) {
		hi.remove();
	}
}



