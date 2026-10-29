// Cleans typed text. Always show user text with {{ }}, never v-html.

export const COMMENT_MAX = 500

// Control codes (not new line or tab), zero-width and right-to-left marks
// oxlint-disable-next-line no-control-regex
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g

// Anything that looks like an HTML tag (<b>, </div>, <script ...>). "<3" and "a < b" stay.
const HTML_TAG = /<\/?[a-z!][^>]*>/gi

// While typing (keeps spaces at the ends)
export function cleanWhileTyping(text, max = COMMENT_MAX) {
    return String(text ?? '')
        .normalize('NFC')
        .replace(/\r\n?/g, '\n')
        .replace(INVISIBLE, '')
        .replace(HTML_TAG, '')
        // No walls of empty lines or long runs of spaces
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .slice(0, max)
}

// Before posting (also trims)
export function cleanForPosting(text, max = COMMENT_MAX) {
    return cleanWhileTyping(text, max).trim()
}
