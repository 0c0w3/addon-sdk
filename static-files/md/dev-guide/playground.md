<p class="jetpack-lab-hide-when-installed">
  Install the restartless <a href="">Jetpack Lab add-on</a> to edit and run
  the code below and examples throughout this documentation right in your
  browser!
</p>

<p class="jetpack-lab-show-when-installed">
  Click the Run button to load and run the code below&mdash;then try editing
  it.  The Unload and Revert button undoes the modifications it's made and
  reverts your changes.  (Tip: You can press Alt+R or Control+R instead of
  clicking Run.)
</p>

<pre class="jetpack-lab-code" rows="25">
var notifications = require("notifications");
notifications.notify({
  title: "Hello!",
  text: "Cheeseburger and a large fry, please."
});
console.log("foo");
</pre>
