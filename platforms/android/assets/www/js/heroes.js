document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  console.log("console.log works well");
  StatusBar.hide();
  // screen.lockOrientation('landscape');
}

$(function() {
    FastClick.attach(document.body);
});