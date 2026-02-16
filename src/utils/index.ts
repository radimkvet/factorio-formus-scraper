import type { Cheerio, Element } from 'crawlee';

/**
 * Parse a given string into a number by removing commas and dashes, then parsing it as an integer.
 * If the value is NaN after parsing, null is returned.
 *
 * @param value string to parse into number, it can not have any leading characters
 * @returns parsed string converted to number or null
 */
export const parseNumber = (value: string) => {
    // replace commas and dashes but do not replace the leading dash
    const replaceRegex = /(?!^)-|,/g;
    const normalized = value.trim().replace(replaceRegex, '');
    const parsed = Number.parseInt(normalized, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

type PaginationResult =
    | {
          hasMultiplePages: false;
          isLastPage: true;
          nextPageElement: null;
      }
    | {
          hasMultiplePages: true;
          isLastPage: boolean;
          nextPageElement: Cheerio<Element>;
      };

/**
 * Check the page pagination and return an object with pagination related properties.
 *
 * If the page has no paggination, `hasMultiplePages` is false and `nextPageElement` is `null`.
 * If the page has paggination, but it is the last page, `nextPageElement` is `null`.
 * Otherwise `nextPageElement` is the element with link to the next page.
 *
 * @param $pagination paggnation element on the site
 * @returns object with pagination related properties
 */
export const checkPagination = ($pagination: Cheerio<Element> | null): PaginationResult => {
    if ($pagination == null || $pagination.length === 0) {
        return { isLastPage: true, hasMultiplePages: false, nextPageElement: null };
    }

    const hasMultiplePages = $pagination.find('ul').length > 0;
    if (!hasMultiplePages) {
        return { isLastPage: true, hasMultiplePages, nextPageElement: null };
    }

    const isLastPage = $pagination.find('li.arrow.next').length === 0;
    const nextPageElement = $pagination.find('li.arrow.next').first();

    return { isLastPage, hasMultiplePages, nextPageElement };
};

/**
 * Normalize whitespace in a string by replacing multiple consecutive whitespace with a single space and trimming it.
 * @param value string to normalize
 * @returns string with normalized whitespace
 */
export const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();
