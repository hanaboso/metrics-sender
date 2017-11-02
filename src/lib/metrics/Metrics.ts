import {ObjectUtils} from "hb-utils/dist/lib/ObjectUtils";
import {StringUtils} from "hb-utils/dist/lib/StringUtils";
import {TimeUtils} from "hb-utils/dist/lib/TimeUtils";
import {Sender} from "../udp/Sender";
import {IMetrics} from "./IMetrics";

const RESERVED_CHARS = [",", "=", " "];
const SERVER = "metrics";
const PORT = 8089;

/**
 * Use instance of this class for sending metrics UDP packets
 */
export class Metrics implements IMetrics {

    private measurement: string;
    private tags: string;
    private sender: Sender;

    /**
     *
     * @param {string} measurement
     * @param {string} name
     * @param {string} host
     * @param {string} server optional
     * @param {string} port optional
     */
    public constructor(measurement: string, name: string, host: string, server?: string, port?: number) {
        this.measurement = StringUtils.escapeChars(measurement, RESERVED_CHARS);

        const nameTag = StringUtils.escapeChars(name, RESERVED_CHARS);
        const hostTag = StringUtils.escapeChars(host, RESERVED_CHARS);
        this.tags = `name=${nameTag},host=${hostTag}`;

        this.sender = new Sender(server || SERVER, port || PORT);
    }

    /**
     * Sends UDP packet
     *
     * @param fieldSet
     * @return {Promise}
     */
    public send(fieldSet: {}): Promise<string> {
        const msg = this.createLine(fieldSet);

        return this.sender.send(msg);
    }

    /**
     * Creates line protocol compliant message
     *
     * e.g: rabbitmq-director,name=process-main,host=ip-10-12-13-14 buffer_messages=82,buffer_size=135451,
     * messages_consumed=4564654,messages_published=54657868  1465839830100400200
     *
     * @param fieldSet
     */
    public createLine(fieldSet: {}): string {
        const fields = ObjectUtils.toString(ObjectUtils.escapeProperties(fieldSet, RESERVED_CHARS));
        const timestamp = TimeUtils.nowNano();

        return `${this.measurement},${this.tags} ${fields} ${timestamp}`;
    }

}
