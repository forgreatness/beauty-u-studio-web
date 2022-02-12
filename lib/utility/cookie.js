import Cookies from 'js-cookie';

export function removeAllCookies() {
    const cookies = document.cookie.split(";");

    cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        Cookies.remove(name);
    })
}