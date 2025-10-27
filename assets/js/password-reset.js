/**
 * Password Reset API Functions
 * Funciones para el flujo completo de recuperación de contraseña con OTP
 */

/**
 * Solicita recuperación de contraseña
 * Envía código OTP al email del usuario
 * 
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} - { success, message, expires_in_minutes } o { error }
 */
async function requestPasswordReset(email) {
    try {
        const response = await fetch(`${API_URL}/password-reset/request-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al enviar código de recuperación');
        }
        
        return data;
    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        return {
            success: false,
            error: error.message || 'Error al conectar con el servidor'
        };
    }
}

/**
 * Verifica código OTP
 * Valida si el código de 6 dígitos es correcto y no ha expirado
 * 
 * @param {string} token - Código OTP de 6 dígitos
 * @returns {Promise<Object>} - { success, is_valid, message, user_email } o { error, is_valid: false }
 */
async function verifyOTP(token) {
    try {
        const response = await fetch(`${API_URL}/password-reset/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                is_valid: false,
                error: data.error || 'Código incorrecto o expirado'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Error en verifyOTP:', error);
        return {
            success: false,
            is_valid: false,
            error: error.message || 'Error al conectar con el servidor'
        };
    }
}

/**
 * Cambia la contraseña después de verificar OTP
 * 
 * @param {string} token - Código OTP verificado
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} - { success, message } o { error }
 */
async function resetPassword(token, newPassword) {
    try {
        const response = await fetch(`${API_URL}/password-reset/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                token,
                new_password: newPassword 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al cambiar contraseña');
        }
        
        return data;
    } catch (error) {
        console.error('Error en resetPassword:', error);
        return {
            success: false,
            error: error.message || 'Error al conectar con el servidor'
        };
    }
}

/**
 * Valida formato de email
 * 
 * @param {string} email - Email a validar
 * @returns {boolean} - true si el email es válido
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida código OTP (6 dígitos numéricos)
 * 
 * @param {string} token - Token a validar
 * @returns {boolean} - true si el token es válido
 */
function validateOTPFormat(token) {
    return /^\d{6}$/.test(token);
}

/**
 * Calcula la fuerza de una contraseña
 * 
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} - { strength: 'weak'|'medium'|'strong', score: 0-5 }
 */
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (!password) {
        return { strength: 'none', score: 0 };
    }
    
    // Longitud
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    
    // Complejidad
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    // Clasificar
    let strength = 'weak';
    if (score <= 2) {
        strength = 'weak';
    } else if (score <= 3) {
        strength = 'medium';
    } else {
        strength = 'strong';
    }
    
    return { strength, score };
}

/**
 * Formatea tiempo restante en formato MM:SS
 * 
 * @param {number} seconds - Segundos restantes
 * @returns {string} - Tiempo formateado (ej: "14:35")
 */
function formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Inicia contador regresivo
 * 
 * @param {number} durationSeconds - Duración en segundos
 * @param {function} onTick - Callback llamado cada segundo con tiempo restante
 * @param {function} onExpire - Callback llamado cuando expira el tiempo
 * @returns {function} - Función para cancelar el contador
 */
function startCountdown(durationSeconds, onTick, onExpire) {
    let remaining = durationSeconds;
    
    const interval = setInterval(() => {
        remaining--;
        
        if (onTick) {
            onTick(remaining);
        }
        
        if (remaining <= 0) {
            clearInterval(interval);
            if (onExpire) {
                onExpire();
            }
        }
    }, 1000);
    
    // Retornar función de cancelación
    return () => clearInterval(interval);
}

/**
 * Sanitiza input del usuario
 * Previene inyección XSS básica
 * 
 * @param {string} input - Input a sanitizar
 * @returns {string} - Input sanitizado
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Muestra mensaje de error con SweetAlert2
 * 
 * @param {string} message - Mensaje de error
 * @param {string} title - Título del mensaje (opcional)
 */
function showPasswordResetError(message, title = 'Error') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonText: 'Entendido'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

/**
 * Muestra mensaje de éxito con SweetAlert2
 * 
 * @param {string} message - Mensaje de éxito
 * @param {string} title - Título del mensaje (opcional)
 */
function showPasswordResetSuccess(message, title = 'Éxito') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonText: 'Continuar'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

/**
 * Limpia datos de sesión de recuperación de contraseña
 */
function clearPasswordResetSession() {
    sessionStorage.removeItem('recovery_email');
    sessionStorage.removeItem('verified_token');
    sessionStorage.removeItem('reset_timestamp');
}

/**
 * Obtiene email de recuperación de la sesión
 * 
 * @returns {string|null} - Email guardado o null
 */
function getRecoveryEmail() {
    return sessionStorage.getItem('recovery_email');
}

/**
 * Guarda email de recuperación en la sesión
 * 
 * @param {string} email - Email a guardar
 */
function setRecoveryEmail(email) {
    sessionStorage.setItem('recovery_email', email);
    sessionStorage.setItem('reset_timestamp', Date.now().toString());
}

/**
 * Obtiene token verificado de la sesión
 * 
 * @returns {string|null} - Token guardado o null
 */
function getVerifiedToken() {
    return sessionStorage.getItem('verified_token');
}

/**
 * Guarda token verificado en la sesión
 * 
 * @param {string} token - Token a guardar
 */
function setVerifiedToken(token) {
    sessionStorage.setItem('verified_token', token);
}

/**
 * Verifica si hay una sesión de recuperación activa
 * 
 * @returns {boolean} - true si hay sesión activa
 */
function hasActiveRecoverySession() {
    const email = getRecoveryEmail();
    const timestamp = sessionStorage.getItem('reset_timestamp');
    
    if (!email || !timestamp) {
        return false;
    }
    
    // Verificar que la sesión no sea muy antigua (1 hora)
    const elapsed = Date.now() - parseInt(timestamp);
    const oneHour = 60 * 60 * 1000;
    
    return elapsed < oneHour;
}

/**
 * Configuración de teclado para inputs OTP
 * Previene caracteres no numéricos
 * 
 * @param {HTMLInputElement} input - Input element
 */
function setupOTPInput(input) {
    // Solo permitir dígitos
    input.addEventListener('keypress', function(e) {
        if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
            e.preventDefault();
        }
    });
    
    // Prevenir paste de contenido no numérico
    input.addEventListener('paste', function(e) {
        const pastedData = e.clipboardData.getData('text');
        if (!/^\d+$/.test(pastedData)) {
            e.preventDefault();
        }
    });
    
    // Remover caracteres no numéricos en input
    input.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
    });
}

/**
 * Auto-navegación entre inputs OTP
 * 
 * @param {HTMLInputElement[]} inputs - Array de inputs OTP
 */
function setupOTPNavigation(inputs) {
    inputs.forEach((input, index) => {
        // Auto-avanzar al siguiente
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        // Retroceder con backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

// Log para debugging (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Password Reset API Functions loaded');
    console.log('Available functions:', [
        'requestPasswordReset(email)',
        'verifyOTP(token)',
        'resetPassword(token, newPassword)',
        'validateEmail(email)',
        'validateOTPFormat(token)',
        'calculatePasswordStrength(password)',
        'startCountdown(duration, onTick, onExpire)'
    ]);
}
