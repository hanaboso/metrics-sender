export interface IMetrics {

    /**
     * Send metrics message and returns sent message content in promise resolve value
     * or returns the error message in rejection value if sending failed.
     */
    send(fieldSet: {[key: string]: any}, includeTime: boolean): Promise<string>;

    /**
     * Add new tag to list of tags
     *
     * @param {string} key
     * @param {string} value
     */
    addTag(key: string, value: string): void;

    /**
     * Removes tag from list of tags
     *
     * @param {string} key
     */
    removeTag(key: string): void;

}
