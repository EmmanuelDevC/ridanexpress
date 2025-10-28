{/* <script>
  (function() {
  const s = document.createElement("script");
  s.id = "script";
  s.src = "https://vcc.ghana.accessbankplc.com/VideoConfAssist/video-conf-widget_access.js";
  s.dataset.autopopout = "true";
  s.dataset.lan = "en";
  s.dataset.team = "ACCESSBANK";
  s.dataset.services = "true";
  s.dataset.customFields = "true";
  s.dataset.allowwalkin = "true";
  s.dataset.userform = "true";
  s.dataset.room = "";
  s.dataset.tn = "8KSoHLAOqn";

  s.onload = () => {
    console.log("Widget loaded successfully.");
  const originalUnload = window.onbeforeunload;

  window.onbeforeunload = function(event) {
    let result;
  if (typeof originalUnload === "function") {
    result = originalUnload.call(this, event);
      }
  if (typeof result === "string") {
    setTimeout(() => { window.onbeforeunload = null; }, 10);
  return '';
      }

  return result;
    };
  };

  document.head.appendChild(s);
})();
</script> */}
