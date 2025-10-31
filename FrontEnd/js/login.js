document.getElementById("formLogin").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msgError = document.getElementById("msgError");

    if(email === "" || password === ""){
        msgError.textContent = "Todos los campos son obligatorios";
        return;
    }

    msgError.textContent = "";

    alert("✅ Login enviado (Pronto con conexión a Node + JWT)");
});
