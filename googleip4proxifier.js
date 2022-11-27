function fetch() {
    return new Promise((resolve, reject) => {
        const req = require("https").request({
            hostname: "www.gstatic.cn",
            port: 443,
            path: "/ipranges/goog.json",
            method: "GET",
        }, res => {
            if (res.statusCode !== 200) {
                reject();
            }
            let result = "";
            res.on("data", data => result += data.toString().trim());
            res.on("close", () => resolve(JSON.parse(result)));
        });
        req.on("error", reject);
        req.end();
    });
}

function crid2range(crid = "0.0.0.0/0") {
    const [ipString, maskString] = crid.split("/");
    const ip = ipString.split(".").reduce((pre, cur, idx) => pre + (BigInt(cur) << BigInt(24 - idx * 8)), 0n);
    const mask = ~((1n << BigInt(32 - maskString)) - 1n);
    const startIp = ip & mask;
    const endIp = ip | ~mask;
    const startIpString = [24n, 16n, 8n, 0n].map(x => Number((startIp >> x) % 256n)).join(".");
    const endIpString = [24n, 16n, 8n, 0n].map(x => Number((endIp >> x) % 256n)).join(".");
    return [startIpString, endIpString];
}

async function main() {
    const { prefixes = [] } = await fetch();
    const crids = prefixes.map(x => x.ipv4Prefix).filter(x => !!x);
    const res = crids.map(x => crid2range(x).join("-")).join(";");
    console.log(res);
}

main();
