var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  CONTACT_NOTE_LIST_VIEW_TYPE: () => CONTACT_NOTE_LIST_VIEW_TYPE,
  CURRENT_SCHEMA_VERSION: () => CURRENT_SCHEMA_VERSION,
  DEFAULT_CONFIGURATION: () => DEFAULT_CONFIGURATION,
  default: () => ContactNotePlugin3
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");

// src/views/ContactsView.ts
var import_obsidian4 = require("obsidian");

// src/Contact.ts
var Contact = class _Contact {
  constructor(file) {
    this.file = file;
    this.firstName = "";
    this.middleName = "";
    this.lastName = "";
    this.displayName = "";
    this.title = "";
    this.company = "";
    this.department = "";
    this.photo = "";
    this.emails = [];
    this.phoneNumbers = [];
    this.birthday = "";
    this.lastInteraction = "";
    this.socials = [];
    this.rawFrontmatter = {};
    this.frontmatterLinks = [];
  }
  static fromCache(file, frontmatter, frontmatterLinks, contactNote) {
    const contact = new _Contact(file);
    contact.update(frontmatter, frontmatterLinks, contactNote);
    return contact;
  }
  update(frontmatter, frontmatterLinks, contactNote) {
    this.rawFrontmatter = frontmatter;
    this.frontmatterLinks = frontmatterLinks != null ? frontmatterLinks : [];
    for (const field of contactNote.getFields()) {
      if (field.kind === "socials") continue;
      const raw = frontmatter[contactNote.getReadKey(field)];
      if (field.kind === "scalar") {
        this[field.key] = trimStr(raw);
      } else {
        this[field.key] = parseStrArr(raw);
      }
    }
    this.socials = [];
    const socialsField = contactNote.getField("socials");
    const socialsKey = socialsField ? contactNote.getReadKey(socialsField) : "socials";
    const socialsRaw = frontmatter[socialsKey];
    if (Array.isArray(socialsRaw)) {
      for (const item of socialsRaw) {
        if (item && typeof item === "object") {
          for (const [name, handle] of Object.entries(item)) {
            const h = typeof handle === "string" ? handle.trim() : "";
            if (!h) continue;
            this.socials.push({ name: name.toLowerCase(), handle: h });
          }
        }
      }
    }
  }
  get isValid() {
    return !!(this.firstName && this.lastName);
  }
  getFieldLink(readKey) {
    return this.frontmatterLinks.find((l) => l.key === readKey);
  }
};
function trimStr(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v !== "string") return "";
  return v.trim();
}
function parseStrArr(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((item) => typeof item === "string");
  if (typeof v !== "string") return [];
  return [v];
}

// src/ContactCard.ts
var import_obsidian = require("obsidian");
var SOCIAL_BASE_URLS = {
  twitter: "https://twitter.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  github: "https://github.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  tiktok: "https://tiktok.com",
  bluesky: "https://bsky.app",
  reddit: "https://reddit.com",
  telegram: "https://t.me",
  twitch: "https://twitch.tv",
  snapchat: "https://snapchat.com",
  pinterest: "https://pinterest.com"
};
var SOCIAL_SVG_PATHS = {
  twitter: "M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z",
  instagram: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  facebook: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  bluesky: "M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026",
  reddit: "M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z",
  discord: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
  telegram: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  twitch: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z",
  snapchat: "M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z",
  pinterest: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"
};
function buildContactCard(pluginId, app, contactNote, container, contact, options = {}) {
  var _a, _b, _c, _d, _e, _f;
  const { condensed = false, clickable = false, showDetails = true, lastNameFirst = false, showBirthday = false, showLastInteraction = false, showLastModified = false } = options;
  const displayName = resolveDisplayName(contact, lastNameFirst);
  const card = container.createDiv({ cls: `${pluginId}-card` });
  if (clickable) {
    card.addClass("is-clickable");
    card.addEventListener("click", () => {
      void app.workspace.getLeaf(false).openFile(contact.file);
    });
  }
  if (!contact.isValid) {
    const missingFields = [];
    const firstNameField = contactNote.getField("firstName");
    const lastNameField = contactNote.getField("lastName");
    if (!contact.firstName) missingFields.push(firstNameField ? contactNote.getReadKey(firstNameField) : "firstName");
    if (!contact.lastName) missingFields.push(lastNameField ? contactNote.getReadKey(lastNameField) : "lastName");
    const errorEl = card.createDiv({ cls: `${pluginId}-card-error` });
    errorEl.createEl("strong", { text: "Contact note is missing required fields: " });
    errorEl.createSpan({ text: missingFields.join(", ") });
    errorEl.createEl("p", { text: "Add these properties to the frontmatter to display this contact." });
    return errorEl;
  }
  const showModified = showLastModified;
  const showInteraction = showLastInteraction && contact.lastInteraction;
  if (showModified || showInteraction) {
    const stripEl = card.createDiv({ cls: `${pluginId}-card-top-strip` });
    if (showModified) {
      const modifiedEl = stripEl.createDiv({ cls: `${pluginId}-card-last-modified` });
      const iconEl = modifiedEl.createSpan({ cls: `${pluginId}-card-last-modified-icon` });
      (0, import_obsidian.setIcon)(iconEl, "file-clock");
      modifiedEl.createSpan({ text: new Date(contact.file.stat.mtime).toLocaleString(void 0, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) });
    }
    if (showInteraction) {
      const interactionEl = stripEl.createDiv({ cls: `${pluginId}-card-last-interaction` });
      const lastInteractionField = contactNote.getField("lastInteraction");
      const iconEl = interactionEl.createSpan({ cls: `${pluginId}-card-last-interaction-icon` });
      (0, import_obsidian.setIcon)(iconEl, (_a = contactNote.getIcon(lastInteractionField)) != null ? _a : "");
      interactionEl.createSpan({ text: contact.lastInteraction });
    }
  }
  const photoContainer = card.createDiv({ cls: `${pluginId}-card-photo` });
  if (contact.photo) {
    const photoFile = app.vault.getAbstractFileByPath(contact.photo);
    if (photoFile instanceof import_obsidian.TFile) {
      const img = photoContainer.createEl("img", { cls: `${pluginId}-card-photo-img` });
      img.src = app.vault.getResourcePath(photoFile);
      img.alt = displayName || "Contact photo";
    } else {
      (0, import_obsidian.setIcon)(photoContainer, "user-round");
      photoContainer.children[0].classList.add(`${pluginId}-card-photo-default`);
      photoContainer.children[0].classList.remove("svg-icon");
    }
  } else {
    (0, import_obsidian.setIcon)(photoContainer, "user-round");
    photoContainer.children[0].classList.add(`${pluginId}-card-photo-default`);
    photoContainer.children[0].classList.remove("svg-icon");
  }
  const infoEl = card.createDiv({ cls: `${pluginId}-card-info` });
  if (displayName) {
    infoEl.createDiv({ cls: `${pluginId}-card-name`, text: displayName });
  }
  if (!condensed && contact.title) {
    const titleEl = infoEl.createDiv({ cls: `${pluginId}-card-title` });
    renderLinkableValue(app, contactNote, contact, "title", contact.title, titleEl);
  }
  if (!condensed && (contact.company || contact.department)) {
    const rowEl = infoEl.createDiv({ cls: `${pluginId}-card-company-row` });
    if (contact.company) {
      const companyEl = rowEl.createDiv({ cls: `${pluginId}-card-company` });
      const companyField = contactNote.getField("company");
      const iconEl = companyEl.createSpan({ cls: `${pluginId}-card-detail-icon` });
      (0, import_obsidian.setIcon)(iconEl, (_b = contactNote.getIcon(companyField)) != null ? _b : "");
      const valueEl = companyEl.createSpan();
      renderLinkableValue(app, contactNote, contact, "company", contact.company, valueEl);
    }
    if (contact.department) {
      const departmentEl = rowEl.createDiv({ cls: `${pluginId}-card-department` });
      const departmentField = contactNote.getField("department");
      const iconEl = departmentEl.createSpan({ cls: `${pluginId}-card-detail-icon` });
      (0, import_obsidian.setIcon)(iconEl, (_c = contactNote.getIcon(departmentField)) != null ? _c : "");
      const valueEl = departmentEl.createSpan();
      renderLinkableValue(app, contactNote, contact, "department", contact.department, valueEl);
    }
  }
  if (!condensed && showBirthday && contact.birthday) {
    const birthdayEl = infoEl.createDiv({ cls: `${pluginId}-card-birthday` });
    const birthdayField = contactNote.getField("birthday");
    const iconEl = birthdayEl.createSpan({ cls: `${pluginId}-card-detail-icon` });
    (0, import_obsidian.setIcon)(iconEl, (_d = contactNote.getIcon(birthdayField)) != null ? _d : "");
    birthdayEl.createSpan({ text: contact.birthday });
  }
  if (!showDetails) return card;
  if (contact.emails.length > 0 || contact.phoneNumbers.length > 0 || contact.socials.length > 0) {
    const detailsEl = card.createDiv({ cls: `${pluginId}-card-details` });
    if (contact.socials.length > 0) {
      const socialsEl = detailsEl.createDiv({ cls: `${pluginId}-card-socials` });
      for (const social of contact.socials) {
        const row = socialsEl.createDiv({ cls: `${pluginId}-card-detail-row` });
        const iconEl = row.createSpan({ cls: `${pluginId}-card-detail-icon` });
        const svgPath = getSocialIcon(social.name);
        if (svgPath) {
          const svg = iconEl.createSvg("svg", { attr: { role: "img", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" } });
          svg.createSvg("path", { attr: { d: svgPath } });
        } else {
          (0, import_obsidian.setIcon)(iconEl, "link");
        }
        const url = getSocialUrl(social);
        if (url) {
          row.createEl("a", { cls: `${pluginId}-card-detail-value`, text: social.handle, href: url });
        } else {
          row.createSpan({ cls: `${pluginId}-card-detail-value`, text: social.handle });
        }
      }
    }
    if (contact.emails.length > 0) {
      const emailsField = contactNote.getField("emails");
      const emailsEl = detailsEl.createDiv({ cls: `${pluginId}-card-emails` });
      for (const email of contact.emails) {
        const row = emailsEl.createDiv({ cls: `${pluginId}-card-detail-row` });
        const emailIcon = row.createSpan({ cls: `${pluginId}-card-detail-icon` });
        (0, import_obsidian.setIcon)(emailIcon, (_e = contactNote.getIcon(emailsField)) != null ? _e : "");
        row.createEl("a", { cls: `${pluginId}-card-detail-value`, text: email, href: `mailto:${email}` });
      }
    }
    if (contact.phoneNumbers.length > 0) {
      const phoneNumbersField = contactNote.getField("phoneNumbers");
      const phonesEl = detailsEl.createDiv({ cls: `${pluginId}-card-phones` });
      for (const phone of contact.phoneNumbers) {
        const row = phonesEl.createDiv({ cls: `${pluginId}-card-detail-row` });
        const phoneIcon = row.createSpan({ cls: `${pluginId}-card-detail-icon` });
        (0, import_obsidian.setIcon)(phoneIcon, (_f = contactNote.getIcon(phoneNumbersField)) != null ? _f : "");
        row.createEl("a", {
          cls: `${pluginId}-card-detail-value`,
          text: phone,
          href: `tel:${phone.replace(/[\s\-().]/g, "")}`
        });
      }
    }
  }
}
function renderLinkableValue(app, contactNote, contact, fieldKey, fallbackText, parent) {
  const field = contactNote.getField(fieldKey);
  if (!(field == null ? void 0 : field.allowsInternalLink)) {
    parent.setText(fallbackText);
    return;
  }
  const linkEntry = contact.getFieldLink(contactNote.getReadKey(field));
  if (!linkEntry) {
    parent.setText(fallbackText);
    return;
  }
  const displayText = linkEntry.displayText && linkEntry.displayText.trim() ? linkEntry.displayText : linkEntry.link;
  const dest = app.metadataCache.getFirstLinkpathDest(linkEntry.link, contact.file.path);
  if (!dest) {
    parent.setText(displayText);
    return;
  }
  const anchor = parent.createEl("a", {
    cls: "internal-link",
    text: displayText,
    attr: {
      href: linkEntry.link,
      "data-href": linkEntry.link,
      target: "_blank",
      rel: "noopener"
    }
  });
  anchor.addEventListener("click", (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    void app.workspace.openLinkText(linkEntry.link, contact.file.path, evt.ctrlKey || evt.metaKey);
  });
}
function resolveDisplayName(contact, lastNameFirst) {
  if (lastNameFirst) {
    return [contact.lastName + ",", contact.firstName, contact.middleName].filter(Boolean).join(" ");
  }
  if (contact.displayName) return contact.displayName;
  return [contact.firstName, contact.middleName, contact.lastName].filter(Boolean).join(" ");
}
function getSocialIcon(name) {
  var _a;
  return (_a = SOCIAL_SVG_PATHS[name]) != null ? _a : null;
}
function getSocialUrl(social) {
  const base = SOCIAL_BASE_URLS[social.name];
  if (!base) return null;
  const handle = social.handle.replace(/^@/, "");
  switch (social.name) {
    case "twitter":
    case "instagram":
    case "github":
    case "facebook":
    case "telegram":
    case "twitch":
    case "pinterest":
      return `${base}/${handle}`;
    case "youtube":
    case "tiktok":
      return `${base}/@${handle}`;
    case "linkedin":
      return `${base}/in/${handle}`;
    case "bluesky":
      return `${base}/profile/${handle}`;
    case "reddit":
      return `${base}/user/${handle}`;
    case "snapchat":
      return `${base}/add/${handle}`;
    default:
      return null;
  }
}

// src/modals/NewContactNoteModal.ts
var import_obsidian2 = require("obsidian");
var NewContactNoteModal = class extends import_obsidian2.Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }
  onOpen() {
    this.setTitle("New contact");
    const { contentEl } = this;
    let firstName = "";
    let lastName = "";
    new import_obsidian2.Setting(contentEl).setName("First name").addText(
      (text) => text.onChange((value) => {
        firstName = value;
      })
    );
    new import_obsidian2.Setting(contentEl).setName("Last name").addText(
      (text) => text.onChange((value) => {
        lastName = value;
      })
    );
    new import_obsidian2.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Create").setCta().onClick(async () => {
        this.close();
        const file = await this.createContactNote(firstName.trim(), lastName.trim());
        await this.plugin.app.workspace.getLeaf(false).openFile(file);
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
  //#region Utilities
  async createContactNote(firstName, lastName) {
    const { app, configuration } = this.plugin;
    const rawFolderPath = configuration.useFolder ? (0, import_obsidian2.normalizePath)(configuration.folderPath) : "";
    const resolvedFolderPath = rawFolderPath === "/" ? "" : rawFolderPath;
    if (resolvedFolderPath && !app.vault.getAbstractFileByPath(resolvedFolderPath)) {
      await app.vault.createFolder(resolvedFolderPath);
    }
    const folderPrefix = resolvedFolderPath ? `${resolvedFolderPath}/` : "";
    const originalFileName = [firstName, lastName].filter((s) => s.trim()).join(" ") || "New Contact";
    let resolvedFileName = originalFileName;
    let counter = 1;
    while (app.vault.getAbstractFileByPath(`${folderPrefix}${resolvedFileName}.md`)) {
      resolvedFileName = `${originalFileName} ${counter++}`;
    }
    if (resolvedFileName !== originalFileName) {
      new import_obsidian2.Notice(`A contact named ${originalFileName} already exists. Renamed to ${resolvedFileName}.`);
    }
    const filePath = `${folderPrefix}${resolvedFileName}.md`;
    const tag = !configuration.useFolder && configuration.tag.trim() ? configuration.tag.trim() : void 0;
    const content = this.plugin.contactNote.buildContactNote(firstName, lastName, tag);
    return app.vault.create(filePath, content);
  }
  //#endregion
};

// src/modals/EditViewFilterModal.ts
var import_obsidian3 = require("obsidian");
var NO_VALUE_OPERATORS = ["exists", "is true", "is false"];
var EditViewFilterModal = class extends import_obsidian3.Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    new import_obsidian3.Setting(contentEl).setName("Edit view filter").setHeading().setDesc("Contacts in the view will be limited to those matching all conditions below.");
    const listEl = contentEl.createDiv({ cls: `${this.plugin.manifest.id}-filter-container` });
    this.renderRows(listEl);
    new import_obsidian3.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Add filter condition").onClick(async () => {
        this.plugin.configuration.viewFilters.push({ property: "", operator: "contains", value: "" });
        await this.plugin.saveConfiguration();
        this.renderRows(listEl);
      })
    );
  }
  onClose() {
    const cleaned = this.plugin.configuration.viewFilters.filter(
      (f) => f.property.trim() !== ""
    );
    if (cleaned.length !== this.plugin.configuration.viewFilters.length) {
      this.plugin.configuration.viewFilters = cleaned;
      void this.plugin.saveConfiguration();
    }
    this.contentEl.empty();
  }
  renderRows(containerEl) {
    containerEl.empty();
    const filters = this.plugin.configuration.viewFilters;
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      const setting = new import_obsidian3.Setting(containerEl).setName("").addText(
        (text) => text.setPlaceholder("Frontmatter key").setValue(filter.property).onChange(async (value) => {
          filters[i].property = value;
          await this.plugin.saveConfiguration();
        })
      ).addDropdown(
        (dd) => dd.addOption("contains", "Contains").addOption("is", "Is").addOption("exists", "Exists").addOption("is true", "Is true").addOption("is false", "Is false").setValue(filter.operator).onChange(async (value) => {
          filters[i].operator = value;
          if (NO_VALUE_OPERATORS.includes(filters[i].operator)) {
            filters[i].value = "";
          }
          await this.plugin.saveConfiguration();
          this.renderRows(containerEl);
        })
      );
      if (!NO_VALUE_OPERATORS.includes(filter.operator)) {
        setting.addText(
          (text) => text.setPlaceholder("Value").setValue(filter.value).onChange(async (value) => {
            filters[i].value = value;
            await this.plugin.saveConfiguration();
          })
        );
      }
      setting.addExtraButton(
        (btn) => btn.setIcon("x").setTooltip("Remove filter").onClick(async () => {
          filters.splice(i, 1);
          await this.plugin.saveConfiguration();
          this.renderRows(containerEl);
        })
      );
    }
  }
};

// src/views/ContactsView.ts
var DEFAULT_VIEW_OPTIONS = {
  condensedList: true,
  lastNameFirst: true,
  showContactDetails: false,
  viewFilters: []
};
var ContactsView = class extends import_obsidian4.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.contacts = /* @__PURE__ */ new Map();
    this.searchQuery = "";
    this.showSearch = false;
    this.letterFilter = "";
    this.plugin = plugin;
  }
  getViewType() {
    return CONTACT_NOTE_LIST_VIEW_TYPE;
  }
  getDisplayText() {
    return this.plugin.configuration.viewName || "Contacts";
  }
  getIcon() {
    return "book-user";
  }
  onOpen() {
    this.initContacts();
    this.registerEvent(
      this.app.metadataCache.on("changed", (file, _data, cache) => {
        const isContact = this.plugin.isContactFile(file);
        const wasContact = this.contacts.has(file.path);
        if (!isContact) {
          if (wasContact) {
            this.contacts.delete(file.path);
            this.renderCards();
          }
          return;
        }
        const fm = cache.frontmatter;
        if (!fm) {
          if (wasContact) {
            this.contacts.delete(file.path);
            this.renderCards();
          }
          return;
        }
        const existing = this.contacts.get(file.path);
        if (existing) {
          existing.update(fm, cache.frontmatterLinks, this.plugin.contactNote);
        } else {
          this.contacts.set(file.path, Contact.fromCache(file, fm, cache.frontmatterLinks, this.plugin.contactNote));
        }
        this.renderCards();
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (this.contacts.delete(file.path)) {
          this.renderCards();
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        this.contacts.delete(oldPath);
        if (!(file instanceof import_obsidian4.TFile) || !this.plugin.isContactFile(file)) return;
        const cache = this.app.metadataCache.getFileCache(file);
        const fm = cache == null ? void 0 : cache.frontmatter;
        if (!fm) return;
        this.contacts.set(file.path, Contact.fromCache(file, fm, cache == null ? void 0 : cache.frontmatterLinks, this.plugin.contactNote));
        this.renderCards();
      })
    );
    this.registerEvent(
      this.plugin.events.on("configuration-changed", () => {
        this.reinit();
      })
    );
    this.render();
    return Promise.resolve();
  }
  onClose() {
    return Promise.resolve();
  }
  reinit() {
    this.initContacts();
    this.render();
  }
  openOptionsMenu(e) {
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (item) => item.setTitle("Condensed").setChecked(this.plugin.configuration.condensedList).onClick(async () => {
        this.plugin.configuration.condensedList = !this.plugin.configuration.condensedList;
        if (this.plugin.configuration.condensedList) {
          this.plugin.configuration.showContactDetails = false;
        }
        await this.plugin.saveConfiguration();
      })
    );
    if (!this.plugin.configuration.condensedList) {
      menu.addItem(
        (item) => item.setTitle("Show contact details").setChecked(this.plugin.configuration.showContactDetails).onClick(async () => {
          this.plugin.configuration.showContactDetails = !this.plugin.configuration.showContactDetails;
          await this.plugin.saveConfiguration();
        })
      );
    }
    menu.addItem(
      (item) => item.setTitle("Last name first").setChecked(this.plugin.configuration.lastNameFirst).onClick(async () => {
        this.plugin.configuration.lastNameFirst = !this.plugin.configuration.lastNameFirst;
        await this.plugin.saveConfiguration();
      })
    );
    menu.addSeparator();
    menu.addItem(
      (item) => item.setTitle("Edit view filter\u2026").setIcon("filter").onClick(() => new EditViewFilterModal(this.plugin).open())
    );
    menu.showAtMouseEvent(e);
  }
  initContacts() {
    this.contacts.clear();
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (!this.plugin.isContactFile(file)) continue;
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache == null ? void 0 : cache.frontmatter;
      if (!fm) continue;
      this.contacts.set(file.path, Contact.fromCache(file, fm, cache == null ? void 0 : cache.frontmatterLinks, this.plugin.contactNote));
    }
  }
  render() {
    const container = this.contentEl;
    container.empty();
    container.addClass(`${this.plugin.manifest.id}-view`);
    if (this.plugin.configuration.condensedList) {
      container.addClass(`${this.plugin.manifest.id}-cards-condensed`);
    } else {
      container.removeClass(`${this.plugin.manifest.id}-cards-condensed`);
    }
    const headerEl = container.createDiv({ cls: `${this.plugin.manifest.id}-view-header` });
    headerEl.createEl("h1", {
      cls: `${this.plugin.manifest.id}-view-title`,
      text: this.plugin.configuration.viewName || "Contacts"
    });
    const btnGroup = headerEl.createDiv({ cls: `${this.plugin.manifest.id}-view-header-btns` });
    const newBtn = btnGroup.createEl("button", { cls: `${this.plugin.manifest.id}-view-header-btn clickable-icon` });
    (0, import_obsidian4.setIcon)(newBtn, "user-plus");
    newBtn.setAttribute("aria-label", "New contact");
    newBtn.addEventListener("click", () => new NewContactNoteModal(this.plugin).open());
    const searchBtn = btnGroup.createEl("button", { cls: `${this.plugin.manifest.id}-view-header-btn clickable-icon` });
    (0, import_obsidian4.setIcon)(searchBtn, "search");
    searchBtn.setAttribute("aria-label", "Search contacts");
    if (this.showSearch) searchBtn.addClass("is-active");
    searchBtn.addEventListener("click", () => {
      this.showSearch = !this.showSearch;
      if (!this.showSearch) this.searchQuery = "";
      this.render();
    });
    const menuBtn = btnGroup.createEl("button", { cls: `${this.plugin.manifest.id}-view-header-btn clickable-icon` });
    (0, import_obsidian4.setIcon)(menuBtn, "more-vertical");
    menuBtn.setAttribute("aria-label", "View options");
    menuBtn.addEventListener("click", (e) => this.openOptionsMenu(e));
    if (this.showSearch) {
      const searchInput = container.createEl("input", {
        cls: `${this.plugin.manifest.id}-view-search`,
        attr: { type: "text", placeholder: "Search contacts\u2026" }
      });
      searchInput.value = this.searchQuery;
      searchInput.addEventListener("input", () => {
        this.searchQuery = searchInput.value;
        this.renderCards();
      });
      searchInput.focus();
    }
    container.createEl("hr");
    const alphaBar = container.createDiv({ cls: `${this.plugin.manifest.id}-view-alpha-bar` });
    const alphaBtns = alphaBar.createDiv({ cls: `${this.plugin.manifest.id}-view-alpha-btns` });
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      const btn = alphaBtns.createDiv({ cls: `clickable-icon ${this.plugin.manifest.id}-view-alpha-btn` });
      btn.setText(letter);
      if (this.letterFilter === letter) btn.addClass("is-active");
      btn.addEventListener("click", () => {
        this.letterFilter = this.letterFilter === letter ? "" : letter;
        this.render();
      });
    }
    container.createEl("hr");
    this.renderCards();
  }
  renderCards() {
    const container = this.contentEl;
    container.querySelectorAll(`.${this.plugin.manifest.id}-card, .${this.plugin.manifest.id}-empty`).forEach((el) => el.remove());
    const query = this.searchQuery.toLowerCase().trim();
    const letter = this.letterFilter;
    const viewFilters = this.plugin.configuration.viewFilters.filter(
      (f) => f.property.trim() !== ""
    );
    const filtered = [...this.contacts.values()].filter((contact) => {
      if (viewFilters.some((f) => !matchesFilter(contact.rawFrontmatter, f))) return false;
      if (letter && !contact.lastName.toUpperCase().startsWith(letter)) return false;
      if (!query) return true;
      return [contact.firstName, contact.lastName, contact.middleName, contact.displayName].some((v) => v.toLowerCase().includes(query));
    }).sort(compareContacts);
    if (filtered.length === 0) {
      container.createEl("p", {
        cls: `${this.plugin.manifest.id}-empty`,
        text: query || letter ? "No contacts match your filter." : "No contact notes found."
      });
      return;
    }
    const condensed = this.plugin.configuration.condensedList;
    const lastNameFirst = this.plugin.configuration.lastNameFirst;
    const showDetails = this.plugin.configuration.showContactDetails;
    for (const contact of filtered) {
      buildContactCard(this.plugin.manifest.id, this.plugin.app, this.plugin.contactNote, container, contact, { condensed, clickable: true, showDetails, lastNameFirst });
    }
  }
};
function compareContacts(a, b) {
  const aValid = !!(a.firstName && a.lastName);
  const bValid = !!(b.firstName && b.lastName);
  if (aValid !== bValid) return aValid ? -1 : 1;
  if (!aValid) return 0;
  return `${a.lastName} ${a.firstName}`.toLowerCase().localeCompare(`${b.lastName} ${b.firstName}`.toLowerCase());
}
function matchesFilter(fm, filter) {
  const raw = fm[filter.property];
  switch (filter.operator) {
    case "exists":
      return raw !== void 0 && raw !== null && raw !== "";
    case "is true":
      return raw === true || String(raw).toLowerCase() === "true";
    case "is false":
      return raw === false || String(raw).toLowerCase() === "false";
    default: {
      if (raw === void 0 || raw === null) return false;
      const val = filter.value.toLowerCase();
      if (Array.isArray(raw)) {
        return raw.some((item) => {
          const s2 = String(item).toLowerCase();
          return filter.operator === "is" ? s2 === val : s2.includes(val);
        });
      }
      if (typeof raw !== "string") return false;
      const s = String(raw).toLowerCase();
      return filter.operator === "is" ? s === val : s.includes(val);
    }
  }
}

// src/ContactNoteSettingTab.ts
var import_obsidian6 = require("obsidian");

// src/suggesters/FolderSuggest.ts
var import_obsidian5 = require("obsidian");
var FolderSuggest = class extends import_obsidian5.AbstractInputSuggest {
  constructor(app, inputEl, excludeRoot = false) {
    super(app, inputEl);
    this.inputEl = inputEl;
    this.excludeRoot = excludeRoot;
  }
  getSuggestions(query) {
    const q = query.toLowerCase();
    const out = [];
    const collect = (folder) => {
      const isRoot = folder.path === "" || folder.path === "/";
      if (!(isRoot && this.excludeRoot) && folder.path.toLowerCase().includes(q)) {
        out.push(folder.path);
      }
      for (const child of folder.children) {
        if (child instanceof import_obsidian5.TFolder) collect(child);
      }
    };
    collect(this.app.vault.getRoot());
    return out;
  }
  renderSuggestion(value, el) {
    el.setText(value || "/");
  }
  selectSuggestion(value) {
    this.inputEl.value = value;
    this.inputEl.trigger("input");
    this.close();
  }
};

// src/ContactNoteSettingTab.ts
var DEFAULT_SETTINGS = {
  useFolder: true,
  folderPath: "Contacts",
  tag: "contact",
  viewName: "Contacts",
  baseFolderPath: "",
  showLastModified: true,
  frontmatterCustomizations: {}
};
var ContactNoteSettingTab = class extends import_obsidian6.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    var _a, _b, _c, _d, _e;
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createDiv({
      cls: "contact-note-version",
      text: `Version: ${this.plugin.manifest.version}`
    });
    new import_obsidian6.Setting(containerEl).setName("Contact file identification").setHeading();
    new import_obsidian6.Setting(containerEl).setName("Identify contacts by folder").setDesc(
      "When enabled, any note inside the specified folder is treated as a contact note. When disabled, notes tagged with the specified tag are used instead."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.configuration.useFolder).onChange(async (value) => {
        this.plugin.configuration.useFolder = value;
        await this.plugin.saveConfiguration();
        this.display();
      })
    );
    if (this.plugin.configuration.useFolder) {
      new import_obsidian6.Setting(containerEl).setName("Contacts folder path").setDesc(
        'Path to the folder containing contact notes, relative to the vault root (e.g. "contacts" or "people/contacts"). Notes in subfolders are included. Cannot be root of the vault.'
      ).addText((text) => {
        text.setPlaceholder("Contacts").setValue(this.plugin.configuration.folderPath).onChange(async (value) => {
          this.plugin.configuration.folderPath = value;
          await this.plugin.saveConfiguration();
        });
        new FolderSuggest(this.app, text.inputEl, true);
      });
    } else {
      new import_obsidian6.Setting(containerEl).setName("Contact tag").setDesc('Tag used to identify contact notes. Omit the leading "#" (e.g. "contact").').addText(
        (text) => text.setPlaceholder("Contact").setValue(this.plugin.configuration.tag).onChange(async (value) => {
          this.plugin.configuration.tag = value;
          await this.plugin.saveConfiguration();
        })
      );
    }
    new import_obsidian6.Setting(containerEl).setName("Contacts view in a panel").setHeading();
    new import_obsidian6.Setting(containerEl).setName("View name").setDesc("Name displayed at the top of the contacts view in the panel.").addText(
      (text) => text.setPlaceholder("Contacts").setValue(this.plugin.configuration.viewName).onChange(async (value) => {
        this.plugin.configuration.viewName = value;
        await this.plugin.saveConfiguration();
      })
    );
    new import_obsidian6.Setting(containerEl).setName("Contacts view in a base").setHeading();
    new import_obsidian6.Setting(containerEl).setName("New base folder path").setDesc("Folder where new contacts bases are created, relative to the vault root. Leave empty to place them in the vault root.").addText((text) => {
      text.setPlaceholder("").setValue(this.plugin.configuration.baseFolderPath).onChange(async (value) => {
        this.plugin.configuration.baseFolderPath = value;
        await this.plugin.saveConfiguration();
      });
      new FolderSuggest(this.app, text.inputEl);
    });
    new import_obsidian6.Setting(containerEl).setName("Contact card").setHeading();
    new import_obsidian6.Setting(containerEl).setName("Show last modified date").setDesc("Show the date the contact note was last modified in the top-left corner of the contact card. Applies only to the card rendered inside a contact note, not the panel or base views.").addToggle(
      (toggle) => toggle.setValue(this.plugin.configuration.showLastModified).onChange((value) => {
        this.plugin.configuration.showLastModified = value;
        void this.plugin.saveConfiguration();
      })
    );
    new import_obsidian6.Setting(containerEl).setName("Frontmatter properties customization").setHeading();
    containerEl.createEl("p", {
      text: "Override the frontmatter property names this plugin reads from and writes to, and the lucide icons displayed for properties that show one. Leave a field blank to use the default. Renaming a property does not rewrite existing notes or base files. Existing base files that reference old property names will need to be updated manually.",
      cls: "setting-item-description"
    });
    const grid = containerEl.createDiv({ cls: "contact-note-settings-fm-grid" });
    grid.createDiv({ cls: "contact-note-settings-fm-grid-header", text: "Property" });
    grid.createDiv({ cls: "contact-note-settings-fm-grid-header", text: "Override name" });
    grid.createDiv({ cls: "contact-note-settings-fm-grid-header", text: "Icon" });
    for (const field of this.plugin.contactNote.getFields()) {
      if (field.origin !== "builtin") continue;
      grid.createDiv({ cls: "contact-note-settings-fm-grid-name", text: field.key });
      const keyCell = grid.createDiv({ cls: "contact-note-settings-fm-grid-cell" });
      const keyInput = keyCell.createEl("input", { type: "text" });
      keyInput.placeholder = field.key;
      keyInput.value = (_b = (_a = this.plugin.configuration.frontmatterCustomizations[field.key]) == null ? void 0 : _a.keyOverride) != null ? _b : "";
      keyInput.addEventListener("change", () => {
        var _a2;
        const trimmed = keyInput.value.trim();
        const current = (_a2 = this.plugin.configuration.frontmatterCustomizations[field.key]) != null ? _a2 : {};
        const next = { ...current };
        if (trimmed && trimmed !== field.key) next.keyOverride = trimmed;
        else delete next.keyOverride;
        this.setOrClearCustomization(field.key, next);
        void this.plugin.saveConfiguration();
      });
      const iconCell = grid.createDiv({ cls: "contact-note-settings-fm-grid-cell" });
      if (field.defaultIcon) {
        const iconPreview = iconCell.createSpan({ cls: "contact-note-settings-icon-preview" });
        const renderPreview = (name) => {
          iconPreview.empty();
          if (name) (0, import_obsidian6.setIcon)(iconPreview, name);
        };
        renderPreview((_c = this.plugin.contactNote.getIcon(field)) != null ? _c : "");
        const iconInput = iconCell.createEl("input", { type: "text" });
        iconInput.placeholder = field.defaultIcon;
        iconInput.value = (_e = (_d = this.plugin.configuration.frontmatterCustomizations[field.key]) == null ? void 0 : _d.icon) != null ? _e : "";
        iconInput.addEventListener("change", () => {
          var _a2, _b2;
          const trimmed = iconInput.value.trim();
          const current = (_a2 = this.plugin.configuration.frontmatterCustomizations[field.key]) != null ? _a2 : {};
          const next = { ...current };
          if (trimmed && trimmed !== field.defaultIcon) next.icon = trimmed;
          else delete next.icon;
          this.setOrClearCustomization(field.key, next);
          void this.plugin.saveConfiguration();
          renderPreview(trimmed || ((_b2 = field.defaultIcon) != null ? _b2 : ""));
        });
      }
    }
  }
  setOrClearCustomization(key, c) {
    if (c.keyOverride || c.icon) {
      this.plugin.configuration.frontmatterCustomizations[key] = c;
    } else {
      delete this.plugin.configuration.frontmatterCustomizations[key];
    }
  }
};

// src/modals/NewContactsBaseModal.ts
var import_obsidian7 = require("obsidian");

// src/ContactsBase.ts
var DEFAULT_PROPERTY_ORDER_KEYS = ["firstName", "middleName", "lastName", "displayName"];
function getDefaultPropertyOrder(contactNote) {
  return DEFAULT_PROPERTY_ORDER_KEYS.map((key) => {
    const field = contactNote.getField(key);
    return `note.${field ? contactNote.getReadKey(field) : key}`;
  });
}
function buildIsContactExpression(useFolder, folderPath, tag) {
  return useFolder ? `file.inFolder("${folderPath.replace(/"/g, '\\"')}")` : `file.hasTag("${tag.replace(/^#/, "").replace(/"/g, '\\"')}")`;
}
function buildContactsBaseViewYaml(viewName, contactNote) {
  const lastNameField = contactNote.getField("lastName");
  const lastNameKey = lastNameField ? contactNote.getReadKey(lastNameField) : "lastName";
  return [
    `  - type: ${CONTACT_NOTE_LIST_VIEW_TYPE}`,
    `    name: ${viewName}`,
    "    filters:",
    "      and:",
    "        - formula.isContact",
    "    order:",
    ...getDefaultPropertyOrder(contactNote).map((p) => `      - ${p}`),
    "    sort:",
    `      - property: note.${lastNameKey}`,
    "        direction: ASC",
    "    condensed: true",
    "    lastNameFirst: true",
    "    showDetails: false"
  ];
}
function buildContactsBaseFile(useFolder, folderPath, tag, viewName, contactNote) {
  const isContactExpr = buildIsContactExpression(useFolder, folderPath, tag);
  return [
    "formulas:",
    `  isContact: ${JSON.stringify(isContactExpr)}`,
    "views:",
    ...buildContactsBaseViewYaml(viewName, contactNote),
    ""
  ].join("\n");
}
function appendContactsViewToBase(existingContent, useFolder, folderPath, tag, viewName, contactNote) {
  const expectedExpr = buildIsContactExpression(useFolder, folderPath, tag);
  const isContactMatch = /^( {2}|\t)isContact:\s*(.+)$/m.exec(existingContent);
  let updated = existingContent;
  let formulaMismatch = false;
  if (isContactMatch) {
    const existing = isContactMatch[2].trim().replace(/^["'](.*)["']$/, "$1");
    if (existing !== expectedExpr) {
      formulaMismatch = true;
    }
  } else {
    const formulasHeader = /^formulas:\s*$/m.exec(existingContent);
    const formulaLine = `  isContact: ${JSON.stringify(expectedExpr)}`;
    if (formulasHeader) {
      const insertAt = formulasHeader.index + formulasHeader[0].length;
      updated = updated.slice(0, insertAt) + "\n" + formulaLine + updated.slice(insertAt);
    } else {
      updated = `formulas:
${formulaLine}
${updated}`;
    }
  }
  const viewBlock = buildContactsBaseViewYaml(viewName, contactNote).join("\n");
  const viewsHeader = /^views:\s*$/m.exec(updated);
  if (!updated.endsWith("\n")) updated += "\n";
  if (viewsHeader) {
    updated += viewBlock + "\n";
  } else {
    updated += `views:
${viewBlock}
`;
  }
  return { content: updated, formulaMismatch };
}

// src/modals/NewContactsBaseModal.ts
var NewContactsBaseModal = class extends import_obsidian7.Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }
  onOpen() {
    this.setTitle("New base with contacts view");
    const { contentEl } = this;
    let baseFileName = "";
    let viewName = "";
    new import_obsidian7.Setting(contentEl).setName("Base file name").addText(
      (text) => text.setPlaceholder("Contacts").onChange((value) => {
        baseFileName = value;
      })
    );
    new import_obsidian7.Setting(contentEl).setName("View name").addText(
      (text) => text.setPlaceholder("Contacts").onChange((value) => {
        viewName = value;
      })
    );
    new import_obsidian7.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Create").setCta().onClick(async () => {
        this.close();
        const file = await this.createContactsBaseFile(
          baseFileName.trim() || "Contacts",
          viewName.trim() || "Contacts"
        );
        await this.plugin.app.workspace.getLeaf(false).openFile(file);
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
  //#region Utilities
  async createContactsBaseFile(baseFileName, viewName) {
    const { app, configuration } = this.plugin;
    const rawFolderPath = (0, import_obsidian7.normalizePath)(configuration.baseFolderPath);
    const resolvedFolderPath = rawFolderPath === "/" ? "" : rawFolderPath;
    if (resolvedFolderPath && !app.vault.getAbstractFileByPath(resolvedFolderPath)) {
      await app.vault.createFolder(resolvedFolderPath);
    }
    const folderPrefix = resolvedFolderPath ? `${resolvedFolderPath}/` : "";
    let resolvedFileName = baseFileName;
    let counter = 1;
    while (app.vault.getAbstractFileByPath(`${folderPrefix}${resolvedFileName}.base`)) {
      resolvedFileName = `${baseFileName} ${++counter}`;
    }
    if (resolvedFileName !== baseFileName) {
      new import_obsidian7.Notice(`A base named ${baseFileName} already exists. Renamed to ${resolvedFileName}.`);
    }
    const content = buildContactsBaseFile(
      configuration.useFolder,
      configuration.folderPath,
      configuration.tag,
      viewName,
      this.plugin.contactNote
    );
    return app.vault.create(`${folderPrefix}${resolvedFileName}.base`, content);
  }
  //#endregion
};

// src/modals/AppendContactsBaseViewModal.ts
var import_obsidian8 = require("obsidian");
var AppendContactsBaseViewModal = class extends import_obsidian8.Modal {
  constructor(plugin, targetFile) {
    super(plugin.app);
    this.plugin = plugin;
    this.targetFile = targetFile;
  }
  onOpen() {
    this.setTitle("Add contacts view");
    const { contentEl } = this;
    let viewName = "";
    new import_obsidian8.Setting(contentEl).setName("View name").addText(
      (text) => text.setPlaceholder("Contacts").onChange((value) => {
        viewName = value;
      })
    );
    new import_obsidian8.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Add").setCta().onClick(async () => {
        this.close();
        await this.appendContactsView(viewName.trim() || "Contacts");
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
  //#region Utilities
  async appendContactsView(viewName) {
    const { app, configuration } = this.plugin;
    const content = await app.vault.read(this.targetFile);
    const result = appendContactsViewToBase(content, configuration.useFolder, configuration.folderPath, configuration.tag, viewName, this.plugin.contactNote);
    await app.vault.modify(this.targetFile, result.content);
    if (result.formulaMismatch) {
      new import_obsidian8.Notice(
        `Contacts view added, but the existing is contact formula in this base does not match the current plugin settings. Update the formula manually if needed.`
      );
    } else {
      new import_obsidian8.Notice(`Contacts view "${viewName}" added to ${this.targetFile.basename}.`);
    }
  }
  //#endregion
};

// src/views/ContactsBasesView.ts
var import_obsidian9 = require("obsidian");
var ContactsBasesView = class extends import_obsidian9.BasesView {
  constructor(controller, scrollEl, plugin) {
    super(controller);
    this.plugin = plugin;
    this.type = CONTACT_NOTE_LIST_VIEW_TYPE;
    this.seeded = false;
    this.scrollEl = scrollEl;
    this.containerEl = scrollEl.createDiv({
      cls: `${plugin.manifest.id}-bases-view`
    });
  }
  onDataUpdated() {
    var _a, _b, _c, _d, _e;
    this.injectNewButton();
    this.tagHeader();
    this.containerEl.empty();
    if (!this.seeded) {
      this.seeded = true;
      const order = this.config.getOrder();
      const isFreshView = order.length === 0 || order.length === 1 && order[0] === "file.name";
      if (isFreshView) {
        this.config.set("order", getDefaultPropertyOrder(this.plugin.contactNote));
      }
    }
    const condensed = (_a = this.config.get("condensed")) != null ? _a : true;
    let showDetails = (_b = this.config.get("showDetails")) != null ? _b : false;
    const lastNameFirst = (_c = this.config.get("lastNameFirst")) != null ? _c : true;
    if (condensed && showDetails) {
      this.config.set("showDetails", false);
      showDetails = false;
    }
    this.containerEl.toggleClass(`${this.plugin.manifest.id}-cards-condensed`, condensed);
    if (this.data.data.length === 0) {
      this.containerEl.createEl("p", {
        cls: `${this.plugin.manifest.id}-empty`,
        text: "No contacts match."
      });
      return;
    }
    for (const group of this.data.groupedData) {
      const showHeader = group.hasKey();
      if (showHeader) {
        this.containerEl.createEl("h3", {
          cls: `${this.plugin.manifest.id}-bases-view-group-header`,
          text: ((_d = group.key) == null ? void 0 : _d.toString()) || "(none)"
        });
      }
      const groupContainer = showHeader ? this.containerEl.createDiv({ cls: `${this.plugin.manifest.id}-bases-view-group` }) : this.containerEl;
      for (const entry of group.entries) {
        const fm = {};
        for (const field of this.plugin.contactNote.getFields()) {
          if (field.kind === "socials") continue;
          const readKey = this.plugin.contactNote.getReadKey(field);
          const raw = entry.getValue(`note.${readKey}`);
          fm[readKey] = field.kind === "scalar" ? readScalar(raw) : readStringList(raw);
        }
        const socialsField = this.plugin.contactNote.getField("socials");
        const socialsKey = socialsField ? this.plugin.contactNote.getReadKey(socialsField) : "socials";
        const cached = this.plugin.app.metadataCache.getFileCache(entry.file);
        fm[socialsKey] = (_e = cached == null ? void 0 : cached.frontmatter) == null ? void 0 : _e[socialsKey];
        const contact = Contact.fromCache(entry.file, fm, cached == null ? void 0 : cached.frontmatterLinks, this.plugin.contactNote);
        buildContactCard(
          this.plugin.manifest.id,
          this.plugin.app,
          this.plugin.contactNote,
          groupContainer,
          contact,
          { condensed, clickable: true, showDetails, lastNameFirst }
        );
      }
    }
  }
  onunload() {
    var _a, _b;
    this.containerEl.remove();
    const leaf = this.scrollEl.closest(".workspace-leaf");
    (_a = leaf == null ? void 0 : leaf.querySelector(`.${this.plugin.manifest.id}-bases-view-new-btn`)) == null ? void 0 : _a.remove();
    (_b = leaf == null ? void 0 : leaf.querySelector(`.${this.plugin.manifest.id}-bases-view-header`)) == null ? void 0 : _b.removeClass(`${this.plugin.manifest.id}-bases-view-header`);
  }
  /* Bases' native New button creates a file using the visible columns'
     frontmatter at the vault root, wrong location and wrong shape for a
     contact. It cannot be intercepted (createFileForView is a helper for views
     to call, not a hook Bases calls on us), so the native button is hidden
     via CSS (scoped to leaves containing the plugin's bases' view)
   and the plugin injects its own */
  injectNewButton() {
    const native = activeDocument.querySelector(
      `.workspace-leaf:has(.${this.plugin.manifest.id}-bases-view) .bases-toolbar-new-item-menu`
    );
    if (!native) return;
    if (native.querySelector(`:scope > .${this.plugin.manifest.id}-bases-view-new-btn`)) return;
    const ourBtn = native.createEl("button", {
      cls: `${this.plugin.manifest.id}-bases-view-new-btn clickable-icon`,
      attr: { "aria-label": "New contact" }
    });
    (0, import_obsidian9.setIcon)(ourBtn, "lucide-plus");
    ourBtn.createSpan({ cls: "text-button-label", text: "New" });
    ourBtn.addEventListener("click", () => new NewContactNoteModal(this.plugin).open());
  }
  tagHeader() {
    const cls = `${this.plugin.manifest.id}-bases-view-header`;
    let prev = this.scrollEl.previousElementSibling;
    while (prev && !(prev.instanceOf(HTMLElement) && prev.matches("div.bases-header"))) {
      prev = prev.previousElementSibling;
    }
    if (!(prev == null ? void 0 : prev.instanceOf(HTMLElement))) return;
    if (prev.classList.contains(cls)) return;
    prev.addClass(cls);
  }
  // Bases Options
  static getViewOptions(config) {
    return [
      {
        displayName: "Display",
        type: "group",
        items: [
          {
            displayName: "Condensed",
            type: "toggle",
            key: "condensed",
            default: true
          },
          {
            displayName: "Show contact details",
            type: "toggle",
            key: "showDetails",
            default: false,
            shouldHide: () => config.get("condensed") === true
          },
          {
            displayName: "Last name first",
            type: "toggle",
            key: "lastNameFirst",
            default: true
          }
        ]
      }
    ];
  }
};
function readScalar(v) {
  if (v == null || v instanceof import_obsidian9.NullValue) return "";
  return v.toString();
}
function readStringList(v) {
  if (v == null || v instanceof import_obsidian9.NullValue) return [];
  if (v instanceof import_obsidian9.ListValue) {
    const out = [];
    const len = v.length();
    for (let i = 0; i < len; i++) {
      const item = v.get(i);
      if (item instanceof import_obsidian9.NullValue) continue;
      const s2 = item.toString();
      if (s2) out.push(s2);
    }
    return out;
  }
  const s = v.toString();
  return s ? [s] : [];
}

// src/ContactNote.ts
var BUILTIN_FIELD_DEFS = [
  { key: "firstName", kind: "scalar", origin: "builtin" },
  { key: "middleName", kind: "scalar", origin: "builtin" },
  { key: "lastName", kind: "scalar", origin: "builtin" },
  { key: "displayName", kind: "scalar", origin: "builtin" },
  { key: "company", kind: "scalar", origin: "builtin", allowsInternalLink: true, defaultIcon: "building-2" },
  { key: "department", kind: "scalar", origin: "builtin", allowsInternalLink: true, defaultIcon: "network" },
  { key: "title", kind: "scalar", origin: "builtin", allowsInternalLink: true },
  { key: "emails", kind: "list", origin: "builtin", defaultIcon: "mail" },
  { key: "phoneNumbers", kind: "list", origin: "builtin", defaultIcon: "phone" },
  { key: "birthday", kind: "scalar", origin: "builtin", defaultIcon: "cake" },
  { key: "lastInteraction", kind: "scalar", origin: "builtin", defaultIcon: "calendar-clock" },
  { key: "photo", kind: "scalar", origin: "builtin" },
  { key: "socials", kind: "socials", origin: "builtin" }
];
var SOCIAL_PLATFORMS = [
  "twitter",
  "instagram",
  "linkedin",
  "github",
  "facebook",
  "youtube",
  "tiktok",
  "bluesky",
  "reddit",
  "discord",
  "telegram",
  "twitch",
  "snapchat",
  "pinterest"
];
var ContactNote = class {
  constructor() {
    this.fields = BUILTIN_FIELD_DEFS.map((f) => ({ ...f }));
  }
  getFields() {
    return this.fields;
  }
  getField(key) {
    return this.fields.find((f) => f.key === key);
  }
  /* Frontmatter property name to read from / write to a note for the given field.
     If a user has set a custom override, that key is used. Otherwise the stable
   internal key is used. */
  getReadKey(field) {
    return field.keyOverride && field.keyOverride.trim() ? field.keyOverride.trim() : field.key;
  }
  /* Lucide icon name to display alongside the field's value(s). Returns the
     user's custom icon if set, otherwise the field's default. May be undefined
     for fields that don't render an icon. */
  getIcon(field) {
    if (field.icon && field.icon.trim()) return field.icon.trim();
    return field.defaultIcon;
  }
  applyCustomizations(customizations) {
    var _a, _b;
    for (const field of this.fields) {
      if (field.origin !== "builtin") continue;
      const c = customizations == null ? void 0 : customizations[field.key];
      const keyOverride = (_a = c == null ? void 0 : c.keyOverride) == null ? void 0 : _a.trim();
      const icon = (_b = c == null ? void 0 : c.icon) == null ? void 0 : _b.trim();
      field.keyOverride = keyOverride ? keyOverride : void 0;
      field.icon = icon ? icon : void 0;
    }
  }
  buildContactNote(firstName, lastName, tag) {
    var _a;
    const lines = ["---"];
    for (const field of this.fields) {
      if (field.kind === "socials") {
        lines.push(`${this.getReadKey(field)}:`);
        for (const platform of SOCIAL_PLATFORMS) {
          lines.push(`  - ${platform}: `);
        }
        continue;
      }
      let value = (_a = field.defaultValue) != null ? _a : "";
      if (field.key === "firstName") value = firstName;
      else if (field.key === "lastName") value = lastName;
      lines.push(`${this.getReadKey(field)}: ${value}`);
    }
    lines.push("aliases:");
    if (firstName) lines.push(`  - ${firstName}`);
    if (tag) {
      lines.push("tags:");
      lines.push(`  - ${tag.replace(/^#/, "")}`);
    }
    lines.push("---");
    lines.push("");
    return lines.join("\n");
  }
};

// src/main.ts
var CONTACT_NOTE_LIST_VIEW_TYPE = "contact-note-list";
var CURRENT_SCHEMA_VERSION = 0;
var DEFAULT_CONFIGURATION = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  ...DEFAULT_SETTINGS,
  ...DEFAULT_VIEW_OPTIONS
};
var ContactNotePlugin3 = class extends import_obsidian10.Plugin {
  constructor() {
    super(...arguments);
    this.contactNote = new ContactNote();
    this.events = new import_obsidian10.Events();
    this.renamingFiles = /* @__PURE__ */ new Set();
  }
  async onload() {
    await this.loadConfiguration();
    this.addSettingTab(new ContactNoteSettingTab(this.app, this));
    this.registerView(
      CONTACT_NOTE_LIST_VIEW_TYPE,
      (leaf) => new ContactsView(leaf, this)
    );
    this.registerBasesView(
      CONTACT_NOTE_LIST_VIEW_TYPE,
      {
        name: "Contacts",
        icon: "book-user",
        factory: (controller, scrollEl) => new ContactsBasesView(controller, scrollEl, this),
        options: ContactsBasesView.getViewOptions
      }
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", async (file, _data, cache) => {
        if (!this.isContactFile(file)) return;
        await this.enforceContactFileName(file, cache.frontmatter);
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", async (file, _oldPath) => {
        if (!(file instanceof import_obsidian10.TFile)) return;
        if (!this.isContactFile(file)) return;
        if (this.renamingFiles.has(file.path)) {
          this.renamingFiles.delete(file.path);
          return;
        }
        const cache = this.app.metadataCache.getFileCache(file);
        await this.enforceContactFileName(file, cache == null ? void 0 : cache.frontmatter);
      })
    );
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        var _a, _b;
        const view = this.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView);
        if (!view || !view.file || !this.isContactFile(view.file)) {
          (_a = view == null ? void 0 : view.contentEl.querySelector(".markdown-reading-view")) == null ? void 0 : _a.removeClass(this.manifest.id);
          return;
        }
        (_b = view.contentEl.querySelector(".markdown-reading-view")) == null ? void 0 : _b.addClass(this.manifest.id);
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        var _a, _b;
        const view = this.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView);
        if (!view || !view.file || !this.isContactFile(view.file)) {
          (_a = view == null ? void 0 : view.contentEl.querySelector(".markdown-reading-view")) == null ? void 0 : _a.removeClass(this.manifest.id);
          return;
        }
        (_b = view.contentEl.querySelector(".markdown-reading-view")) == null ? void 0 : _b.addClass(this.manifest.id);
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        var _a, _b;
        const view = this.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView);
        if (!view || !view.file || !this.isContactFile(view.file)) {
          (_a = view == null ? void 0 : view.contentEl.querySelector(".markdown-reading-view")) == null ? void 0 : _a.removeClass(this.manifest.id);
          return;
        }
        ;
        (_b = view.contentEl.querySelector(".markdown-reading-view")) == null ? void 0 : _b.addClass(this.manifest.id);
      })
    );
    this.addRibbonIcon("book-user", "Open contacts view in panel", () => {
      void this.activateContactsView();
    });
    this.addCommand({
      id: "open-contacts-view",
      name: "Open contacts view in panel",
      callback: () => {
        void this.activateContactsView();
      }
    });
    this.addCommand({
      id: "create-contacts-base",
      name: "Create new base with contacts view",
      callback: () => new NewContactsBaseModal(this).open()
    });
    this.addCommand({
      id: "add-contacts-base-view",
      name: "Add contacts view to base",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "base") return false;
        if (checking) return true;
        new AppendContactsBaseViewModal(this, file).open();
        return true;
      }
    });
    this.registerMarkdownPostProcessor((el, ctx) => {
      if (!el.classList.contains("mod-frontmatter")) return;
      const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
      if (!(file instanceof import_obsidian10.TFile)) return;
      if (!this.isContactFile(file)) return;
      if (!ctx.frontmatter) return;
      const cache = this.app.metadataCache.getFileCache(file);
      const contact = Contact.fromCache(file, ctx.frontmatter, cache == null ? void 0 : cache.frontmatterLinks, this.contactNote);
      buildContactCard(this.manifest.id, this.app, this.contactNote, el, contact, { showDetails: true, lastNameFirst: false, showBirthday: true, showLastInteraction: true, showLastModified: this.configuration.showLastModified });
    });
  }
  //#region Configuration
  async loadConfiguration() {
    const raw = await this.loadData();
    const known = new Set(Object.keys(DEFAULT_CONFIGURATION));
    const filtered = {};
    let droppedAny = false;
    if (raw && typeof raw === "object") {
      for (const [k, v] of Object.entries(raw)) {
        if (known.has(k)) filtered[k] = v;
        else droppedAny = true;
      }
    }
    this.configuration = Object.assign({}, DEFAULT_CONFIGURATION, filtered);
    this.contactNote.applyCustomizations(this.configuration.frontmatterCustomizations);
    if (droppedAny) await this.saveConfiguration();
  }
  async saveConfiguration() {
    await this.saveData(this.configuration);
    this.contactNote.applyCustomizations(this.configuration.frontmatterCustomizations);
    this.events.trigger("configuration-changed");
  }
  //#endregion
  //#region Contact File
  isContactFile(file) {
    var _a;
    if (this.configuration.useFolder) {
      const folder = (0, import_obsidian10.normalizePath)(this.configuration.folderPath);
      if (!folder || folder === "/") return false;
      return file.path === folder || file.path.startsWith(folder + "/");
    }
    const tag = this.configuration.tag.trim().replace(/^#/, "").toLowerCase();
    if (!tag) return false;
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache) return false;
    const tags = [];
    const fmTags = (_a = cache.frontmatter) == null ? void 0 : _a.tags;
    if (Array.isArray(fmTags)) {
      tags.push(...fmTags.map((t) => String(t).replace(/^#/, "").toLowerCase()));
    } else if (typeof fmTags === "string") {
      tags.push(fmTags.replace(/^#/, "").toLowerCase());
    }
    if (cache.tags) {
      tags.push(...cache.tags.map((t) => t.tag.replace(/^#/, "").toLowerCase()));
    }
    return tags.includes(tag);
  }
  async enforceContactFileName(file, frontmatter) {
    var _a;
    if (!frontmatter) return;
    const readField = (key) => {
      const field = this.contactNote.getField(key);
      if (!field) return "";
      const raw = frontmatter[this.contactNote.getReadKey(field)];
      return raw !== null && typeof raw === "string" ? String(raw).trim() : "";
    };
    const firstName = readField("firstName");
    const middleName = readField("middleName");
    const lastName = readField("lastName");
    if (!firstName || !lastName) return;
    const expectedName = [firstName, middleName, lastName].filter(Boolean).join(" ");
    if (file.basename === expectedName) return;
    const folder = (_a = file.parent) == null ? void 0 : _a.path;
    const folderPrefix = folder ? folder + "/" : "";
    let finalName = expectedName;
    let counter = 1;
    while (this.app.vault.getAbstractFileByPath(`${folderPrefix}${finalName}.md`)) {
      finalName = `${expectedName} ${counter++}`;
    }
    const newPath = `${folderPrefix}${finalName}.md`;
    if (finalName !== expectedName) {
      new import_obsidian10.Notice(`A contact named ${expectedName} already exists. Renamed to ${finalName}.`);
    }
    this.renamingFiles.add(newPath);
    await this.app.fileManager.renameFile(file, newPath);
  }
  //#endregion
  //#region View
  async activateContactsView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(CONTACT_NOTE_LIST_VIEW_TYPE);
    if (existing.length > 0) {
      await workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: CONTACT_NOTE_LIST_VIEW_TYPE, active: true });
      await workspace.revealLeaf(leaf);
    }
  }
  //#endregion
};

/* nosourcemap */