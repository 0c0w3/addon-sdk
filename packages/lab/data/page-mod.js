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
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Drew Willcoxon <adw@mozilla.com>
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

window.jetpackLab = {
  fixupWindow: fixupWindow
};

window.addEventListener("unload", function (event) {
  if (event.target === document)
    postMessage({ type: "unload" });
}, true);

function fixupWindow() {
  let nodes = document.querySelectorAll(".jetpack-lab-hide-when-installed");
  Array.forEach(nodes, function (node) node.style.display = "none");

  nodes = document.querySelectorAll(".jetpack-lab-show-when-installed");
  Array.forEach(nodes, function (node) node.style.display = "block");

  nodes = document.querySelectorAll(".jetpack-lab-code");
  Array.forEach(nodes, function (node) {
    let div = makeEditorDiv(node.textContent);
    node.parentNode.replaceChild(div, node);
  });
}

function makeEditorDiv(content) {
  let div = document.createElement("div");
  div.className = "jetpack-lab-editor";

  let editorDiv = document.createElement("div");
  let editor = document.createElement("textarea");
  editor.className = "jetpack-lab-editor-code";
  editor.setAttribute("rows", "15");
  editor.setAttribute("cols", "80");
  editor.setAttribute("spellcheck", "false");
  editor.value = content;
  editorDiv.appendChild(editor);
  div.appendChild(editorDiv);

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "jetpack-lab-editor-buttons";

  let runButton = document.createElement("button");
  runButton.setAttribute("accesskey", "r");
  runButton.textContent = "Run";
  runButton.addEventListener("click", function () {
    postMessage({ type: "run", code: editor.value });
    runButton.disabled = true;
    window.setTimeout(function () runButton.disabled = false, 1000);
  }, true);
  buttonDiv.appendChild(runButton);

  buttonDiv.appendChild(document.createTextNode(" "));

  let revertButton = document.createElement("button");
  revertButton.textContent = "Unload and Revert";
  revertButton.addEventListener("click", function () {
    editor.value = content;
    postMessage({ type: "unload" });
    consoleDiv.style.display = "none";
    console.textContent = "";
    console.className = " jetpack-lab-editor-console";
    revertButton.disabled = true;
    window.setTimeout(function () revertButton.disabled = false, 1000);
  }, true);
  buttonDiv.appendChild(revertButton);

  div.appendChild(buttonDiv);

  let consoleDiv = document.createElement("div");
  let console = document.createElement("textarea");
  console.className = "jetpack-lab-editor-console";
  console.setAttribute("rows", "15");
  console.setAttribute("cols", "80");
  console.setAttribute("spellcheck", "false");
  console.setAttribute("readonly", "true");
  consoleDiv.appendChild(console);
  consoleDiv.style.display = "none";
  div.appendChild(consoleDiv);

  this.on("message", function (msg) {
    consoleDiv.style.display = "block";
    if (!console.textContent)
      console.textContent = "Console:\n\n";
    console.textContent += msg.msg;
    if (["error", "exception"].indexOf(msg.type) >= 0)
      console.className =
        "jetpack-lab-editor-console jetpack-lab-editor-console-error";
  });

  return div;
}
