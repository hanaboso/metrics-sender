import * as dgram from "dgram";
import * as dns from "dns";

export class Sender {

    private serverIP: string;

    private client: dgram.Socket;

    /**
     *
     * @param {string} host
     * @param {number} port
     * @param {number} ipRefreshPeriod
     */
    public constructor(
        private host: string,
        private port: number,
        private ipRefreshPeriod: number = 60 * 1000,
    ) {

        this.client = dgram.createSocket("udp4");

        // Use hostname instead of IP in order to sen packets until IP is resolved for the first time
        this.serverIP = this.host;
        this.refreshServerIp(this);
    }

    /**
     * Sends UDP packet with message
     *
     * @param message
     * @return {Promise}
     */
    public send(message: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.send(message, 0, message.length, this.port, this.serverIP, (err) => {
                if (err) {
                    return reject(`Cannot send metrics. Error: ${err}. Msg: ${message}`);
                }

                return resolve(`Metrics sent to ${this.serverIP}:${this.port}. Msg: ${message}`);
            });
        });
    }

    /**
     * Closes the UDP client
     */
    public close(): void {
        this.client.close();
    }

    /**
     *
     * @param self
     * @private
     */
    private refreshServerIp(self: Sender): void {
        dns.lookup(self.host, (err: any, ip: string) => {
            if (!err && ip) {
                self.serverIP = ip;
            }
        });

        setTimeout(
            () => { self.refreshServerIp(self); },
            this.ipRefreshPeriod,
        );
    }

}
