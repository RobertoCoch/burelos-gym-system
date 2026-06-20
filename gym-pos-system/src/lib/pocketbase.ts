import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Interceptor ANTES de enviar la petición
pb.beforeSend = function (url, options) {
    // Aquí puedes inyectar headers extra si es necesario.
    // pb ya inyecta el token en la cabecera 'Authorization' automáticamente si pb.authStore.isValid
    return { url, options };
};

// Interceptor DESPUÉS de recibir respuesta (o error)
pb.afterSend = function (response, data) {
    // Si la respuesta no es 200 (error) y es un 401 (Unauthorized)
    if (response.status === 401) {
        // Token expirado o inválido -> forzar cierre de sesión local
        pb.authStore.clear();
        // Dependiendo de tu router, podrías despachar un evento o redirigir
        // window.location.href = '/login'; 
    }
    return Object.assign(data, { __response: response });
};

export default pb;
