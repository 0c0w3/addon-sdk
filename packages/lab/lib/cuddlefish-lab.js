/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Jetpack.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Atul Varma <atul@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// const LAB_PROTOCOL = "cuddlefish";
// const LAB_HOST = "lab";
// const LAB_URL = LAB_PROTOCOL + "://" + LAB_HOST + "/lab.html";

// TODO: We want to localize this string.
// const LAB_TITLE = "Cuddlefish Lab";

var tabBrowser = require("tab-browser");
// var simpleFeature = require("simple-feature");
var errors = require("errors");

// var { Cu } = require("chrome");
// var jsm = {};
// Cu.import(packaging.options.loader, jsm);
// var Loader = jsm.Loader;

function injectLabVars(window) {
  let win = window.wrappedJSObject;
  win.jetpackLab = {
    fixupWindow: function () fixupLabWindow(win)
  };
}

function isLabWindow(window) {
  return window.document.URL.indexOf("http://127.0.0.1:8888/") >= 0;
}

function fixupLabWindow(window) {
  //XXXadw need to listen for doc unload and unload loader.  and since this will
  //  be called for the same window over and over, need to unload
  //  window.jetpackLabLoader if it exists.
  ensureLoaderIsUnloaded(window);
  let nodes = window.document.querySelectorAll(".jetpack-lab-code");
  Array.forEach(nodes, function (node) {
    let div = makeEditorDiv(window, node.textContent);
    node.parentNode.replaceChild(div, node);
  });
}

function makeEditorDiv(window, content) {
  let doc = window.document;

  let div = doc.createElement("div");
  div.className = "jetpack-lab-editor";

  let editorDiv = doc.createElement("div");
  let editor = doc.createElement("textarea");
  editor.className = "jetpack-lab-editor-code";
  editor.setAttribute("rows", "15");
  editor.setAttribute("cols", "80");
  editor.setAttribute("spellcheck", "false");
  editor.value = content;
  editorDiv.appendChild(editor);
  div.appendChild(editorDiv);

  let buttonDiv = doc.createElement("div");
  buttonDiv.className = "jetpack-lab-editor-buttons";

  let runButton = doc.createElement("button");
  runButton.setAttribute("accesskey", "r");
  runButton.textContent = "Run";
  runButton.addEventListener("click", function () {
    runCode(window, editor.value, consoleDiv, console);
//     runButton.textContent = "Ran!";
    runButton.disabled = true;
    window.setTimeout(function () runButton.disabled = false, 1000);
  }, true);
  buttonDiv.appendChild(runButton);

  buttonDiv.appendChild(doc.createTextNode(" "));

  let revertButton = doc.createElement("button");
  revertButton.textContent = "Unload and Revert";
  revertButton.addEventListener("click", function () {
    editor.value = content;
    ensureLoaderIsUnloaded(window);
    consoleDiv.style.display = "none";
    console.textContent = "";
//     revertButton.textContent = "Unloaded and Reverted!";
    revertButton.disabled = true;
//     window.setTimeout(function () {
//       revertButton.textContent = "Unload and Revert";
//       revertButton.disabled = false;
//     }, 1000);
    window.setTimeout(function () revertButton.disabled = false, 1000);
  }, true);
  buttonDiv.appendChild(revertButton);

  div.appendChild(buttonDiv);

  let consoleDiv = doc.createElement("div");
  let console = doc.createElement("textarea");
  console.className = "jetpack-lab-editor-console";
  console.setAttribute("rows", "15");
  console.setAttribute("cols", "80");
  console.setAttribute("spellcheck", "false");
  console.setAttribute("readonly", "true");
  consoleDiv.appendChild(console);
  consoleDiv.style.display = "none";
  div.appendChild(consoleDiv);

  return div;
}

// function clearConsole() {
//   document.getElementById("console").textContent = "";
// }

// function printToConsole(message) {
//   document.getElementById("console").textContent += message;
// }

// function maybeUnloadLoader() {
//   if (gLoader) {
//     gLoader.unload();
//     gLoader = null;
//   }
// }

function ensureLoaderIsUnloaded(window) {
  if (window.jetpackLabLoader) {
    window.jetpackLabLoader.unload();
    delete window.jetpackLabLoader;
  }
}

function runCode(window, code, consoleDiv, console) {
//   maybeUnloadLoader(window);
//   clearConsole();

//   if (!window.packaging)
//     throw new Error("window.packaging is not available");

  ensureLoaderIsUnloaded(window);

  function printToConsole(msg) {
    consoleDiv.style.display = "block";
    if (!console.textContent)
      console.textContent = "Console:\n\n";
    console.textContent += msg;
  }

//   let loader = new Loader({rootPaths: packaging.options.rootPaths.slice(),
//                            print: printToConsole,
//                            globals: {packaging: packaging}});

  var Cuddlefish = require("cuddlefish");
  let options = {
    rootPaths: packaging.options.rootPaths.slice(),
    print: printToConsole
  };
  let loader = new Cuddlefish.Loader(options);

  window.jetpackLabLoader = loader;

  try {
    loader.runScript(code);
  } catch (e) {
    loader.console.exception(e);
  }
}


exports.main = function main(options) {
//   var openLab;

  tabBrowser.whenContentLoaded(function(window) {
    if (isLabWindow(window))
      injectLabVars(window);
  });
//   openLab = function openLabInTab() {
//     tabBrowser.addTab(LAB_URL);
//   };

//   if (simpleFeature.isAppSupported())
//     simpleFeature.register(LAB_TITLE, openLab);
//   else
//     // No other way to allow the user to expose the functionality
//     // voluntarily, so just open the lab now.
//     openLab();
};
