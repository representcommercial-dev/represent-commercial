/* Buy Your Premises selectors r2: enquiry core (private candidate).
   Enquiry form: first name, email, optional phone, asset class and size selectors.
   Pure logic only: validation limits, snapshot building and response classification.
   No network access. Delivery happens through an injected transport. */
(function () {
  "use strict";
  if (window.RCEnquiryCore) return; // load once; keep the first instance
  // Routing values carried unchanged from the approved v9-v11 planning values (P07, P08).
  // They were approved for the six-question brief flow; whether they still fit the simple
  // form is OPEN. They are not changed here and no new value is introduced.
  var FORM_STREAM = "buy-business-premises-brief";          // P07 (approved for brief flow; fit OPEN)
  var CTA_CLICKED = "brief-review";                          // P08 (approved for brief flow; fit OPEN)
  var REQUIREMENT_CAP = 1500;                                // P11 cap retained
  var ID_RX = /^bp-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  function uuid() {
    var c = window.crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
    var b = new Uint8Array(16);
    if (c && c.getRandomValues) c.getRandomValues(b); else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }

  var ASSET_CLASSES=Object.freeze(["Industrial or warehouse", "Office", "Retail", "Showroom or bulky goods", "Other / not sure"]);
  var SIZES=Object.freeze(["Under 500 m²", "500 to 1,500 m²", "1,500 to 3,000 m²", "3,000 to 5,000 m²", "Over 5,000 m²", "Not sure yet"]);
  function requirementText(contact) {
    if(!contact || ASSET_CLASSES.indexOf(contact.asset)<0 || SIZES.indexOf(contact.size)<0) return null;
    return "Asset class: "+contact.asset+"\nSize: "+contact.size;
  }

  // P15a: one immutable snapshot per submission ID.
  // Only explicit selector values are used. No location, budget or timing is inferred.
  // landing_page and attribution are deliberately absent.
  // No attribution, consent or measurement fields are added here.
  function buildSnapshot(contact) {
    var req = requirementText(contact);
    var first = String((contact && contact.first) || "").trim();
    var email = String((contact && contact.email) || "").trim();
    if (req === null || !first || !email) return null;
    var id = "bp-" + uuid();
    var payload = Object.freeze({
      first_name: first,
      email: email,
      phone: String((contact && contact.phone) || "").trim(),
      requirement: req,
      property_type: contact.asset,
      form_stream: FORM_STREAM,
      enquiry_service: "Buyer's Agency and Acquisition Advisory",
      website_submission_id: id,
      cta_clicked: CTA_CLICKED,
      service_line: "Buyer-Side Acquisition / Advisory",
      enquiry_type: "acquisition",
      intent_family: "Buyer Acquisition",
      buyer_type: "Owner-occupier"
    });
    return Object.freeze({ id: id, size: contact.size, payload: payload });
  }

  // Plan section 5. raw = {kind:"response", status, contentType, bodyText} | {kind:"timeout"|"network-error"}.
  // Returns "accepted" | "provider_error" | "uncertain". Never "not received": no response qualifies today.
  function classify(raw) {
    if (!raw || raw.kind !== "response") return "uncertain";
    if (!/^application\/json\b/i.test(String(raw.contentType || ""))) return "uncertain";
    var body;
    try { body = JSON.parse(raw.bodyText); } catch (e) { return "uncertain"; }
    if (!body || typeof body !== "object" || Array.isArray(body)) return "uncertain";
    if (raw.status === 200) return body.success === true ? "accepted" : "uncertain";
    if (raw.status === 400 && body.success === false && body.body && typeof body.body === "object" && typeof body.body.message === "string") return "provider_error";
    if (raw.status === 429 && body.success === false && typeof body.message === "string") return "provider_error";
    return "uncertain";
  }

  // One attempt, no automatic retry (P15). A missing transport or timeout is Uncertain.
  function deliver(transport, snapshot, timeoutMs) {
    if (!snapshot || !ID_RX.test(snapshot.id) || snapshot.payload.website_submission_id !== snapshot.id) return Promise.resolve({ category: "uncertain", raw: { kind: "invalid-snapshot" } });
    if (!transport || typeof transport.send !== "function") return Promise.resolve({ category: "uncertain", raw: { kind: "no-transport" } });
    var ms = timeoutMs || 20000;
    var timer;
    var timeout = new Promise(function (res) { timer = setTimeout(function () { res({ kind: "timeout" }); }, ms); });
    var attempt = Promise.resolve().then(function () { return transport.send(snapshot); }).catch(function () { return { kind: "network-error" }; });
    return Promise.race([attempt, timeout]).then(function (raw) {
      clearTimeout(timer);
      return { category: classify(raw), raw: raw };
    });
  }

  window.RCEnquiryCore = Object.freeze({
    ASSET_CLASSES: ASSET_CLASSES, SIZES: SIZES,
    FORM_STREAM: FORM_STREAM, CTA_CLICKED: CTA_CLICKED, REQUIREMENT_CAP: REQUIREMENT_CAP, ID_RX: ID_RX,
    requirementText: requirementText, buildSnapshot: buildSnapshot, classify: classify, deliver: deliver
  });
})();
