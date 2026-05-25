// This code creates a reusable error-handling wrapper middleware for Express.js
export const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    };
};
