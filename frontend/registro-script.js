function showMessage(message, type) {
    let messageDiv = document.getElementById('message');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        const form = document.querySelector('form');
        form.insertBefore(messageDiv, form.firstChild);
    }
    
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
    
    setTimeout(function() {
        messageDiv.style.display = 'none';
    }, 5000);
}

function populateDateSelectors() {
    const diaSelect = document.getElementById('dia');
    const mesSelect = document.getElementById('mes');
    const anoSelect = document.getElementById('ano');
    
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i < 10 ? '0' + i : i;
        option.textContent = i;
        diaSelect.appendChild(option);
    }
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    meses.forEach(function(mes, index) {
        const option = document.createElement('option');
        const value = index + 1;
        option.value = value < 10 ? '0' + value : value;
        option.textContent = mes;
        mesSelect.appendChild(option);
    });
    
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        anoSelect.appendChild(option);
    }
}

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const dia = document.getElementById('dia').value;
    const mes = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;
    
    if (!nombre || !apellido || !email || !password || !dia || !mes || !ano) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    const fechaNacimiento = ano + '-' + mes + '-' + dia;
    
    const userData = {
        nombre: nombre,
        apellido: apellido,
        email: email,
        password: password,
        fechaNacimiento: fechaNacimiento
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registrando...';
    submitBtn.disabled = true;
    
    AuthAPI.register(userData)
        .then(function(result) {
            if (result.success) {
                showMessage('¡Registro exitoso!', 'success');
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showMessage(result.message || 'Error al registrarse', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
});

populateDateSelectors();