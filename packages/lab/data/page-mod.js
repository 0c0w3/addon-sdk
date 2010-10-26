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

const DEFAULT_ROWS = "15";
const DEFAULT_COLS = "80";

let gActiveConsole = null;

window.jetpackLab = {
  fixupWindow: fixupWindow
};

window.addEventListener("unload", function (event) {
  if (event.target === document)
    postMessage({ type: "unload" });
}, true);

// This handles console messages.
on("message", function (msg) {
  gActiveConsole.style.display = "block";
  if (!gActiveConsole.textContent)
    gActiveConsole.textContent = "Console:\n\n";
  gActiveConsole.textContent += msg.msg;
  if (["error", "exception"].indexOf(msg.type) >= 0)
    gActiveConsole.className =
      "jetpack-lab-editor-console jetpack-lab-editor-console-error";
});

function fixupWindow() {
  let nodes = document.querySelectorAll(".jetpack-lab-hide-when-installed");
  Array.forEach(nodes, function (node) node.style.display = "none");

  nodes = document.querySelectorAll(".jetpack-lab-show-when-installed");
  Array.forEach(nodes, function (node) node.style.display = "block");

  nodes = document.querySelectorAll(".jetpack-lab-code");
  Array.forEach(nodes, function (node) {
    let rows = node.getAttribute("rows");
    let cols = node.getAttribute("cols");
    let div = makeEditorDiv(node.textContent, rows, cols);
    node.parentNode.replaceChild(div, node);
  });
}

function makeEditorDiv(content, rows, cols) {
  let div = document.createElement("div");
  div.className = "jetpack-lab-editor";

  let editor = document.createElement("textarea");
  editor.className = "jetpack-lab-editor-code";
  editor.style.display = "block";
  editor.setAttribute("rows", rows || DEFAULT_ROWS);
  editor.setAttribute("cols", cols || DEFAULT_COLS);
  editor.setAttribute("spellcheck", "false");
  editor.value = content;

  let console = document.createElement("textarea");
  console.className = "jetpack-lab-editor-console";
  console.style.display = "none";
  console.setAttribute("rows", DEFAULT_ROWS);
  console.setAttribute("cols", cols || DEFAULT_COLS);
  console.setAttribute("spellcheck", "false");
  console.setAttribute("readonly", "true");

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "jetpack-lab-editor-buttons";

  let runButton = document.createElement("button");
  runButton.setAttribute("accesskey", "r");
  runButton.textContent = "Run";
  runButton.addEventListener("click", function () {
    gActiveConsole = console;
    postMessage({ type: "run", code: editor.value });
    runButton.disabled = true;
    window.setTimeout(function () runButton.disabled = false, 1000);
  }, true);

  let revertButton = document.createElement("button");
  revertButton.textContent = "Unload and Revert";
  revertButton.addEventListener("click", function () {
    editor.value = content;
    postMessage({ type: "unload" });
    console.style.display = "none";
    console.textContent = "";
    console.className = " jetpack-lab-editor-console";
    revertButton.disabled = true;
    window.setTimeout(function () revertButton.disabled = false, 1000);
  }, true);

  buttonDiv.appendChild(runButton);
  buttonDiv.appendChild(document.createTextNode(" "));
  buttonDiv.appendChild(revertButton);

  div.appendChild(editor);
  div.appendChild(buttonDiv);
  div.appendChild(console);

  return div;
}
