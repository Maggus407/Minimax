onmessage = function(e) {
    const [fileInput, startIdx, memory] = e.data;

    // Überprüfung, ob die Startadresse und die Länge des fileInput innerhalb der Grenzen von memory liegen
    if (startIdx >= 0 && startIdx + fileInput.length <= memory.length) {
        for (let i = 0; i < fileInput.length; i++) {
            memory[startIdx + i] = fileInput[i];
        }
    } else {
        postMessage("Startadresse und/oder Dateilänge überschreiten die Speichergrenzen.");
    }

    postMessage(memory);
}
