const swalConfig = {
    customClass: {
        popup: 'beautiful-girl-modal',
        title: 'beautiful-girl-modal-title',
        htmlContainer: 'beautiful-girl-modal-text',
        confirmButton: 'btn btn-primary btn-lg px-4',
        cancelButton: 'btn btn-outline-secondary btn-lg px-4',
        denyButton: 'btn btn-danger btn-lg px-4'
    },
    buttonsStyling: false,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
    }
};

/**
 * Modal de confirmación elegante
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal
 * @param {string} options.text - Texto descriptivo
 * @param {string} options.icon - Tipo de icono: 'warning', 'question', 'info', 'success', 'error'
 * @param {string} options.confirmButtonText - Texto del botón confirmar
 * @param {string} options.cancelButtonText - Texto del botón cancelar
 * @returns {Promise<boolean>} - true si confirma, false si cancela
 */
async function showConfirmModal(options = {}) {
    const defaults = {
        title: '¿Estás seguro?',
        text: 'Esta acción requiere confirmación',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar',
        reverseButtons: true,
        focusCancel: false
    };

    const result = await Swal.fire({
        ...swalConfig,
        ...defaults,
        ...options
    });

    return result.isConfirmed;
}

/**
 * Modal de confirmación de eliminación
 * @param {string} itemName - Nombre del elemento a eliminar
 * @param {string} itemType - Tipo de elemento (producto, cliente, orden, etc.)
 * @returns {Promise<boolean>}
 */
async function showDeleteConfirm(itemName, itemType = 'elemento') {
    return await showConfirmModal({
        title: '¿Eliminar este ' + itemType + '?',
        html: `
            <p class="mb-2">Estás a punto de eliminar:</p>
            <p class="fw-bold fs-5 text-danger mb-2">"${itemName}"</p>
            <p class="text-muted small mb-0">⚠️ Esta acción no se puede deshacer</p>
        `,
        icon: 'warning',
        iconColor: '#dc3545',
        confirmButtonText: '<i class="fas fa-trash-alt me-2"></i>Sí, eliminar',
        cancelButtonText: '<i class="fas fa-times me-2"></i>No, conservar',
        customClass: {
            ...swalConfig.customClass,
            confirmButton: 'btn btn-danger btn-lg px-4',
            cancelButton: 'btn btn-outline-secondary btn-lg px-4'
        }
    });
}

/**
 * Modal de confirmación de logout
 * @returns {Promise<boolean>}
 */
async function showLogoutConfirm() {
    return await showConfirmModal({
        title: '¿Cerrar sesión?',
        text: 'Tu sesión actual se cerrará y deberás iniciar sesión nuevamente',
        icon: 'question',
        iconColor: '#0d6efd',
        confirmButtonText: '<i class="fas fa-sign-out-alt me-2"></i>Sí, cerrar sesión',
        cancelButtonText: '<i class="fas fa-times me-2"></i>Cancelar',
        confirmButtonColor: '#0d6efd'
    });
}

/**
 * Modal de alerta simple (reemplazo de alert())
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título
 * @param {string} options.text - Texto
 * @param {string} options.icon - Icono: 'success', 'error', 'warning', 'info'
 * @returns {Promise<void>}
 */
async function showAlert(options = {}) {
    const defaults = {
        title: 'Atención',
        text: '',
        icon: 'info',
        confirmButtonText: 'Entendido'
    };

    await Swal.fire({
        ...swalConfig,
        ...defaults,
        ...options
    });
}

/**
 * Modal de éxito
 * @param {string} title - Título
 * @param {string} text - Texto descriptivo
 * @returns {Promise<void>}
 */
async function showSuccess(title, text = '') {
    await showAlert({
        title: title,
        text: text,
        icon: 'success',
        iconColor: '#198754',
        confirmButtonText: '<i class="fas fa-check me-2"></i>Perfecto'
    });
}

/**
 * Modal de error
 * @param {string} title - Título
 * @param {string} text - Texto descriptivo
 * @returns {Promise<void>}
 */
async function showError(title, text = '') {
    await showAlert({
        title: title,
        text: text,
        icon: 'error',
        iconColor: '#dc3545',
        confirmButtonText: '<i class="fas fa-times me-2"></i>Cerrar'
    });
}

/**
 * Modal de advertencia
 * @param {string} title - Título
 * @param {string} text - Texto descriptivo
 * @returns {Promise<void>}
 */
async function showWarning(title, text = '') {
    await showAlert({
        title: title,
        text: text,
        icon: 'warning',
        iconColor: '#ffc107',
        confirmButtonText: '<i class="fas fa-exclamation-triangle me-2"></i>Entendido'
    });
}

/**
 * Modal de información
 * @param {string} title - Título
 * @param {string} text - Texto descriptivo
 * @returns {Promise<void>}
 */
async function showInfo(title, text = '') {
    await showAlert({
        title: title,
        text: text,
        icon: 'info',
        iconColor: '#0dcaf0',
        confirmButtonText: '<i class="fas fa-info-circle me-2"></i>Entendido'
    });
}

/**
 * Modal de confirmación para ir a login
 * @returns {Promise<boolean>}
 */
async function showLoginRedirect() {
    return await showConfirmModal({
        title: 'Sesión requerida',
        html: `
            <p class="mb-2">Debes iniciar sesión para continuar</p>
            <p class="text-muted small mb-0"><i class="fas fa-lock me-1"></i> Esta acción requiere autenticación</p>
        `,
        icon: 'info',
        iconColor: '#0d6efd',
        confirmButtonText: '<i class="fas fa-sign-in-alt me-2"></i>Ir a Login',
        cancelButtonText: '<i class="fas fa-times me-2"></i>Cancelar'
    });
}

/**
 * Modal de carga (loading)
 * @param {string} title - Título
 * @param {string} text - Texto descriptivo
 */
function showLoading(title = 'Cargando...', text = 'Por favor espera') {
    Swal.fire({
        ...swalConfig,
        title: title,
        text: text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

/**
 * Cerrar modal de carga
 */
function closeLoading() {
    Swal.close();
}

/**
 * Toast notification (pequeña notificación en esquina)
 * @param {Object} options - Opciones
 * @param {string} options.title - Título
 * @param {string} options.icon - Icono
 * @param {number} options.timer - Duración en ms
 */
function showToastSwal(options = {}) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: options.timer || 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: options.icon || 'success',
        title: options.title || 'Operación exitosa'
    });
}

/**
 * Modal con input de texto
 * @param {Object} options - Opciones
 * @returns {Promise<string|null>} - Texto ingresado o null si cancela
 */
async function showInputModal(options = {}) {
    const defaults = {
        title: 'Ingresa un valor',
        input: 'text',
        inputPlaceholder: 'Escribe aquí...',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Este campo es requerido';
            }
        }
    };

    const result = await Swal.fire({
        ...swalConfig,
        ...defaults,
        ...options
    });

    return result.isConfirmed ? result.value : null;
}

/**
 * Modal con select/dropdown
 * @param {Object} options - Opciones
 * @param {Object} options.inputOptions - Opciones del select
 * @returns {Promise<string|null>}
 */
async function showSelectModal(options = {}) {
    const defaults = {
        title: 'Selecciona una opción',
        input: 'select',
        inputOptions: {},
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Debes seleccionar una opción';
            }
        }
    };

    const result = await Swal.fire({
        ...swalConfig,
        ...defaults,
        ...options
    });

    return result.isConfirmed ? result.value : null;
}

/**
 * Modal de confirmación con tres opciones
 * @param {Object} options - Opciones
 * @returns {Promise<'confirm'|'deny'|'cancel'>}
 */
async function showThreeWayModal(options = {}) {
    const defaults = {
        title: '¿Qué deseas hacer?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Opción 1',
        denyButtonText: 'Opción 2',
        cancelButtonText: 'Cancelar'
    };

    const result = await Swal.fire({
        ...swalConfig,
        ...defaults,
        ...options
    });

    if (result.isConfirmed) return 'confirm';
    if (result.isDenied) return 'deny';
    return 'cancel';
}
