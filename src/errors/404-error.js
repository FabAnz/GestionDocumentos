export const notFoundError = (message) => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};