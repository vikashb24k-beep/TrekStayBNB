const wrapAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve()
            .then(() => fn(req, res, next))
            .catch(next);
    };
};

module.exports = wrapAsync;
