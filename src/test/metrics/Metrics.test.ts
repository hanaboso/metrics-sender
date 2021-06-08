import * as dgram from "dgram";
import {Metrics} from "../../lib/metrics/Metrics";

import { assert } from "chai";
import "mocha";
import {Socket} from "dgram";

let server: Socket = null;

describe("Metrics", () => {

    beforeEach(() => {
        server = dgram.createSocket("udp4");
        server.bind(3333, "127.0.0.1");
    })

    afterEach(() => {
        server.close();
    })

    it("should create line in defined format", () => {
        server.on("listening", async () => {
            const tags = {name : "appname", host: "10.28.30.45"};
            const m = new Metrics("measurementName", tags);

            const lineWithTime = await m.send({ value1: 10000, value2: "some value" });
            const lineWithoutTime = await m.send({ value1: 10000, value2: "some value" }, false);

            const expectedWithoutTime = "measurementName,name=appname,host=10.28.30.45 value1=10000,value2=some\\ value";
            assert.equal(expectedWithoutTime, lineWithoutTime);

            // Check if line contains timestamp at the end if generated with it
            assert.lengthOf(lineWithTime, expectedWithoutTime.length + 20);
            assert.lengthOf(lineWithTime.substr(0, expectedWithoutTime.length), expectedWithoutTime.length);
        });
    });

    it("should create line in defined format with lately added and removed tag", () => {
        server.on("listening", async () => {
            const tags = {name: "appname", host: "10.28.30.45"};
            const m = new Metrics("measurementName", tags, "127.0.0.1", 3333);

            m.addTag("added", "foo");
            m.removeTag("invalid");
            m.removeTag("host");

            const line = await m.send({value1: 10000, value2: "some value"}, false);

            const withoutTime = "measurementName,name=appname,added=foo value1=10000,value2=some\\ value";
            assert.equal(line, withoutTime);
        });
    });

    it("should send and receive udp packet", (done) => {
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
    });

});
