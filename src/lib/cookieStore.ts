'use server'
import { getCookies, setCookie, deleteCookie, getCookie } from 'cookies-next';
import { cookies } from 'next/headers';

export const cookiedata = JSON.parse(getCookie('sessiondata', { cookies })!);