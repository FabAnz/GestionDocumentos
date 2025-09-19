export const validateRequest = (schema, reqValidate) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[reqValidate], { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(err => err.message) });
        }
        req[reqValidate] = value;
        next();
    }
}