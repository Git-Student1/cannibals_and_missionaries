export class NoSolutionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NoSolutionError';
    }
}