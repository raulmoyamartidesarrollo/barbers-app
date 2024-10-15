// services/UserContext.js
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    // Función para cerrar sesión
    const logout = () => {
        setUserId(null); // Restablecer el estado del usuario
    };

    return (
        <UserContext.Provider value={{ userId, setUserId, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};