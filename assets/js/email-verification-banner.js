/**
 * Email Verification Banner
 * Componente para mostrar banner de advertencia cuando el email no está verificado
 */

class EmailVerificationBanner {
    constructor() {
        this.user = this.getCurrentUser();
        this.bannerElement = null;
    }

    /**
     * Obtiene el usuario actual del localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Verifica el estado de verificación del usuario
     */
    async checkVerificationStatus() {
        if (!this.user || !this.user.id) {
            return { verified: true }; // No mostrar banner si no hay usuario
        }

        try {
            const response = await fetch(`http://localhost:5000/api/email-verification/status/${this.user.id}`);
            
            if (!response.ok) {
                return { verified: true }; // En caso de error, no mostrar banner
            }

            const status = await response.json();
            return status;
        } catch (error) {
            console.error('Error al verificar estado de email:', error);
            return { verified: true };
        }
    }

    /**
     * Crea el HTML del banner
     */
    createBannerHTML(status) {
        const restrictions = [];
        
        if (!status.can_checkout) {
            restrictions.push('realizar compras');
        }
        if (!status.can_edit_profile) {
            restrictions.push('editar perfil completo');
        }
        
        const restrictionsText = restrictions.length > 0 
            ? `No podrás: ${restrictions.join(', ')}.`
            : '';

        return `
            <div class="email-verification-banner" id="emailVerificationBanner">
                <div class="container">
                    <div class="banner-content">
                        <div class="banner-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="banner-text">
                            <strong>⚠️ Email no verificado</strong>
                            <p>
                                Tu cuenta está activa pero tu email <strong>${status.email}</strong> no está verificado. 
                                ${restrictionsText}
                            </p>
                        </div>
                        <div class="banner-actions">
                            <button class="btn-verify-now" onclick="emailBanner.verifyNow()">
                                <i class="fas fa-check-circle"></i> Verificar Ahora
                            </button>
                            <button class="btn-close-banner" onclick="emailBanner.closeBanner()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crea los estilos CSS del banner
     */
    createBannerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .email-verification-banner {
                background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
                color: #000;
                padding: 15px 0;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                animation: slideDown 0.5s ease;
            }

            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }

            .banner-content {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }

            .banner-icon {
                font-size: 32px;
                color: #d84315;
            }

            .banner-text {
                flex: 1;
                min-width: 300px;
            }

            .banner-text strong {
                display: block;
                font-size: 18px;
                margin-bottom: 5px;
            }

            .banner-text p {
                margin: 0;
                font-size: 14px;
                opacity: 0.9;
            }

            .banner-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .btn-verify-now {
                background: #fff;
                color: #ff9800;
                border: none;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn-verify-now:hover {
                background: #f5f5f5;
                transform: scale(1.05);
            }

            .btn-close-banner {
                background: transparent;
                border: none;
                color: #000;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }

            .btn-close-banner:hover {
                opacity: 1;
            }

            /* Ajustar body para compensar el banner */
            body.banner-active {
                padding-top: 100px !important;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .banner-content {
                    flex-direction: column;
                    text-align: center;
                }

                .banner-icon {
                    font-size: 24px;
                }

                .banner-text {
                    min-width: auto;
                }

                .banner-text strong {
                    font-size: 16px;
                }

                .banner-text p {
                    font-size: 13px;
                }

                body.banner-active {
                    padding-top: 140px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Muestra el banner en la página
     * DESHABILITADO: No mostrar banner de verificación
     */
    async show() {
        // Verificación de email deshabilitada - no mostrar banner
        return;
        
        /* CÓDIGO ORIGINAL DESHABILITADO:
        const status = await this.checkVerificationStatus();

        // Solo mostrar si el email no está verificado y show_banner es true
        if (!status.email_verified && status.show_banner) {
            // Crear estilos si no existen
            if (!document.querySelector('style[data-banner-styles]')) {
                const style = this.createBannerStyles();
                style.setAttribute('data-banner-styles', 'true');
            }

            // Crear banner
            const bannerHTML = this.createBannerHTML(status);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = bannerHTML;
            this.bannerElement = tempDiv.firstElementChild;

            // Insertar al inicio del body
            document.body.insertBefore(this.bannerElement, document.body.firstChild);
            document.body.classList.add('banner-active');

            // Guardar en sessionStorage que se mostró el banner (para no mostrarlo múltiples veces en la misma sesión)
            sessionStorage.setItem('verificationBannerShown', 'true');
        }
        */
    }

    /**
     * Cierra el banner (solo para esta sesión)
     */
    closeBanner() {
        if (this.bannerElement) {
            this.bannerElement.style.animation = 'slideDown 0.5s ease reverse';
            setTimeout(() => {
                this.bannerElement.remove();
                document.body.classList.remove('banner-active');
            }, 500);
        }
    }

    /**
     * Redirige a la página de verificación
     */
    verifyNow() {
        if (this.user && this.user.email) {
            // Guardar email en sessionStorage
            sessionStorage.setItem('verificationEmail', this.user.email);
            
            // Reenviar código
            this.resendVerificationCode();
            
            // Redirigir a página de verificación
            setTimeout(() => {
                window.location.href = '/pages/verify-email.html';
            }, 1500);
        }
    }

    /**
     * Reenvía el código de verificación
     */
    async resendVerificationCode() {
        try {
            const response = await fetch('http://localhost:5000/api/email-verification/resend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.user.email
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Código Enviado',
                    text: 'Hemos enviado un nuevo código a tu email',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error al reenviar código:', error);
        }
    }

    /**
     * Verifica si una funcionalidad está disponible para el usuario
     */
    async canAccess(feature) {
        if (!this.user || !this.user.id) {
            return { allowed: false, message: 'Usuario no autenticado' };
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/email-verification/check-access/${this.user.id}/${feature}`
            );

            const result = await response.json();

            if (!response.ok && result.requires_verification) {
                // Mostrar modal de verificación requerida
                this.showVerificationRequiredModal(result);
            }

            return result;
        } catch (error) {
            console.error('Error al verificar acceso:', error);
            return { allowed: false, message: 'Error al verificar acceso' };
        }
    }

    /**
     * Muestra modal cuando se requiere verificación para una acción
     */
    showVerificationRequiredModal(result) {
        Swal.fire({
            icon: 'warning',
            title: 'Verificación Requerida',
            html: `
                <p>${result.message}</p>
                <p><strong>Email:</strong> ${result.user_email}</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Verificar Ahora',
            cancelButtonText: 'Más Tarde',
            confirmButtonColor: '#ff9800'
        }).then((result) => {
            if (result.isConfirmed) {
                this.verifyNow();
            }
        });
    }
}

// Instancia global del banner
const emailBanner = new EmailVerificationBanner();

// Auto-mostrar el banner al cargar la página (si no se ha mostrado en esta sesión)
document.addEventListener('DOMContentLoaded', () => {
    // Solo mostrar si no se ha mostrado en esta sesión
    if (!sessionStorage.getItem('verificationBannerShown')) {
        emailBanner.show();
    }
});
