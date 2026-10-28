// Cleans text people type before it is shown or saved.
// Vue already escapes text shown with {{ }}, so this is about keeping comments plain, readable
// and short. Always show user text with {{ }}, never v-html.

export const COMMENT_MAX = 500

// Invisible characters: control codes (except new line and tab), zero-width spaces, and the
// right-to-left override marks that can make text look like something else.
// Matching control characters is the point here, so the lint rule against it is switched off.
// oxlint-disable-next-line no-control-regex
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g

// Anything that looks like an HTML tag (<b>, </div>, <script ...>). "<3" and "a < b" stay.
const HTML_TAG = /<\/?[a-z!][^>]*>/gi

// While typing: remove what shouldn't be there, but keep spaces at the ends so typing feels normal
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

// Before posting: the same, plus no spaces or empty lines at the start and end
export function cleanForPosting(text, max = COMMENT_MAX) {
    return cleanWhileTyping(text, max).trim()
}
