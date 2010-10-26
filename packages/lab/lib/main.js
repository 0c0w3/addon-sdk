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

const pageMod = require("page-mod");
const prefs = require("preferences-service");
const self = require("self");

const { PlainTextConsole } = require("plain-text-console");
const { Loader } = require("cuddlefish");

const LAB_PAGES_PREF = "extensions.jetpack-lab.pages";

const DEFAULT_LAB_PAGES = [
  "http://127.0.0.1:8888/*",
  "*.mozillalabs.com"
];

exports.main = function main(options) {
  let pages = DEFAULT_LAB_PAGES;
  let patterns = prefs.get(LAB_PAGES_PREF);
  if (patterns) {
    try {
      pages = JSON.parse(patterns);
    }
    catch (err) {}
  }

  let mod = pageMod.PageMod({
    include: pages,
    contentScriptURL: self.data.url("page-mod.js"),
    onAttach: onWorkerAttach
  });
  pageMod.add(mod);
};

function onWorkerAttach(worker) {
  let workerLoader = null;
  worker.on("message", function (msg) {
    switch (msg.type) {
    case "run":
      if (workerLoader)
        workerLoader.unload();
      workerLoader = runCode(worker, msg.code);
      break;
    case "unload":
      if (workerLoader)
        workerLoader.unload();
      break;
    }
  });
}

function runCode(worker, code) {
  let consoleStr = "";
  let driverConsole = new PlainTextConsole(function (s) consoleStr = s);
  let facadeConsole = {};

  for (let [prop, val] in Iterator(PlainTextConsole.prototype)) {
    if (typeof(val) === "function") {
      let p = prop;
      facadeConsole[p] = function () {
        driverConsole[p].apply(driverConsole, arguments);
        worker.postMessage({ type: p, msg: consoleStr });
      };
    }
  }

  let loader = new Loader({
    rootPaths: packaging.options.rootPaths.slice(),
    console: facadeConsole
  });

  try {
    loader.runScript(code);
  }
  catch (err) {
    facadeConsole.exception(err);
  }

  return loader;
}
