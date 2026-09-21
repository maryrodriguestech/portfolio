(function verificarLogin() {
    var token = localStorage.getItem("portzin_token");
    var sessao = null;

    try {
        sessao = JSON.parse(localStorage.getItem("portzin_usuario"));
    } catch (e) {
        sessao = null;
    }

    if (!token || !sessao || !sessao.id) {
        localStorage.removeItem("portzin_token");
        localStorage.removeItem("portzin_usuario");
        localStorage.removeItem("token");
        window.location.replace("login.html");
    }
})();

function sair() {
    localStorage.removeItem("portzin_token");
    localStorage.removeItem("portzin_usuario");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}