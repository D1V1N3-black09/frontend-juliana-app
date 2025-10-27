
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            
            if (!contactForm.checkValidity()) {
                e.stopPropagation();
                contactForm.classList.add('was-validated');
                return;
            }

            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                newsletter: document.getElementById('newsletter').checked
            };

            
            showLoadingState(true);
            
            
            setTimeout(() => {
                showLoadingState(false);
                showSuccessMessage();
                contactForm.reset();
                contactForm.classList.remove('was-validated');
            }, 1500);
        });
    }
});

function showLoadingState(isLoading) {
    const submitButton = document.querySelector('#contactForm button[type="submit"]');
    if (!submitButton) return;

    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
    } else {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensaje';
    }
}

function showSuccessMessage() {
    const alertHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>¡Mensaje enviado!</strong> Nos pondremos en contacto contigo pronto.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    const form = document.getElementById('contactForm');
    form.insertAdjacentHTML('beforebegin', alertHTML);

    
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}