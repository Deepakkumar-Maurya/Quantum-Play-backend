const errorHandler = (error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        success: false,
        status: error.status || 500,
        message: error.message || "Internal Server Error",
    });
};

export { errorHandler };
