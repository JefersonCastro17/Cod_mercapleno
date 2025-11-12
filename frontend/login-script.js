document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    // Guardar token en localStorage
    localStorage.setItem("token", data.token);
    alert("Inicio de sesión exitoso ✅");
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});
