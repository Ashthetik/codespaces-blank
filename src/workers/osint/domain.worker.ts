import { parentPort } from "worker_threads";
import proc from "child_process";

async function DomainWhoIs(domain:string) {
    const caller = proc.spawn("whois", [domain]);

    // Convert the output to a string
    let output = "";
    for await (const chunk of caller.stdout) {
        output += chunk;
    }

    // Now we can parse the data
    const lines = output.split("\n");
    if (lines.length === 0) {
        return {};
    }
    const data: any = {};
    let lastKey = "";
    for (const line of lines) {
        if (line.includes(": ")) { // Don't split on :// in URLs and only on key: value
            const [key, value] = line.split(": ");
            data[key] = value.trim();
            lastKey = key;
        } else {
            data[lastKey] += line.trim();
        }
    }

    return data;
}

parentPort?.on('message', async (message) => {
    const { domain } = message;
    const data = await DomainWhoIs(domain);
    parentPort?.postMessage({ data });
});
