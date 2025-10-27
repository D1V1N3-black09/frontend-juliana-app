const API_URL = 'http://localhost:5000/api';

class API {
    static async getProducts() {
        console.log('API: Solicitando productos...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const response = await fetch(`${API_URL}/products/visible`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error('Error al obtener productos');
            const data = await response.json();
            console.log('API: Productos recibidos:', data.length);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('API: Timeout - El servidor no respondió en 10 segundos');
                throw new Error('Timeout: El servidor tardó mucho en responder');
            }
            throw error;
        }
    }

    static async getAllProducts() {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Error al obtener productos');
        return await response.json();
    }

    static async getProduct(id) {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Error al obtener producto');
        return await response.json();
    }

    static async getProductsByCategory(category) {
        const response = await fetch(`${API_URL}/products/category/${category}`);
        if (!response.ok) throw new Error('Error al obtener productos');
        return await response.json();
    }

    static async createProduct(data) {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al crear producto');
        return await response.json();
    }

    static async updateProduct(id, data) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al actualizar producto');
        return await response.json();
    }

    static async deleteProduct(id) {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
        return await response.json();
    }

    static async register(data) {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al registrar usuario');
        }
        return await response.json();
    }

    static async login(email, password) {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al iniciar sesión');
        }
        return await response.json();
    }

    static async getUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`);
        if (!response.ok) throw new Error('Error al obtener usuario');
        return await response.json();
    }

    static async updateUser(id, data) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al actualizar usuario');
        return await response.json();
    }

    static async getAllUsers() {
        const response = await fetch(`${API_URL}/users/`);
        if (!response.ok) throw new Error('Error al obtener usuarios');
        return await response.json();
    }

    static async getAllUsersWithStats() {
        const response = await fetch(`${API_URL}/users/stats`);
        if (!response.ok) throw new Error('Error al obtener usuarios con estadísticas');
        return await response.json();
    }

    static async updateUserRole(id, role) {
        const response = await fetch(`${API_URL}/users/${id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role })
        });
        if (!response.ok) throw new Error('Error al actualizar rol del usuario');
        return await response.json();
    }

    static async deleteUser(id) {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar usuario');
        return await response.json();
    }

    static async getAllOrders() {
        const response = await fetch(`${API_URL}/orders/`);
        if (!response.ok) throw new Error('Error al obtener órdenes');
        return await response.json();
    }

    static async getUserOrders(userId) {
        const response = await fetch(`${API_URL}/orders/user?user_id=${userId}`);
        if (!response.ok) throw new Error('Error al obtener órdenes del usuario');
        return await response.json();
    }

    static async getOrder(id) {
        const response = await fetch(`${API_URL}/orders/${id}`);
        if (!response.ok) throw new Error('Error al obtener orden');
        return await response.json();
    }

    static async createOrder(data) {
        const response = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al crear orden');
        return await response.json();
    }

    static async updateOrderStatus(id, status) {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Error al actualizar estado de la orden');
        return await response.json();
    }

    static async deleteOrder(id) {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar orden');
        return await response.json();
    }

    static async getCart(userId) {
        const response = await fetch(`${API_URL}/cart/?user_id=${userId}`);
        if (!response.ok) throw new Error('Error al obtener carrito');
        return await response.json();
    }

    static async addToCart(userId, productData) {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                product_id: productData.id,
                product_name: productData.name,
                product_price: productData.price,
                product_image: productData.image,
                quantity: productData.quantity || 1
            })
        });
        if (!response.ok) throw new Error('Error al agregar al carrito');
        return await response.json();
    }

    static async updateCartItem(userId, productId, quantity) {
        const response = await fetch(`${API_URL}/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                product_id: productId,
                quantity: quantity
            })
        });
        if (!response.ok) throw new Error('Error al actualizar carrito');
        return await response.json();
    }

    static async removeFromCart(userId, productId) {
        const response = await fetch(`${API_URL}/cart/remove?user_id=${userId}&product_id=${productId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar del carrito');
        return await response.json();
    }

    static async clearCart(userId) {
        const response = await fetch(`${API_URL}/cart/clear?user_id=${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al vaciar carrito');
        return await response.json();
    }


    static async syncCart(userId, localItems) {
        const response = await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                items: localItems
            })
        });
        if (!response.ok) throw new Error('Error al sincronizar carrito');
        return await response.json();
    }

    // ==================== ANALYTICS ====================
    
    static async registerVisit(pageUrl, referrer = null, userId = null, sessionId = null) {
        try {
            const response = await fetch(`${API_URL}/analytics/visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page_url: pageUrl,
                    referrer: referrer,
                    user_id: userId,
                    session_id: sessionId
                })
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error registrando visita:', error);
            return null;
        }
    }

    static async getDashboardStats() {
        const response = await fetch(`${API_URL}/analytics/dashboard-stats`);
        if (!response.ok) throw new Error('Error al obtener estadísticas');
        const data = await response.json();
        return data.data;
    }

    static async getSalesChartData(months = 6) {
        const response = await fetch(`${API_URL}/analytics/sales-chart?months=${months}`);
        if (!response.ok) throw new Error('Error al obtener datos de ventas');
        const data = await response.json();
        return data.data;
    }

    static async getTopCategories(limit = 5) {
        const response = await fetch(`${API_URL}/analytics/top-categories?limit=${limit}`);
        if (!response.ok) throw new Error('Error al obtener categorías');
        const data = await response.json();
        return data.data;
    }
}

