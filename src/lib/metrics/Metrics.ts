import {ObjectUtils} from "hb-utils/dist/lib/ObjectUtils";
import {StringUtils} from "hb-utils/dist/lib/StringUtils";
import {TimeUtils} from "hb-utils/dist/lib/TimeUtils";
import {Sender} from "../udp/Sender";
import {IMetrics} from "./IMetrics";

const RESERVED_CHARS = [",", "=", " "];
const SERVER = "metrics";
const PORT = 8089;

export interface ITagsMap { [key: string]: string; }

/**
 * Use instance of this class for sending metrics UDP packets
 */
export class Metrics implements IMetrics {

    private measurement: string;
    private tags: ITagsMap;
    private sender: Sender;

    /**
     *
     * @param {string} measurement
     * @param {ITagsMap} tags
     * @param {string} server optional
     * @param {string} port optional
     */
    public constructor(measurement: string, tags: ITagsMap = {}, server?: string, port?: number) {
        this.measurement = StringUtils.escapeChars(measurement, RESERVED_CHARS);
        this.tags = tags;

        this.sender = new Sender(server || SERVER, port || PORT);
    }

    /**
     * Adds new tag
     *
     * @param {string} key
     * @param {string} value
     */
    public addTag(key: string, value: string) {
        this.tags[key] = value;
    }

    /**
     * Removes tag
     *
     * @param {string} key
     */
    public removeTag(key: string) {
        delete this.tags[key];
    }

    /**
     * Sends UDP packet
     *
     * @param fieldSet
     * @param includeTime
     * @return {Promise}
     */
    public send(fieldSet: {}, includeTime = true): Promise<string> {
        const msg = this.createLine(fieldSet, includeTime);

        return this.sender.send(msg);
    }

    /**
     * Close UDP connection
     */
    public close(): void {
        this.sender.close();
    }

    /**
     * Creates line protocol compliant message
     *
     * e.g: rabbitmq-director,name=process-main,host=ip-10-12-13-14 buffer_messages=82,buffer_size=135451,
     * messages_consumed=4564654,messages_published=54657868  1465839830100400200
     *
     * @param fieldSet
     * @param includeTime
     */
    private createLine(fieldSet: {}, includeTime = true): string {
        const fields = ObjectUtils.toString(ObjectUtils.escapeProperties(fieldSet, RESERVED_CHARS));
        const tags = ObjectUtils.toString(ObjectUtils.escapeProperties(this.tags, RESERVED_CHARS));
        let line = `${this.measurement},${tags} ${fields}`;

        if (includeTime) {
            const timestamp = TimeUtils.nowNano();
            line = `${line} ${timestamp}`;
        }

        return line;
    }

}
