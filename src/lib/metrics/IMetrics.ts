export interface IMetrics {

    /**
     * Send metrics message and returns sent message content in promise value
     */
    send(fieldSet: {[key: string]: any}): Promise<string>;

}
