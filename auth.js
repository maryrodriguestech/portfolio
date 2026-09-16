(function verificarLogin() {
    var token = localStorage.getItem("token");
    var api = "http://" + (window.location.hostname || "localhost") + ":3000";

    function irParaLogin() {
        window.location.replace("login.html");
    }

    if (!token) {
        irParaLogin();
        return;
    }

    fetch(api + "/sessao", {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(function (r) { return r.json(); })
        .then(function (d) {
            if (!d.success) {
                localStorage.removeItem("token");
                irParaLogin();
            }
        })
        .catch(function () { });
})();

function sair() {
    var token = localStorage.getItem("token");

    if (token) {
        var api = "http://" + (window.location.hostname || "localhost") + ":3000";

        fetch(api + "/logout", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
        });
    }

    localStorage.removeItem("token");
    window.location.href = "login.html";
}