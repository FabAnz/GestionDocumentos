const fetchService = {
    async get(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: "GET",
                ...options
            });
            if (!response.ok) {
                throw new Error(`Error en la petición GET: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async post(url, data, options = {}) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                body: JSON.stringify(data),
                ...options
            });
            if (!response.ok) {
                throw new Error(`Error en la petición POST: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async put(url, data, options = {}) {
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                body: JSON.stringify(data),
                ...options
            });
            if (!response.ok) {
                throw new Error(`Error en la petición PUT: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async delete(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: "DELETE",
                ...options
            });
            if (!response.ok) {
                throw new Error(`Error en la petición DELETE: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};

export default fetchService;
