document.addEventListener("DOMContentLoaded", function () {

    const textos = [
        "Estudante & Desenvolvedora",
    ];

    let contador = 0;
    let letra = 0;

    const typing = document.getElementById("typing");

    function apagar() {
        if (!typing) return;

        if (typing.innerHTML.length > 0) {
            typing.innerHTML = typing.innerHTML.slice(0, -1);
            setTimeout(apagar, 50);
        } else {
            letra = 0;
            setTimeout(escrever, 500);
        }
    }

    function escrever() {
        if (!typing) return;

        if (letra < textos[contador].length) {
            typing.innerHTML += textos[contador].charAt(letra);
            letra++;
            setTimeout(escrever, 100);
        } else {
            setTimeout(apagar, 1500);
        }
    }

    function reveal() {
        const reveals = document.querySelectorAll(".reveal");

        for (let i = 0; i < reveals.length; i++) {
            const alturaTela = window.innerHeight;
            const topo = reveals[i].getBoundingClientRect().top;
            const visivel = 100;

            if (topo < alturaTela - visivel) {
                reveals[i].classList.add("active");
            }
        }
    }

    window.addEventListener("scroll", reveal);

    document.getElementById('ano').textContent = new Date().getFullYear();

    escrever();
    reveal();

});
