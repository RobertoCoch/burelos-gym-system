import PocketBase from 'pocketbase';

// Si estás accediendo desde otro dispositivo, intentará usar la misma IP para conectarse a PocketBase
const pbUrl = import.meta.env.VITE_PB_URL || `http://${window.location.hostname}:8090`;
const pb = new PocketBase(pbUrl);

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
