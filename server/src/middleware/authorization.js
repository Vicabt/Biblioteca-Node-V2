const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Acceso denegado. Usuario no autenticado o rol no definido.' });
        }

        const userRole = req.user.role;

        if (allowedRoles.includes(userRole)) {
            next(); // El usuario tiene uno de los roles permitidos
        } else {
            res.status(403).json({ message: 'Acceso denegado. No tienes permiso para acceder a este recurso.' });
        }
    };
};

module.exports = { authorizeRoles };