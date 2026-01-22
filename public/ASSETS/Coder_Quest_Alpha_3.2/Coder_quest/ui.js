const UI = {
  elements: {},

  init() {
    this.elements.outputLog = document.getElementById("output-log");
    this.elements.consoleInput = document.getElementById("console-input");
    this.elements.statusLocation = document.getElementById("status-location");
    this.elements.statusZone = document.getElementById("status-zone");
    this.elements.footerZone = document.getElementById("footer-zone");
    this.elements.btnHelp = document.getElementById("btn-help");
    this.elements.btnLook = document.getElementById("btn-look");
    this.elements.btnZones = document.getElementById("btn-zones");

    this.elements.consoleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = this.elements.consoleInput.value;
        this.elements.consoleInput.value = "";
        Engine.executeCommand(value);
      }
    });

    this.elements.btnHelp.addEventListener("click", () => Engine.showHelp());
    this.elements.btnLook.addEventListener("click", () => Engine.look());
    this.elements.btnZones.addEventListener("click", () => Engine.showZones());

    this.elements.consoleInput.focus();
  },

  renderLog(lines) {
    this.elements.outputLog.textContent = lines.join("\n");
    this.elements.outputLog.scrollTop = this.elements.outputLog.scrollHeight;
  },

  updateStatus(loc) {
    this.elements.statusLocation.textContent = "Location: " + loc.name;
    this.elements.statusZone.textContent = "Zone: " + loc.zone.toUpperCase();
    this.elements.footerZone.textContent = "Zone: " + loc.zone.toUpperCase();
  },

  setZone(zoneName) {
    document.body.className = "";
    document.body.classList.add("zone-" + zoneName);
  }
};
