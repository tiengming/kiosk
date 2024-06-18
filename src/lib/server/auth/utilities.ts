import { env } from '$env/dynamic/private';
import { sendMail } from '$lib/server/mail';
import { generateRandomString } from '$lib/utilities';
import type { Cookies } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import type { User } from '$lib/server/data/authentication/user';
import { dev } from '$app/environment';

const defaultSessionIdCookieName = 'ksid';
const defaultJwtCookieName = 'jwt';

interface AccessTokenPayload extends JwtPayload {
  name: string;
  email: string;
}

/**
 * Issue a new access token for the given user.
 *
 * This function issues a new access token for the given user. The token is signed using the JWT
 * secret from the environment and contains the user's name and email address.
 * User tokens are exclusively used for in-browser usage as session tokens. To authenticate API
 * requests, use OAuth 2.0 access tokens instead.
 *
 * @param user
 */
export function issueUserToken(user: Pick<User, 'id' | 'name' | 'email' | 'role'>) {
  const payload: Partial<AccessTokenPayload> = {
    name: user.name || user.email,
    email: user.email,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    subject: user.id.toString(),
  });
}

export function verifyToken(token: string) {
  if (!token) {
    throw new Error('Missing or invalid access token');
  }

  const { payload } = jwt.verify(token, env.JWT_SECRET, {
    complete: true,
  });

  if (typeof payload === 'string') {
    throw new Error('Unexpected token payload');
  }

  return payload as AccessTokenPayload;
}

export function resolveAuthSessionId(cookies: Cookies) {
  let sessionId = getAuthSessionIdFromCookie(cookies);

  if (!sessionId) {
    sessionId = generateRandomString(16);

    setAuthSessionIdCookie(cookies, sessionId);
  }

  return sessionId;
}

export function setAuthSessionIdCookie(cookies: Cookies, sessionId: string) {
  const name = env.SESSION_ID_COOKIE_NAME || defaultSessionIdCookieName;

  cookies.set(name, sessionId, {
    path: '/auth',
    maxAge: 60 * 5,
    httpOnly: true,
    sameSite: 'strict',
  });
}

export function getAuthSessionIdFromCookie(cookies: Cookies) {
  const name = env.SESSION_ID_COOKIE_NAME || defaultSessionIdCookieName;

  return cookies.get(name);
}

export function setJwtCookie(cookies: Cookies, token: string) {
  const name = env.JWT_COOKIE_NAME || defaultJwtCookieName;

  cookies.set(name, token, {
    path: '/',
    secure: !dev,
    httpOnly: true,
  });
}

export function getJwtCookie(cookies: Cookies) {
  const name = env.JWT_COOKIE_NAME || defaultJwtCookieName;

  return cookies.get(name);
}

export function resolveUserId(cookies: Cookies) {
  try {
    const { sub } = verifyToken(getJwtCookie(cookies) || '');

    return sub;
  } catch {
    return undefined;
  }
}

export function generateRandomPassCode(length: number) {
  return ('' + Math.random()).substring(2, length + 2);
}

export function inferNameFromEmailAddress(email: string) {
  const mailbox = email

    // Pick anything before the last @ character ("foo\@bar@test.com" -> "foo\@bar")
    .slice(0, email.lastIndexOf('@'))

    // Remove any + modifiers
    .split('+')[0];

  let name = mailbox

    // Replace any numbers, underscores, or dots with spaces
    .replace(/[-_.\d]+/g, ' ')

    // Replace duplicate whitespace with a single one
    .replace(/\s\s+/g, ' ')

    .trim();
  // Title case
  // `john smith` to `John Smith`
  name = name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Handle Generational (The Third) names
  // `John Smith Iii` to `John Smith III`
  ['ii', 'iii', 'iv'].forEach((suffix) => {
    const rx = new RegExp(`\\s(${suffix})$`, 'gi');

    name = name.replace(rx, (s) => s.toUpperCase());
  });

  // Handle 'Jr/Sr' names
  // `John Smith Jr` to `John Smith, Jr.`
  ['jr', 'jnr', 'sr', 'snr'].forEach((suffix) => {
    name = name.replace(new RegExp('\\s(' + suffix + ')$', 'gi'), (s) => `,${s}.`);
  });

  // Handle title prefixes names
  // `Dr John Smith` to `Dr. John Smith`
  ['mr', 'mrs', 'ms', 'dr', 'prof'].forEach((prefix) => {
    name = name.replace(new RegExp(`^(${prefix})\\s`, 'gi'), (s) => s.replace(' ', '. '));
  });

  // Handle "son/daughter" of pattern
  name = name
    .replace(/\bAl(?=\s+\w)/g, 'al') // al Arabic or forename Al.
    .replace(/\bAp\b/g, 'ap') // ap Welsh.
    .replace(/\bBen(?=\s+\w)\b/g, 'ben') // ben Hebrew or forename Ben.
    .replace(/\bDell([ae])\b/g, 'dell$1') // della and delle Italian.
    .replace(/\bD([aeiu])\b/g, 'd$1') // da, de, di Italian; du French.
    .replace(/\bDe([lr])\b/g, 'de$1') // del Italian; der Dutch/Flemish.
    .replace(/\bEl\b/g, 'el') // el Greek
    .replace(/\bLa\b/g, 'la') // la French
    .replace(/\bL([eo])\b/g, 'l$1') // lo Italian; le French.
    .replace(/\bVan(?=\s+\w)/g, 'van') // van German or forename Van.
    .replace(/\bVon\b/g, 'von'); // von Dutch/Flemish

  // Handle 'Mc' names
  // `Marty Mcfly` to `Marty McFly`
  name = name.replace(/Mc(.)/g, (_, m1) => `Mc${m1.toUpperCase()}`);

  // Handle 'O'Connor' type names
  // `Flannery O'connor` to `Flannery O'Connor`
  name = name.replace(/[A-Z]'(.)/g, (_, m1) => `O'${m1.toUpperCase()}`);

  return name;
}

export async function dispatchPasscode(
  _platform: Readonly<App.Platform> | undefined,
  user: User,
  code: string,
) {
  await sendMail({
    to: user.email,
    subject: 'Verify passcode',
    text:
      `Kiosk\r\n=====\r\nHi ${user.name}!\r\nYour verification code:\r\n` +
      `${code}\r\n\r\nAccess to your account isn't possible without this ` +
      `code, even if it hasn't been requested by you.\r\n\r\nThis email ` +
      `has been sent to ${user.email}.`,
  });
}
