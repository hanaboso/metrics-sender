import * as dgram from "dgram";
import {Metrics} from "../../lib/metrics/Metrics";

import { assert } from "chai";
import "mocha";

describe("Metrics", () => {

    it("should create line in defined format", () => {
        const tags = {name : "appname", host: "10.28.30.45"};
        const m = new Metrics("measurementName", tags);
        const line = m.createLine({ value1: 10000, value2: "some value" });

        const withoutTime = "measurementName,name=appname,host=10.28.30.45 value1=10000,value2=some\\ value";
        assert.lengthOf(line, withoutTime.length + 20);
        assert.lengthOf(line.substr(0, withoutTime.length), withoutTime.length);
    });

    it("should send and receive udp packet", (done) => {
        const server = dgram.createSocket("udp4");
        server.on("listening", () => {
            const tags = {name : "appname", host: "10.28.30.45"};
            const m = new Metrics("measurementName", tags, "127.0.0.1", 3333);
            m.addTag("foo", "bar");
            m.send({ value1: 10000, value2: "something" });
        });

        server.on("message", (msgBuffer) => {
            const msg = msgBuffer.toString();
            assert.include(msg, "measurementName,name=appname,host=10.28.30.45,foo=bar value1=10000,value2=something");
            done();
        });

        server.bind(3333, "127.0.0.1");
    });

});
