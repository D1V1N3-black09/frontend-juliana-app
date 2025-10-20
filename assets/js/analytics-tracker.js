// analytics-tracker.js - Sistema de seguimiento de visitas

(function() {
    'use strict';

    // Generar o recuperar session ID
    function getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('analyticsSessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analyticsSessionId', sessionId);
        }
        return sessionId;
    }

    // Obtener ID de usuario si está logueado
    function getUserId() {
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        if (userSession) {
            try {
                const session = JSON.parse(userSession);
                return session.id || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Registrar visita
    async function trackPageVisit() {
        try {
            const pageUrl = window.location.pathname + window.location.search;
            const referrer = document.referrer || null;
            const userId = getUserId();
            const sessionId = getOrCreateSessionId();

            // Solo registrar si API está disponible
            if (typeof API !== 'undefined' && API.registerVisit) {
                await API.registerVisit(pageUrl, referrer, userId, sessionId);
                console.log('📊 Visita registrada:', pageUrl);
            }
        } catch (error) {
            // Silenciar errores para no afectar la experiencia del usuario
            console.debug('Error tracking visit:', error);
        }
    }

    // Registrar visita cuando la página carga
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageVisit);
    } else {
        trackPageVisit();
    }

    // Registrar cuando cambia de página (para SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            trackPageVisit();
        }
    }).observe(document, { subtree: true, childList: true });

})();
