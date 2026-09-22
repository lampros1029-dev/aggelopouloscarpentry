(function () {
  var SEND_TO = "AW-16501494063/Bg3hCKekxYEdEK-iw7w9";

  document.addEventListener("click", function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href^="tel:"]') : null;
    if (!link || typeof gtag !== "function") return;

    gtag("event", "conversion", { send_to: SEND_TO });
    gtag("event", "phone_click", {
      link_url: link.getAttribute("href"),
      transport_type: "beacon"
    });
  });
})();
