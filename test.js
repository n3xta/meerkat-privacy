const fetch = require("node-fetch");

async function getTOS() {
    const response = await fetch("http://localhost:8000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://www.decathlon.com/pages/terms-of-use" })
    });

    const data = await response.json();
    console.log("Extracted TOS:", data.tos_text);
}

getTOS().catch(console.error);