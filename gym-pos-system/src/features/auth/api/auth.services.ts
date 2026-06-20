import pb from '../../../lib/pocketbase';

export const authServices = {
    loginWithEmail: async (email: string, password: string) => {
        // Authenticate with PocketBase using the 'users' collection
        const authData = await pb.collection('users').authWithPassword(email, password);
        return authData;
    },
    logout: () => {
        pb.authStore.clear();
    },
    getCurrentUser: () => {
        return pb.authStore.model;
    },
    isAuthenticated: () => {
        return pb.authStore.isValid;
    }
};
