export default class AppError extends Error {
    constructor(
        public message: string,
        public code?: number,
    ) {
        super(message)
    }
}

export const errors = {
    
}
