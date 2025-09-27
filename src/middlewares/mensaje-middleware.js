export const agregarIdCliente = (req, res, next) => {
    req.body.idCliente = "cliente-prueba";
    next();
}