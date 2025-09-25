export const permissionError = (message) => {
    const error = new Error(message);
    error.statusCode = 403;
    return error;
};
