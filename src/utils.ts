import { DESCRIPTION_TRIM_LENGTH } from "./constants";

/**
 * Trims a given description down in case it is too long
 *
 * @param {string} [description] The description to trim
 * @return {string|undefined} Trimmed string or `undefined` if input was `undefined`
 */
export function trimDescription(description?: string): string | undefined {
  if (!description) return;
  if (description.length > DESCRIPTION_TRIM_LENGTH)
    return description.substring(0, DESCRIPTION_TRIM_LENGTH) + "...";
  return description;
}
