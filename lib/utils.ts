import type { User } from "@/types/auth";

/** Minimal API error shape for toast display */
interface ApiErrorShape {
  message?: string;
  errors?: Record<string, string[]> | string[];
}
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a given amount into a currency string based on the specified currency code.
 *
 * The amount can be a number or a string, and the currency code defaults to "NGN".
 *
 * @example
 * // Basic usage with default NGN currency
 * currencyFormatter(1000) // "₦1,000.00"
 * currencyFormatter("2500") // "₦2,500.00"
 * currencyFormatter("1,500.75") // "₦1,500.75"
 *
 * // Different currencies
 * currencyFormatter(1000, "USD") // "$1,000.00"
 * currencyFormatter(1000, "GBP") // "£1,000.00"
 * currencyFormatter(1000, "EUR") // "€1,000.00"
 *
 * // With custom formatting options
 * currencyFormatter(1000, "NGN", { minimumFractionDigits: 0 }) // "₦1,000"
 * currencyFormatter(1000.123, "USD", { maximumFractionDigits: 3 }) // "$1,000.123"
 *
 * // Edge cases
 * currencyFormatter() // "₦0.00" (default amount)
 * currencyFormatter(0) // "₦0.00"
 * currencyFormatter("invalid") // "" (returns empty string for invalid input)
 * currencyFormatter("") // "" (returns empty string for empty input)
 *
 * @param {number | string} [amount=0] - The amount to be formatted, can be a number or a string.
 * @param {string} [currency="NGN"] - The currency code to format the amount in.
 * @param {Omit<Intl.NumberFormatOptions, 'style' | 'currency'>} [options] - Optional formatting options for Intl.NumberFormat.
 * @param {Intl.LocalesArgument} [locale="en-NG"] - The locale to use for formatting.
 * @returns {string} - The formatted currency string.
 */
export const currencyFormatter = (
  amount: number | string = 0,
  currency: string = "NGN",
  options?: Omit<Intl.NumberFormatOptions, "style" | "currency">,
  locale: Intl.LocalesArgument = "en-NG",
): string => {
  const parsedAmount =
    typeof amount === "string" ? parseFloat(amount?.replace(/,/g, "")) : amount;

  if (isNaN(parsedAmount)) {
    return "";
  }

  const isCompact = options?.notation === "compact";

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // Default digits: compact uses fewer digits by default
    minimumFractionDigits: isCompact ? 0 : 2,
    maximumFractionDigits: isCompact
      ? (options?.maximumFractionDigits ?? 1)
      : 2,
    ...(options ?? {}),
  });
  return formatter.format(parsedAmount);
};

/**
 * Generates initials from a full name.
 *
 * @param fullName - The full name from which to extract initials.
 * @returns A string of initials in uppercase, or an empty string if the input is invalid.
 */
export function getInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return "";

  const nameWords = fullName.trim().split(/\s+/); // Split by one or more spaces
  const initials = nameWords.map((word) => word.charAt(0).toUpperCase()); // Get first letter and convert to uppercase

  return initials?.join("");
}

/**
 * Extracts domain from a URL or domain string and formats it for email usage
 * @param input - URL, domain, or any string containing a domain
 * @returns Formatted domain with @ prefix (e.g., "@example.com")
 * @example
 * extractEmailDomain('https://www.example.com') // '@example.com'
 * extractEmailDomain('example.com') // '@example.com'
 * extractEmailDomain('example') // ''
 */
export function extractEmailDomain(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  const cleanInput = input.trim();

  if (!cleanInput) {
    return "";
  }

  const domain = cleanInput
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^ftp\./, "")
    .replace(/^mail\./, "")
    .split("/")[0] // Take only the domain part, ignore paths
    .split("?")[0] // Remove query parameters
    .split("#")[0] // Remove fragments
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]/g, "");

  const domainRegex =
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;

  if (!domain || !domainRegex.test(domain)) {
    return "";
  }

  return `@${domain}`;
}

/**
 * Validates if a domain string is valid (can be a URL or just a domain)
 * @param domain - Domain string to validate (e.g., "example.com", "https://example.com", "www.example.com")
 * @returns true if the domain is valid, false otherwise
 * @example
 * isValidDomain('example.com') // true
 * isValidDomain('https://example.com') // true
 * isValidDomain('invalid..domain') // false
 * isValidDomain('') // false
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== "string") {
    return false;
  }

  const cleanInput = domain.trim();

  if (!cleanInput) {
    return false;
  }

  let domainToValidate = "";

  try {
    // Try to parse as URL first
    let url: URL;

    // If it doesn't start with protocol, add https://
    if (
      !cleanInput.startsWith("http://") &&
      !cleanInput.startsWith("https://")
    ) {
      url = new URL(`https://${cleanInput}`);
    } else {
      url = new URL(cleanInput);
    }

    domainToValidate = url.hostname;
  } catch {
    // If URL parsing fails, treat as domain string
    domainToValidate = cleanInput
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/^ftp\./, "")
      .replace(/^mail\./, "")
      .split("/")[0] // Take only the domain part, ignore paths
      .split("?")[0] // Remove query parameters
      .split("#")[0]; // Remove fragments
  }

  // Clean up the domain
  domainToValidate = domainToValidate.toLowerCase().trim();

  // Remove any remaining invalid characters for email domains
  domainToValidate = domainToValidate.replace(/[^a-z0-9.-]/g, "");

  // Validate domain format
  const domainRegex =
    /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

  return domainRegex.test(domainToValidate) && domainToValidate.length > 0;
}

/**
 * Extracts the clean domain name from a URL or domain string
 * @param domain - Domain string (e.g., "example.com", "https://example.com", "www.example.com")
 * @returns Clean domain name without protocol, www, or paths
 * @example
 * extractDomainName('https://www.example.com/path') // 'example.com'
 * extractDomainName('example.com') // 'example.com'
 */
function extractDomainName(domain: string): string | null {
  if (!domain || typeof domain !== "string") {
    return null;
  }

  const cleanInput = domain.trim();

  if (!cleanInput) {
    return null;
  }

  try {
    let url: URL;

    if (
      !cleanInput.startsWith("http://") &&
      !cleanInput.startsWith("https://")
    ) {
      url = new URL(`https://${cleanInput}`);
    } else {
      url = new URL(cleanInput);
    }

    return url.hostname.replace(/^www\./, "");
  } catch {
    // If URL parsing fails, treat as domain string
    const domainName = cleanInput
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .toLowerCase()
      .trim();

    return domainName || null;
  }
}

/**
 * Checks if a domain actually exists by attempting to resolve it
 * Uses DNS-over-HTTPS or tries to fetch the domain
 * @param domain - Domain string to check (e.g., "example.com", "https://example.com")
 * @returns Promise that resolves to true if domain exists, false otherwise
 * @example
 * await checkDomainExists('example.com') // true
 * await checkDomainExists('nonexistent-domain-12345.com') // false
 */
export async function checkDomainExists(domain: string): Promise<boolean> {
  const domainName = extractDomainName(domain);

  if (!domainName) {
    return false;
  }

  try {
    // Try using DNS-over-HTTPS (Cloudflare's public DNS)
    const dnsResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domainName)}&type=A`,
      {
        method: "GET",
        headers: {
          Accept: "application/dns-json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      },
    );

    if (dnsResponse.ok) {
      const data = await dnsResponse.json();
      // Check if we got any answers (domain exists)
      if (data.Answer && data.Answer.length > 0) {
        return true;
      }
      // If Status is 0 and no answers, domain might not exist
      if (data.Status === 0 && (!data.Answer || data.Answer.length === 0)) {
        return false;
      }
    }

    // Fallback: Try to fetch the domain (might have CORS issues, but worth trying)
    try {
      await fetch(`https://${domainName}`, {
        method: "HEAD",
        mode: "no-cors",
        signal: AbortSignal.timeout(5000),
      });
      // If we get here without error, domain likely exists
      return true;
    } catch {
      // If fetch fails, domain might not exist or have CORS issues
      // Return false to be safe
      return false;
    }
  } catch (error) {
    console.error("Error checking domain existence:", error);
    // If DNS check fails, assume domain doesn't exist
    return false;
  }
}

/**
 * Parses date from API format like "07 Dec, 1971"
 * @param dateString - Date string from API
 * @returns Date object or undefined if parsing fails
 * @example
 * parseApiDate('07 Dec, 1971') // Date object
 * parseApiDate('invalid') // undefined
 */
export function parseApiDate(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  try {
    // Handle format like "07 Dec, 1971"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing with dayjs or fallback to current date
      return new Date();
    }
    return date;
  } catch (error) {
    console.warn("Failed to parse date:", dateString, error);
    return undefined;
  }
}

/**
 * Capitalizes the first letter of a string.
 * @param string - The string to capitalize.
 * @returns The input string with the first letter capitalized.
 */
export const capitalizeFirstLetter = (string: string): string => {
  return string?.charAt(0)?.toUpperCase() + string?.slice(1);
};

/**
 * Converts a string to sentence case (first letter capitalized, rest lowercase).
 * @param string - The string to convert to sentence case.
 * @returns The input string converted to sentence case.
 */
export const convertToSentenceCase = (string: string): string => {
  if (!string || typeof string !== "string") return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const toastErrors = (
  error: { response?: { data?: ApiErrorShape }; message?: string },
  fallbackErrorMsg: string = "Something went wrong",
) => {
  const errors = error.response?.data?.errors;

  // If there are no errors or the error array is empty, show a generic error message
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    toast.error(
      (error.response?.data as ApiErrorShape)?.message ||
        error.message ||
        fallbackErrorMsg,
    );
    return;
  }

  // If errors is an object, iterate through its keys and show each error
  if (typeof errors === "object" && !Array.isArray(errors)) {
    Object.entries(errors).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // If the value is an array, show each error in the array
        value.forEach((errorMsg) => {
          toast.error(`${capitalizeFirstLetter(key)}: ${errorMsg}`);
        });
      } else {
        // If the value is a string, show it directly
        toast.error(`${capitalizeFirstLetter(key)}: ${value}`);
      }
    });
  }

  // If errors is an array, show each error in the array
  else if (Array.isArray(errors)) {
    errors.forEach((errorMsg) => {
      toast.error(errorMsg);
    });
  } else {
    // Fallback for any other unexpected structure
    toast.error(fallbackErrorMsg);
  }
};

/**
 * Checks if all values in the given object are empty.
 *
 * A value is considered empty if it is null, undefined, or an empty string.
 *
 * @param obj - The object whose values are to be checked.
 * @returns True if all values in the object are empty; otherwise, false.
 */
export const isObjValuesEmpty = (
  obj: Record<string, unknown> | undefined,
): boolean => {
  if (!obj) return true;
  return Object.values(obj).every(
    (value) => value === null || value === undefined || value === "",
  );
};

/** Query param key for post-login redirect URL */
export const REDIRECT_PARAM = "redirect";

/**
 * Builds the sign-in URL with optional redirect param for post-login navigation.
 *
 * @param fromPath - The path to redirect to after login (e.g. current location when auth failed).
 * @returns Sign-in URL with redirect param if fromPath is provided.
 */
export const getSignInUrlWithRedirect = (fromPath?: string): string => {
  const base = "/auth/login";
  if (!fromPath?.trim()) return base;
  // Validate: only allow internal paths (prevents open redirect)
  const safePath =
    fromPath.startsWith("/") && !fromPath.startsWith("//")
      ? encodeURIComponent(fromPath)
      : "";
  return safePath ? `${base}?${REDIRECT_PARAM}=${safePath}` : base;
};

/**
 * Validates and returns a safe redirect path from URL search params.
 * Only allows internal paths to prevent open redirect vulnerabilities.
 *
 * @param redirect - Raw redirect value from URL (e.g. searchParams.get('redirect')).
 * @returns The path if valid, otherwise null.
 */
export const getValidRedirectPath = (
  redirect: string | null,
): string | null => {
  if (!redirect?.trim()) return null;
  try {
    const decoded = decodeURIComponent(redirect);
    // Must start with / and not // (blocks protocol-relative or external URLs)
    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.includes(":")
    ) {
      return decoded;
    }
  } catch {
    /* ignore invalid encoding */
  }
  return null;
};

/**
 * Retrieves the redirect URL from the document referrer if it matches allowed domains.
 *
 * @returns The redirect path if valid, otherwise null.
 */
export const getRedirectUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  // Get the current domain from window.location
  const currentDomain = window.location.hostname;

  // Include the current domain along with any other allowed domains
  const allowedDomains = [currentDomain, "anotherdomain.com"];

  let redirectPath: string | null = null;

  if (document.referrer) {
    try {
      const prevUrl = new URL(document.referrer);
      if (allowedDomains.includes(prevUrl.hostname)) {
        redirectPath = prevUrl.pathname;
      }
    } catch (error) {
      console.error(
        `Error parsing document.referrer: ${document.referrer}`,
        error,
      );
    }
  }

  return redirectPath;
};

/**
 * Checks if user has completed boarding (legacy; returns false for minimal User type)
 */
export const checkBoardingStatus = (
  user: Partial<User> | null | undefined,
): boolean => {
  if (!user) return false;
  const extended = user as User & {
    user_account_types?: Array<{
      account_type_id?: number;
      is_boarded?: number;
    }>;
    org_user?: { employment_type?: string };
  };
  return (
    (extended?.user_account_types?.some(
      (type) => type?.account_type_id === 2 && type?.is_boarded === 1,
    ) ||
      extended?.org_user?.employment_type === "employee") ??
    false
  );
};

/**
 * Utility to copy text to clipboard with fallback support.
 * @param text - The text to be copied.
 * @param callback - Optional callback invoked after success.
 * @returns Promise<boolean> - true if successful, false otherwise.
 */
export const copyToClipboard = async (
  text: string,
  callback?: VoidFunction,
): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      callback?.();
      return true;
    } else {
      // Fallback method (non-secure contexts or older browsers)
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Prevent scrolling/jumping issues
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) callback?.();
      return successful;
    }
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
    return false;
  }
};

/**
 * Removes entries from an object where the value is null, undefined, or an empty string.
 *
 * @param obj - The object to prune.
 * @returns A new object with only entries that have non-empty values.
 */
export const pruneEmptyValues = (
  obj: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  );

/**
 * Recursively checks if two objects are deeply equal.
 *
 * @param a - The first object to compare.
 * @param b - The second object to compare.
 * @returns True if the objects are deeply equal; otherwise, false.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === "object") {
    const objectA = a as Record<string, unknown>;
    const objectB = b as Record<string, unknown>;
    const keysA = Object.keys(objectA);
    const keysB = Object.keys(objectB);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(objectA[key], objectB[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
};

export function formatDate(dateStr: string | number | Date): string {
  const date = new Date(dateStr);

  // Format date to "Month Day, Year"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export const formatText = (text: string) => {
  if (!text) return "";
  return text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
