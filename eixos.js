


const cards =
document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mousemove", (e) => {

        const rect =
        card.getBoundingClientRect();

        const x =
        e.clientX - rect.left;

        const y =
        e.clientY - rect.top;

        const centerX =
        rect.width / 2;

        const centerY =
        rect.height / 2;

        const rotateX =
        ((y - centerY) / 18);

        const rotateY =
        ((centerX - x) / 18);

        card.style.transform =
        `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.04)
        `;
    });

    card.addEventListener("mouseleave", () => {

        card.style.transform =
        `
        perspective(1000px)
        rotateX(0)
        rotateY(0)
        scale(1)
        `;
    });

});



document.addEventListener("mousemove",
function(e){

    let estrela =
    document.createElement("div");

    estrela.classList.add("estrela");

    estrela.style.left =
    e.pageX + "px";

    estrela.style.top =
    e.pageY + "px";

    document.body.appendChild(estrela);

    setTimeout(() => {

        estrela.remove();

    }, 700);

});